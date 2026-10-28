import { WbsTask, TeamVelocityMetrics, UserWorkloadItem, DeliveryProject } from '../types';

/**
 * Calculates effort-weighted percentage completion across WBS tasks.
 */
export function calculateWbsProgress(tasks: WbsTask[]): number {
  if (!tasks || tasks.length === 0) return 0;
  
  const totalEffort = tasks.reduce((acc, t) => acc + (Number(t.estimatedHours) || 1), 0);
  const earnedEffort = tasks.reduce((acc, t) => {
    const effort = Number(t.estimatedHours) || 1;
    const progress = t.status === 'completed' ? 100 : Math.min(100, Math.max(0, Number(t.progress) || 0));
    return acc + (effort * (progress / 100));
  }, 0);

  return Math.min(100, Math.max(0, Math.round((earnedEffort / (totalEffort || 1)) * 100)));
}

/**
 * Calculates dynamic confidence score (0-100%) based on blockers, overdue tasks, and burn.
 */
export function calculateConfidenceScore(tasks: WbsTask[], project?: Partial<DeliveryProject>): number {
  if (!tasks || tasks.length === 0) return 85;

  let score = 96;
  const now = new Date();

  // 1. Penalties for active blocked tasks
  const blockedTasks = tasks.filter(t => t.status === 'blocked');
  blockedTasks.forEach(t => {
    if (t.priority === 'critical') score -= 25;
    else if (t.priority === 'high') score -= 15;
    else score -= 8;
  });

  // 2. Penalty for project-level root cause blocker
  if (project?.currentBlocker && project.currentBlocker.trim().length > 0) {
    score -= 15;
  }

  // 3. Penalty for overdue tasks
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed') return false;
    if (!t.plannedFinish) return false;
    const finishDate = new Date(t.plannedFinish);
    return !isNaN(finishDate.getTime()) && finishDate < now;
  });
  score -= Math.min(24, overdueTasks.length * 6);

  // 4. Burn budget variance penalty
  const totalAllocated = project?.hoursAllocated || tasks.reduce((acc, t) => acc + (Number(t.estimatedHours) || 0), 0);
  const totalBurned = project?.hoursBurned || tasks.reduce((acc, t) => acc + (Number(t.actualHours) || 0), 0);
  if (totalAllocated > 0 && totalBurned > totalAllocated) {
    const overrunPercent = ((totalBurned - totalAllocated) / totalAllocated) * 100;
    score -= Math.min(20, Math.round(overrunPercent / 3));
  }

  // 5. Completion velocity bonus
  const progress = calculateWbsProgress(tasks);
  if (progress > 85 && blockedTasks.length === 0) {
    score += 5;
  }

  return Math.min(99, Math.max(20, Math.round(score)));
}

/**
 * Calculates team velocity, sprint throughput, and user workloads.
 */
export function calculateTeamVelocity(tasks: WbsTask[], allocatedHours: number = 160): TeamVelocityMetrics {
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const userMap = new Map<string, UserWorkloadItem>();

  tasks.forEach(task => {
    const user = task.assignedUser;
    const userId = user?.id || user?.name || 'unassigned';
    const userName = user?.name || 'Unassigned';
    const userAvatar = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
    const userRole = user?.role || 'Engineer';

    if (!userMap.has(userId)) {
      userMap.set(userId, {
        userId,
        name: userName,
        avatar: userAvatar,
        role: userRole,
        assignedHours: 0,
        loggedHours: 0,
        completedTasks: 0,
        totalTasks: 0,
        openBlockers: 0,
        efficiencyRatio: 1.0,
      });
    }

    const item = userMap.get(userId)!;
    item.assignedHours += Number(task.estimatedHours) || 0;
    item.loggedHours += Number(task.actualHours) || 0;
    item.totalTasks += 1;
    if (task.status === 'completed') {
      item.completedTasks += 1;
    }
    if (task.status === 'blocked') {
      item.openBlockers += 1;
    }
  });

  // Calculate efficiency ratio
  userMap.forEach(item => {
    if (item.loggedHours > 0) {
      item.efficiencyRatio = Number((item.assignedHours / item.loggedHours).toFixed(2));
    } else {
      item.efficiencyRatio = 1.0;
    }
  });

  const totalLoggedHours = tasks.reduce((sum, t) => sum + (Number(t.actualHours) || 0), 0);
  const weeklyBurn = Math.round(totalLoggedHours > 0 ? (totalLoggedHours / 4) : 28);
  const targetBurn = Math.round((allocatedHours || 160) / 5);

  const blockedCount = tasks.filter(t => t.status === 'blocked').length;
  let velocityTrend: 'accelerating' | 'steady' | 'degrading' = 'steady';

  if (blockedCount >= 2 || weeklyBurn < targetBurn * 0.7) {
    velocityTrend = 'degrading';
  } else if (completedTasks.length / (tasks.length || 1) >= 0.7 && blockedCount === 0) {
    velocityTrend = 'accelerating';
  }

  return {
    weeklyBurnHours: weeklyBurn,
    targetBurnHours: targetBurn,
    tasksCompletedThisSprint: completedTasks.length,
    totalTasksInSprint: tasks.length,
    velocityTrend,
    sprintNumber: 3,
    userWorkloads: Array.from(userMap.values()),
  };
}

/**
 * Calculates predicted Go-Live Date and variance days from WBS state.
 */
export function calculatePredictedGoLive(
  baselineTargetDate: string,
  progress: number,
  confidence: number,
  velocity?: TeamVelocityMetrics
): { predictedDate: string; varianceDays: number } {
  if (progress >= 100) {
    return { predictedDate: baselineTargetDate, varianceDays: 0 };
  }

  let variance = 0;
  if (confidence < 50) {
    variance = 18;
  } else if (confidence < 70) {
    variance = 10;
  } else if (confidence < 85) {
    variance = 4;
  } else if (confidence >= 95) {
    variance = -2; // 2 days ahead
  } else {
    variance = 0;
  }

  if (velocity?.velocityTrend === 'degrading') {
    variance += 4;
  } else if (velocity?.velocityTrend === 'accelerating' && variance > 0) {
    variance = Math.max(0, variance - 3);
  }

  const base = new Date(baselineTargetDate || new Date().toISOString().split('T')[0]);
  if (!isNaN(base.getTime())) {
    base.setDate(base.getDate() + variance);
    return {
      predictedDate: base.toISOString().split('T')[0],
      varianceDays: variance,
    };
  }

  return { predictedDate: baselineTargetDate, varianceDays: variance };
}

import { WbsTask, TeamVelocityMetrics, UserWorkloadItem, DeliveryProject, BurnChartPoint } from '../types';

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

/**
 * Calculates project-specific or consolidated Burndown and Burnup series for sprint & project delivery tracking.
 */
export function calculateBurnChartSeries(
  tasks: WbsTask[],
  totalAllocatedHours?: number,
  actualBurnedHours?: number,
  baselineDate?: string
): BurnChartPoint[] {
  const taskEffortSum = tasks.reduce((sum, t) => sum + (Number(t.estimatedHours) || 8), 0);
  const totalEffort = Math.max(40, totalAllocatedHours || taskEffortSum || 160);
  
  // Calculate earned hours completed from tasks
  const earnedTaskHours = tasks.reduce((sum, t) => {
    const hours = Number(t.estimatedHours) || 8;
    const pct = t.status === 'completed' ? 100 : Number(t.progress) || 0;
    return sum + (hours * (pct / 100));
  }, 0);

  // If actualBurnedHours is provided from project record, use it for fidelity
  const burned = actualBurnedHours !== undefined && actualBurnedHours > 0 
    ? actualBurnedHours 
    : tasks.reduce((s, t) => s + (t.actualHours || 0), 0);
  
  // Progress fraction (0 to 1)
  const is100Percent = tasks.length > 0 && tasks.every(t => t.status === 'completed');
  const progressRatio = is100Percent ? 1 : totalEffort > 0 ? Math.min(0.99, earnedTaskHours / totalEffort) : 0;
  
  const intervals = 8;
  const currentInterval = is100Percent ? intervals : Math.min(intervals - 1, Math.max(1, Math.round(progressRatio * (intervals - 1))));

  const points: BurnChartPoint[] = [];

  // Parse baseline date to compute real milestone dates
  const baseTarget = baselineDate ? new Date(baselineDate) : new Date(Date.now() + 20 * 86400000);
  const startDate = new Date(baseTarget.getTime() - 40 * 86400000);

  for (let i = 0; i <= intervals; i++) {
    const fraction = i / intervals;
    const idealBurn = Math.round(totalEffort * (1 - fraction));
    
    // Scope line: check if there's scope expansion (e.g. if burned > allocated)
    const scopeExpansion = burned > totalEffort ? (burned - totalEffort) : (totalEffort * 0.05);
    const scopeAtStep = i >= 3 ? Math.round(totalEffort + (scopeExpansion * (i / intervals))) : totalEffort;

    let actualBurn: number;
    let completedScope: number;

    if (i <= currentInterval) {
      const stepProg = currentInterval > 0 ? i / currentInterval : 0;
      completedScope = Math.round(earnedTaskHours * stepProg);
      actualBurn = Math.max(0, Math.round(scopeAtStep - completedScope));
      if (is100Percent && i === intervals) {
        actualBurn = 0;
        completedScope = scopeAtStep;
      }
    } else {
      // Future projection
      const remainingToComplete = scopeAtStep - earnedTaskHours;
      const stepProg = (i - currentInterval) / (intervals - currentInterval);
      completedScope = Math.min(scopeAtStep, Math.round(earnedTaskHours + (remainingToComplete * stepProg)));
      actualBurn = Math.max(0, Math.round(scopeAtStep - completedScope));
    }

    // Generate date label
    const pointDate = new Date(startDate.getTime() + (baseTarget.getTime() - startDate.getTime()) * fraction);
    const dateFormatted = !isNaN(pointDate.getTime())
      ? pointDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : `Day ${i * 5}`;
    const dayLabel = i === 0 ? 'Start' : i === intervals ? `Target (${dateFormatted})` : dateFormatted;

    points.push({
      dayLabel,
      idealBurnRemaining: idealBurn,
      actualBurnRemaining: actualBurn,
      totalScope: scopeAtStep,
      completedScope: completedScope,
    });
  }

  return points;
}

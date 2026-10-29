import { Request, Response } from 'express';
import { MOCK_WBS_TASKS } from '../../../src/data/mockData';
import { WbsTask, DeliveryProject } from '../../../src/types';
import { deliveryProjects } from './deliveryController';
import { 
  calculateWbsProgress, 
  calculateConfidenceScore, 
  calculateTeamVelocity, 
  calculatePredictedGoLive 
} from '../../../src/utils/wbsMetrics';

// In-memory state for live WBS tasks
let wbsTasks: WbsTask[] = [...MOCK_WBS_TASKS];

export function getWbsTasksList(): WbsTask[] {
  return wbsTasks;
}

export function setWbsTasksList(tasks: WbsTask[]): void {
  wbsTasks = tasks;
}

export function resetWbsTasks(): void {
  wbsTasks = [...MOCK_WBS_TASKS];
}

/**
 * Synchronize project's executive metrics from WBS tasks.
 */
export function syncProjectFromWbs(projectId: string): DeliveryProject | undefined {
  const project = deliveryProjects.find(p => p.id === projectId);
  if (!project) return undefined;

  const projectTasks = wbsTasks.filter(t => t.projectId === projectId);
  if (projectTasks.length === 0) return project;

  const progress = calculateWbsProgress(projectTasks);
  const confidence = calculateConfidenceScore(projectTasks, project);
  const velocity = calculateTeamVelocity(projectTasks, project.hoursAllocated);
  const prediction = calculatePredictedGoLive(project.baselineTargetDate, progress, confidence, velocity);

  // Total burned hours from tasks
  const burnedFromTasks = projectTasks.reduce((sum, t) => sum + (Number(t.actualHours) || 0), 0);
  if (burnedFromTasks > project.hoursBurned) {
    project.hoursBurned = burnedFromTasks;
  }

  project.phaseProgress = progress;
  project.confidenceScore = confidence;
  project.predictedGoLiveDate = prediction.predictedDate;
  project.varianceDays = prediction.varianceDays;

  // Determine delivery health from confidence
  if (progress >= 100) {
    project.deliveryHealth = 'completed';
  } else if (confidence < 55 || project.varianceDays > 14) {
    project.deliveryHealth = 'critical';
  } else if (confidence < 75 || project.varianceDays > 7) {
    project.deliveryHealth = 'at-risk';
  } else {
    project.deliveryHealth = 'on-track';
  }

  project.wbsTasks = projectTasks;
  project.velocityMetrics = velocity;

  return project;
}

/**
 * GET /api/v1/delivery/wbs
 * Returns all WBS tasks across all projects with global velocity breakdown
 */
export const getAllWbsTasks = async (req: Request, res: Response) => {
  try {
    const globalVelocity = calculateTeamVelocity(wbsTasks, 500);
    res.json({
      success: true,
      tasks: wbsTasks,
      totalTasks: wbsTasks.length,
      globalVelocity,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/delivery/projects/:id/wbs
 * Returns WBS tasks and calculated metrics for a specific project
 */
export const getProjectWbs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = deliveryProjects.find(p => p.id === id);
    const tasks = wbsTasks.filter(t => t.projectId === id);

    const progress = calculateWbsProgress(tasks);
    const confidence = calculateConfidenceScore(tasks, project);
    const velocity = calculateTeamVelocity(tasks, project?.hoursAllocated || 160);
    const prediction = calculatePredictedGoLive(project?.baselineTargetDate || '', progress, confidence, velocity);

    res.json({
      success: true,
      projectId: id,
      projectName: project?.accountName || 'Project',
      tasks,
      progress,
      confidenceScore: confidence,
      velocity,
      prediction,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PATCH /api/v1/delivery/wbs/:taskId
 * Updates a WBS task and propagates rollups to the parent project
 */
export const updateWbsTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const updates: Partial<WbsTask> = req.body;

    const taskIndex = wbsTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ success: false, error: 'WBS Task not found' });
    }

    const currentTask = wbsTasks[taskIndex];
    const updatedTask: WbsTask = {
      ...currentTask,
      ...updates,
      lastUpdated: 'Just now',
    };

    if (updates.status === 'completed' && !updatedTask.actualFinish) {
      updatedTask.actualFinish = new Date().toISOString().split('T')[0];
      updatedTask.progress = 100;
    }

    wbsTasks[taskIndex] = updatedTask;

    // Propagate rollups to parent delivery project
    const updatedProject = syncProjectFromWbs(updatedTask.projectId);

    res.json({
      success: true,
      task: updatedTask,
      project: updatedProject,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/delivery/projects/:id/wbs
 * Creates a new WBS task under a project
 */
export const createWbsTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const taskData: Partial<WbsTask> = req.body;

    const project = deliveryProjects.find(p => p.id === id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Delivery project not found' });
    }

    const projectTasks = wbsTasks.filter(t => t.projectId === id);
    const newId = taskData.id || `${project.accountName.substring(0, 3).toUpperCase()}-WBS-${projectTasks.length + 1}`;

    const newTask: WbsTask = {
      id: newId,
      projectId: id,
      phase: taskData.phase || project.deliveryPhase || 'Phase 1: Architecture & Infosec',
      workPackage: taskData.workPackage || 'Core Implementation',
      taskName: taskData.taskName || 'New Deployment Checklist Item',
      assignedUser: taskData.assignedUser || {
        id: 'usr-fde',
        name: project.deliveryLead?.name || 'Forward Deployed Engineer',
        avatar: project.deliveryLead?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: project.deliveryLead?.title || 'FDE',
        email: 'lead@arquoncx.io',
      },
      status: taskData.status || 'not-started',
      priority: taskData.priority || 'high',
      estimatedHours: Number(taskData.estimatedHours) || 8,
      actualHours: Number(taskData.actualHours) || 0,
      progress: Number(taskData.progress) || 0,
      plannedStart: taskData.plannedStart || new Date().toISOString().split('T')[0],
      plannedFinish: taskData.plannedFinish || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      isCriticalPath: !!taskData.isCriticalPath,
      isMilestone: !!taskData.isMilestone,
      blockerNote: taskData.blockerNote,
      lastUpdated: 'Just now',
    };

    wbsTasks.push(newTask);
    const updatedProject = syncProjectFromWbs(id);

    res.status(201).json({
      success: true,
      task: newTask,
      project: updatedProject,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /api/v1/delivery/wbs/:taskId
 * Deletes a WBS task
 */
export const deleteWbsTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const taskIndex = wbsTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ success: false, error: 'WBS Task not found' });
    }

    const projectId = wbsTasks[taskIndex].projectId;
    wbsTasks.splice(taskIndex, 1);
    const updatedProject = syncProjectFromWbs(projectId);

    res.json({
      success: true,
      deletedTaskId: taskId,
      project: updatedProject,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

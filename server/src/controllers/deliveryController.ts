import { Request, Response } from 'express';
import { MOCK_DELIVERY_PROJECTS } from '../../../src/data/mockData';
import { DeliveryProject } from '../../../src/types';

// In-memory state for live mutation support during server lifetime
let deliveryProjects: DeliveryProject[] = [...MOCK_DELIVERY_PROJECTS];

/**
 * GET /api/v1/delivery/projects
 * Fetches all delivery projects with calculated executive metrics
 */
export const getDeliveryProjects = async (req: Request, res: Response) => {
  try {
    const totalProjects = deliveryProjects.length;
    const totalARR = deliveryProjects.reduce((acc, p) => acc + (Number(p.arr) || 0), 0);
    const arrAtRisk = deliveryProjects.reduce((acc, p) => acc + (Number(p.arrAtRisk) || 0), 0);
    const onTrackCount = deliveryProjects.filter(p => p.deliveryHealth === 'on-track' || p.deliveryHealth === 'completed').length;
    const onTrackPercentage = Math.round((onTrackCount / (totalProjects || 1)) * 100);
    const csuiteDecisionsCount = deliveryProjects.filter(p => !!p.csuiteActionNeeded).length;

    res.json({
      success: true,
      metrics: {
        totalProjects,
        totalARR,
        arrAtRisk,
        onTrackPercentage,
        csuiteDecisionsCount,
      },
      projects: deliveryProjects,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PATCH /api/v1/delivery/projects/:id
 * Updates delivery status, blocker, or notes
 */
export const updateDeliveryProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const projectIndex = deliveryProjects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({ success: false, error: 'Delivery project not found' });
    }

    deliveryProjects[projectIndex] = {
      ...deliveryProjects[projectIndex],
      ...updates,
      lastDailyUpdateDate: 'Just now',
    };

    res.json({
      success: true,
      project: deliveryProjects[projectIndex],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/delivery/projects/:id/predict
 * Recalculates predictive AI delivery forecast based on velocity and milestones
 */
export const predictDelivery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = deliveryProjects.find(p => p.id === id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Delivery project not found' });
    }

    // Predictive model: recalculate variance and confidence based on milestone completion ratio and blockers
    const milestones = project.milestones || [];
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const totalMilestones = milestones.length || 1;
    const milestoneVelocityRatio = completedMilestones / totalMilestones;

    let confidence = Math.round(milestoneVelocityRatio * 100);
    let variance = 0;

    if (project.currentBlocker) {
      confidence = Math.max(30, confidence - 25);
      variance = 14; // Default blocker adds ~2 weeks
    } else if (milestoneVelocityRatio > 0.8) {
      confidence = Math.min(98, confidence + 10);
      variance = -2; // 2 days ahead
    }

    const baselineDate = new Date(project.baselineTargetDate || new Date().toISOString().split('T')[0]);
    if (!isNaN(baselineDate.getTime())) {
      baselineDate.setDate(baselineDate.getDate() + variance);
      project.predictedGoLiveDate = baselineDate.toISOString().split('T')[0];
    } else {
      project.predictedGoLiveDate = project.baselineTargetDate || 'TBD';
    }

    project.confidenceScore = confidence;
    project.varianceDays = variance;
    project.deliveryHealth = variance > 10 ? 'critical' : variance > 0 ? 'at-risk' : 'on-track';

    res.json({
      success: true,
      prediction: {
        confidenceScore: confidence,
        varianceDays: variance,
        predictedGoLiveDate: project.predictedGoLiveDate,
        deliveryHealth: project.deliveryHealth,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Helper to sanitize project
 */
const sanitizeProject = (incoming: any): DeliveryProject => {
  return {
    ...incoming,
    arr: Number(incoming.arr) || 0,
    arrAtRisk: Number(incoming.arrAtRisk) || 0,
    varianceDays: Number(incoming.varianceDays) || 0,
    confidenceScore: Number(incoming.confidenceScore) || 85,
    phaseProgress: Number(incoming.phaseProgress) || 0,
    hoursAllocated: Number(incoming.hoursAllocated) || 200,
    hoursBurned: Number(incoming.hoursBurned) || 0,
    milestones: Array.isArray(incoming.milestones) ? incoming.milestones : [],
    deliveryLead: incoming.deliveryLead && typeof incoming.deliveryLead === 'object'
      ? incoming.deliveryLead
      : { name: incoming.deliveryLead || 'Unassigned', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', title: 'Forward Deployed Engineer' },
    accountCsm: incoming.accountCsm && typeof incoming.accountCsm === 'object'
      ? incoming.accountCsm
      : { name: incoming.accountCsm || 'Unassigned', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    clientSponsor: incoming.clientSponsor && typeof incoming.clientSponsor === 'object'
      ? incoming.clientSponsor
      : { name: incoming.clientSponsor || 'Client Sponsor', role: 'Executive Sponsor', email: '' },
    weeklyHighlights: incoming.weeklyHighlights || { completedThisWeek: [], plannedNextWeek: [] }
  };
};

/**
 * POST /api/v1/delivery/import
 * Imports delivery projects from Excel / CSV upload (either replace or merge)
 */
export const importDeliveryProjects = async (req: Request, res: Response) => {
  try {
    const { projects, mode } = req.body;
    if (!Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid projects provided for import' });
    }

    const sanitizedProjects = projects.map(sanitizeProject);

    if (mode === 'replace') {
      deliveryProjects = [...sanitizedProjects];
    } else {
      // Merge mode: update existing by ID/Name or append new
      sanitizedProjects.forEach((incoming: DeliveryProject) => {
        const existingIdx = deliveryProjects.findIndex(
          p => p.id === incoming.id || (p.accountName && incoming.accountName && p.accountName.toLowerCase() === incoming.accountName.toLowerCase())
        );
        if (existingIdx !== -1) {
          deliveryProjects[existingIdx] = { ...deliveryProjects[existingIdx], ...incoming };
        } else {
          deliveryProjects.push(incoming);
        }
      });
    }

    const totalProjects = deliveryProjects.length;
    const totalARR = deliveryProjects.reduce((acc, p) => acc + (Number(p.arr) || 0), 0);
    const arrAtRisk = deliveryProjects.reduce((acc, p) => acc + (Number(p.arrAtRisk) || 0), 0);
    const onTrackCount = deliveryProjects.filter(p => p.deliveryHealth === 'on-track' || p.deliveryHealth === 'completed').length;
    const onTrackPercentage = Math.round((onTrackCount / (totalProjects || 1)) * 100);
    const csuiteDecisionsCount = deliveryProjects.filter(p => !!p.csuiteActionNeeded).length;

    res.json({
      success: true,
      message: `Successfully imported ${projects.length} delivery project(s)`,
      metrics: {
        totalProjects,
        totalARR,
        arrAtRisk,
        onTrackPercentage,
        csuiteDecisionsCount,
      },
      projects: deliveryProjects,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

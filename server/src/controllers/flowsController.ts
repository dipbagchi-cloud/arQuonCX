import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getFlows(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status, type } = req.query;
    const where: any = {};

    if (status && status !== 'all') where.status = String(status);
    if (type && type !== 'all') where.type = String(type);

    const flows = await prisma.flow.findMany({
      where,
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, flows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createFlow(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      name,
      type = 'modal',
      targetAudience = 'All active users',
      triggerEvent = 'Page Load',
      steps = [],
      goalName = 'Feature Discovery',
    } = req.body;

    const orgId = req.user?.organizationId || 'org_arquoncx';
    const id = `flow-${Date.now()}`;

    const flow = await prisma.flow.create({
      data: {
        id,
        name,
        type,
        status: 'draft',
        targetAudience,
        triggerEvent,
        impressions: 0,
        completedCount: 0,
        completionRate: 0,
        dropOffRate: 0,
        goalName,
        goalConversion: 0,
        lastEdited: 'Just now',
        organizationId: orgId,
        steps: {
          create: steps.map((s: any, idx: number) => ({
            stepNumber: idx + 1,
            title: s.title || `Step ${idx + 1}`,
            content: s.content || '',
            targetElement: s.targetElement,
            buttonText: s.buttonText || 'Next',
            type: s.type || type,
          })),
        },
      },
      include: { steps: true },
    });

    res.status(201).json({ success: true, flow });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateFlow(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, targetAudience, triggerEvent, status, goalName } = req.body;

    const updated = await prisma.flow.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(targetAudience && { targetAudience }),
        ...(triggerEvent && { triggerEvent }),
        ...(status && { status }),
        ...(goalName && { goalName }),
        lastEdited: 'Just now',
      },
      include: { steps: true },
    });

    res.json({ success: true, flow: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function toggleFlowStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'live' | 'paused' | 'draft'

    if (!['live', 'paused', 'draft'].includes(status)) {
      res.status(400).json({ success: false, error: 'Status must be live, paused, or draft.' });
      return;
    }

    const updated = await prisma.flow.update({
      where: { id },
      data: { status, lastEdited: 'Just now' },
      include: { steps: true },
    });

    res.json({ success: true, flow: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteFlow(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.flow.delete({ where: { id } });
    res.json({ success: true, message: `Flow ${id} deleted successfully.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

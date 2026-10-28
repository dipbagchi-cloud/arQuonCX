import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getSurveys(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const surveys = await prisma.survey.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, surveys });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createSurvey(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { title, type = 'nps', targetSegment = 'All active users' } = req.body;
    const orgId = req.user?.organizationId || 'org_arquoncx';
    const id = `srv-${Date.now()}`;

    const survey = await prisma.survey.create({
      data: {
        id,
        title,
        type,
        responsesCount: 0,
        score: type === 'nps' ? '+50 NPS' : '4.8 / 5',
        scoreNumeric: 50,
        status: 'active',
        dateCreated: 'Today',
        targetSegment,
        organizationId: orgId,
      },
    });

    res.status(201).json({ success: true, survey });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getFeedback(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { category, sentiment, search } = req.query;
    const where: any = {};

    if (category && category !== 'all') where.category = String(category);
    if (sentiment && sentiment !== 'all') where.sentiment = String(sentiment);
    if (search) {
      where.OR = [
        { userName: { contains: String(search) } },
        { accountName: { contains: String(search) } },
        { comment: { contains: String(search) } },
      ];
    }

    const feedback = await prisma.feedbackItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const formatted = feedback.map(item => ({
      ...item,
      tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags,
    }));

    res.json({ success: true, feedback: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function triageFeedback(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, csmAssigned } = req.body;

    const updated = await prisma.feedbackItem.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(csmAssigned && { csmAssigned }),
      },
    });

    res.json({
      success: true,
      feedback: {
        ...updated,
        tags: JSON.parse(updated.tags),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

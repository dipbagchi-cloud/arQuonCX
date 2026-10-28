import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { MOCK_FUNNEL_STEPS, MOCK_RETENTION_COHORTS } from '../../../src/data/mockData';

export async function getFunnels(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    res.json({ success: true, funnels: MOCK_FUNNEL_STEPS });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCohorts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    res.json({ success: true, cohorts: MOCK_RETENTION_COHORTS });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getFeatureTags(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const tags = await prisma.featureTag.findMany({
      orderBy: { monthlyClicks: 'desc' },
    });
    res.json({ success: true, featureTags: tags });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createFeatureTag(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, selector, section } = req.body;
    const id = `ft-${Date.now()}`;

    const tag = await prisma.featureTag.create({
      data: {
        id,
        name,
        selector,
        section: section || 'General UI',
        monthlyClicks: 0,
        uniqueUsers: 0,
        adoptionPercentage: 0,
        trend: 0,
      },
    });

    res.status(201).json({ success: true, featureTag: tag });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getEndUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { accountId, search } = req.query;
    const where: any = {};

    if (accountId) where.accountId = String(accountId);
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { email: { contains: String(search) } },
        { role: { contains: String(search) } },
      ];
    }

    const users = await prisma.endUser.findMany({
      where,
      include: {
        account: {
          select: { name: true },
        },
      },
      orderBy: { lastSeen: 'asc' },
    });

    const formatted = users.map(u => ({
      ...u,
      accountName: u.account.name,
      segmentTags: typeof u.segmentTags === 'string' ? JSON.parse(u.segmentTags) : u.segmentTags,
    }));

    res.json({ success: true, users: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getAccounts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { healthTier, plan, search } = req.query;

    const where: any = {};
    if (healthTier && healthTier !== 'all') {
      where.healthTier = String(healthTier);
    }
    if (plan && plan !== 'all') {
      where.plan = String(plan);
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { domain: { contains: String(search) } },
        { csmName: { contains: String(search) } },
      ];
    }

    const accounts = await prisma.account.findMany({
      where,
      include: {
        contacts: true,
        milestones: true,
        touchpoints: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { arr: 'desc' },
    });

    const formatted = accounts.map(a => ({
      ...a,
      tags: typeof a.tags === 'string' ? JSON.parse(a.tags) : a.tags,
      healthFactors: {
        usage: a.usageScore,
        support: a.supportScore,
        nps: a.npsScore * 10,
        champion: a.championScore,
      },
    }));

    res.json({ success: true, accounts: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAccountById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        contacts: true,
        milestones: true,
        touchpoints: {
          orderBy: { createdAt: 'desc' },
        },
        endUsers: {
          take: 10,
        },
      },
    });

    if (!account) {
      res.status(404).json({ success: false, error: 'Account not found' });
      return;
    }

    const formatted = {
      ...account,
      tags: typeof account.tags === 'string' ? JSON.parse(account.tags) : account.tags,
      healthFactors: {
        usage: account.usageScore,
        support: account.supportScore,
        nps: account.npsScore * 10,
        champion: account.championScore,
      },
    };

    res.json({ success: true, account: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      name,
      domain,
      logo,
      plan = 'Enterprise',
      arr = 50000,
      csmName = 'Elena Rostova',
      tags = [],
    } = req.body;

    const orgId = req.user?.organizationId || 'org_arquoncx';
    const id = `acc-${Date.now()}`;

    const account = await prisma.account.create({
      data: {
        id,
        name,
        domain: domain || `${name.toLowerCase().replace(/\s+/g, '')}.com`,
        logo: logo || '🏢',
        plan,
        mrr: Math.round(arr / 12),
        arr,
        csmName,
        csmAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        healthScore: 80,
        healthTier: 'healthy',
        npsScore: 8,
        seatsTotal: 50,
        seatsUsed: 35,
        renewalDate: '2027-01-15',
        daysToRenewal: 90,
        tags: JSON.stringify(tags),
        usageScore: 80,
        supportScore: 85,
        championScore: 90,
        lastActiveDaysAgo: 1,
        onboardingProgress: 40,
        notes: 'Newly provisioned account via arQuonCX Customer Success API.',
        organizationId: orgId,
      },
      include: {
        contacts: true,
        milestones: true,
        touchpoints: true,
      },
    });

    res.status(201).json({
      success: true,
      account: {
        ...account,
        tags: JSON.parse(account.tags),
        healthFactors: {
          usage: account.usageScore,
          support: account.supportScore,
          nps: account.npsScore * 10,
          champion: account.championScore,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, plan, arr, csmName, notes } = req.body;

    const updated = await prisma.account.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(plan && { plan }),
        ...(arr !== undefined && { arr, mrr: Math.round(arr / 12) }),
        ...(csmName && { csmName }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        contacts: true,
        milestones: true,
        touchpoints: true,
      },
    });

    res.json({
      success: true,
      account: {
        ...updated,
        tags: JSON.parse(updated.tags),
        healthFactors: {
          usage: updated.usageScore,
          support: updated.supportScore,
          nps: updated.npsScore * 10,
          champion: updated.championScore,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.account.delete({ where: { id } });
    res.json({ success: true, message: `Account ${id} removed successfully.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function addTouchpoint(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { note, touchpointType = 'Check-in' } = req.body;

    if (!note) {
      res.status(400).json({ success: false, error: 'Touchpoint note is required.' });
      return;
    }

    const csmName = req.user?.name || 'Assigned CSM';

    const touchpoint = await prisma.touchpointLog.create({
      data: {
        note,
        touchpointType,
        csmName,
        accountId: id,
      },
    });

    res.status(201).json({ success: true, touchpoint });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function recalculateHealth(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { usage, support, champion, nps } = req.body;

    const current = await prisma.account.findUnique({ where: { id } });
    if (!current) {
      res.status(404).json({ success: false, error: 'Account not found' });
      return;
    }

    const newUsage = usage ?? current.usageScore;
    const newSupport = support ?? current.supportScore;
    const newChampion = champion ?? current.championScore;
    const newNps = nps !== undefined ? Math.round(nps / 10) : current.npsScore;

    // Weighted composite algorithm:
    // Usage: 40%, Support tickets: 20%, Champion engagement: 25%, NPS: 15%
    const compositeScore = Math.round(
      (newUsage * 0.40) +
      (newSupport * 0.20) +
      (newChampion * 0.25) +
      ((newNps * 10) * 0.15)
    );

    let tier = 'neutral';
    if (compositeScore >= 75) tier = 'healthy';
    else if (compositeScore < 50) tier = 'at-risk';

    const updated = await prisma.account.update({
      where: { id },
      data: {
        healthScore: compositeScore,
        healthTier: tier,
        usageScore: newUsage,
        supportScore: newSupport,
        championScore: newChampion,
        npsScore: newNps,
      },
    });

    res.json({
      success: true,
      healthScore: updated.healthScore,
      healthTier: updated.healthTier,
      healthFactors: {
        usage: updated.usageScore,
        support: updated.supportScore,
        champion: updated.championScore,
        nps: updated.npsScore * 10,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

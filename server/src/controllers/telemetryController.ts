import { Request, Response } from 'express';
import { prisma } from '../config/db';

export async function identifyUser(req: Request, res: Response): Promise<void> {
  try {
    const { userId, email, name, accountId, traits } = req.body;

    if (!userId || !accountId) {
      res.status(400).json({ success: false, error: 'userId and accountId are required' });
      return;
    }

    const existingAccount = await prisma.account.findUnique({ where: { id: accountId } });
    if (!existingAccount) {
      res.status(404).json({ success: false, error: `Account ${accountId} not recognized` });
      return;
    }

    const user = await prisma.endUser.upsert({
      where: { id: userId },
      update: {
        lastSeen: 'Just now',
        totalSessions: { increment: 1 },
        ...(name && { name }),
        ...(email && { email }),
      },
      create: {
        id: userId,
        name: name || 'Anonymous User',
        email: email || `${userId}@clientapp.com`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        accountId,
        role: traits?.role || 'User',
        healthScore: 85,
        healthTier: 'healthy',
        lastSeen: 'Just now',
        totalSessions: 1,
        featureAdoptionCount: 1,
        segmentTags: JSON.stringify(traits?.tags || ['SDK User']),
        joinedDate: 'Today',
        plan: existingAccount.plan,
      },
    });

    res.json({ success: true, identified: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function trackEvent(req: Request, res: Response): Promise<void> {
  try {
    const { eventName, selector, userId, accountId } = req.body;

    // If an element selector was clicked, increment feature tag metrics
    if (selector) {
      const tag = await prisma.featureTag.findFirst({
        where: { selector },
      });

      if (tag) {
        await prisma.featureTag.update({
          where: { id: tag.id },
          data: {
            monthlyClicks: { increment: 1 },
          },
        });
      }
    }

    res.json({
      success: true,
      tracked: true,
      event: eventName,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function recordFlowEvent(req: Request, res: Response): Promise<void> {
  try {
    const { flowId, eventType } = req.body; // 'impression' | 'completed' | 'dismissed'

    if (!flowId) {
      res.status(400).json({ success: false, error: 'flowId is required' });
      return;
    }

    const flow = await prisma.flow.findUnique({ where: { id: flowId } });
    if (!flow) {
      res.status(404).json({ success: false, error: 'Flow not found' });
      return;
    }

    const isImpression = eventType === 'impression';
    const isCompleted = eventType === 'completed';

    const newImpressions = flow.impressions + (isImpression ? 1 : 0);
    const newCompleted = flow.completedCount + (isCompleted ? 1 : 0);
    const newRate = newImpressions > 0 ? Math.round((newCompleted / newImpressions) * 100) : 0;

    const updated = await prisma.flow.update({
      where: { id: flowId },
      data: {
        impressions: newImpressions,
        completedCount: newCompleted,
        completionRate: newRate,
        dropOffRate: Math.max(0, 100 - newRate),
      },
    });

    res.json({ success: true, flow: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function submitSurvey(req: Request, res: Response): Promise<void> {
  try {
    const { surveyId, score, comment, userName, accountName } = req.body;

    const survey = await prisma.survey.findUnique({ where: { id: surveyId } });
    if (!survey) {
      res.status(404).json({ success: false, error: 'Survey not found' });
      return;
    }

    const numericScore = parseInt(score, 10) || 8;
    let category = 'passive';
    let sentiment = 'neutral';

    if (numericScore >= 9) {
      category = 'promoter';
      sentiment = 'positive';
    } else if (numericScore <= 6) {
      category = 'detractor';
      sentiment = 'negative';
    }

    const feedback = await prisma.feedbackItem.create({
      data: {
        id: `fb-${Date.now()}`,
        userName: userName || 'Customer Respondent',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        accountName: accountName || 'Enterprise Client',
        score: numericScore,
        category,
        tags: JSON.stringify([category === 'promoter' ? 'Advocate' : category === 'detractor' ? 'Churn Risk' : 'Neutral']),
        comment: comment || 'Submitted via in-app survey widget.',
        sentiment,
        csmAssigned: 'Elena Rostova',
        status: category === 'detractor' ? 'open' : 'addressed',
        date: 'Just now',
        surveyId: survey.id,
      },
    });

    await prisma.survey.update({
      where: { id: surveyId },
      data: {
        responsesCount: { increment: 1 },
      },
    });

    res.status(201).json({ success: true, feedback });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

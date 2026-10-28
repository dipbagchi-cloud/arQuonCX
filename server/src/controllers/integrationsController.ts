import { Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getIntegrations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const integrations = await prisma.integration.findMany();
    res.json({ success: true, integrations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function toggleIntegration(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const current = await prisma.integration.findUnique({ where: { id } });

    if (!current) {
      res.status(404).json({ success: false, error: 'Integration not found' });
      return;
    }

    const nextStatus = current.status === 'connected' ? 'disconnected' : 'connected';
    const updated = await prisma.integration.update({
      where: { id },
      data: {
        status: nextStatus,
        lastSync: nextStatus === 'connected' ? 'Just now' : undefined,
      },
    });

    res.json({ success: true, integration: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getApiKeys(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const keys = await prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, apiKeys: keys });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createApiKey(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, environment = 'production' } = req.body;
    const orgId = req.user?.organizationId || 'org_arquoncx';
    const randomHex = crypto.randomBytes(12).toString('hex');
    const key = `aq_${environment === 'production' ? 'live' : 'test'}_${randomHex}`;

    const newKey = await prisma.apiKey.create({
      data: {
        name: name || `${environment} Ingestion Key`,
        key,
        environment,
        organizationId: orgId,
      },
    });

    res.status(201).json({ success: true, apiKey: newKey });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { generateToken, AuthenticatedRequest } from '../middleware/auth';
import { ROLE_PERMISSIONS, RoleName } from '../middleware/rbac';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    // Check password if provided (allow default password123)
    if (password) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match && password !== 'password123') {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
    });

    const permissions = ROLE_PERMISSIONS[user.role as RoleName] || [];

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        title: user.title,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          plan: user.organization.plan,
        },
      },
      permissions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { organization: true },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const permissions = ROLE_PERMISSIONS[user.role as RoleName] || [];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        title: user.title,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          plan: user.organization.plan,
        },
      },
      permissions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Dev helper to instantly test RBAC permissions across different personas
export async function switchRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { role } = req.body;
    const validRoles: RoleName[] = ['SUPER_ADMIN', 'CS_OPS', 'CSM', 'PRODUCT_GROWTH', 'VIEWER'];

    if (!role || !validRoles.includes(role.toUpperCase())) {
      res.status(400).json({
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
      return;
    }

    const targetRole = role.toUpperCase() as RoleName;

    // Find the persona user for that role or update current user
    const personaUser = await prisma.user.findFirst({
      where: { role: targetRole },
      include: { organization: true },
    });

    const activeUser = personaUser || (req.user
      ? await prisma.user.update({
          where: { id: req.user.id },
          data: { role: targetRole },
          include: { organization: true },
        })
      : null);

    if (!activeUser) {
      res.status(404).json({ success: false, error: 'Persona user not found' });
      return;
    }

    const token = generateToken({
      id: activeUser.id,
      email: activeUser.email,
      name: activeUser.name,
      role: activeUser.role,
      organizationId: activeUser.organizationId,
    });

    const permissions = ROLE_PERMISSIONS[activeUser.role as RoleName] || [];

    res.json({
      success: true,
      message: `Switched active RBAC role to ${targetRole}`,
      token,
      user: {
        id: activeUser.id,
        email: activeUser.email,
        name: activeUser.name,
        avatar: activeUser.avatar,
        role: activeUser.role,
        title: activeUser.title,
        organization: {
          id: activeUser.organization.id,
          name: activeUser.organization.name,
          plan: activeUser.organization.plan,
        },
      },
      permissions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function listStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const staff = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        title: true,
      },
      orderBy: { role: 'asc' },
    });

    res.json({ success: true, staff });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export type RoleName = 'SUPER_ADMIN' | 'CS_OPS' | 'CSM' | 'PRODUCT_GROWTH' | 'VIEWER';

export type Permission =
  | 'account:read'
  | 'account:write'
  | 'account:delete'
  | 'account:touchpoint'
  | 'flow:read'
  | 'flow:write'
  | 'flow:publish'
  | 'flow:delete'
  | 'survey:read'
  | 'survey:write'
  | 'survey:publish'
  | 'survey:triage'
  | 'analytics:read'
  | 'analytics:export'
  | 'analytics:tag'
  | 'resource_center:read'
  | 'resource_center:manage'
  | 'integrations:manage'
  | 'api_keys:manage'
  | 'team:manage'
  | 'audit:read';

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  SUPER_ADMIN: [
    'account:read', 'account:write', 'account:delete', 'account:touchpoint',
    'flow:read', 'flow:write', 'flow:publish', 'flow:delete',
    'survey:read', 'survey:write', 'survey:publish', 'survey:triage',
    'analytics:read', 'analytics:export', 'analytics:tag',
    'resource_center:read', 'resource_center:manage',
    'integrations:manage', 'api_keys:manage', 'team:manage', 'audit:read',
  ],
  CS_OPS: [
    'account:read', 'account:write', 'account:delete', 'account:touchpoint',
    'flow:read', 'flow:write', 'flow:publish', 'flow:delete',
    'survey:read', 'survey:write', 'survey:publish', 'survey:triage',
    'analytics:read', 'analytics:export', 'analytics:tag',
    'resource_center:read', 'resource_center:manage',
    'integrations:manage', 'api_keys:manage', 'team:manage', 'audit:read',
  ],
  CSM: [
    'account:read', 'account:write', 'account:touchpoint',
    'flow:read',
    'survey:read', 'survey:triage',
    'analytics:read', 'analytics:export',
    'resource_center:read',
  ],
  PRODUCT_GROWTH: [
    'account:read',
    'flow:read', 'flow:write', 'flow:publish', 'flow:delete',
    'survey:read', 'survey:write', 'survey:publish',
    'analytics:read', 'analytics:export', 'analytics:tag',
    'resource_center:read', 'resource_center:manage',
  ],
  VIEWER: [
    'account:read',
    'flow:read',
    'survey:read',
    'analytics:read',
    'resource_center:read',
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const normalizedRole = role.toUpperCase() as RoleName;
  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  return permissions.includes(permission);
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized: No active user session.' });
      return;
    }

    if (!hasPermission(req.user.role, permission)) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Role '${req.user.role}' lacks required permission '${permission}'.`,
        requiredPermission: permission,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
}

export function requireRole(...allowedRoles: RoleName[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized: No active user session.' });
      return;
    }

    const normalizedRole = req.user.role.toUpperCase() as RoleName;
    if (!allowedRoles.includes(normalizedRole)) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Allowed roles [${allowedRoles.join(', ')}] - user has '${req.user.role}'`,
      });
      return;
    }

    next();
  };
}

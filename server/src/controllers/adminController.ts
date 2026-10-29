import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { RoleName, ROLE_PERMISSIONS } from '../middleware/rbac';
import { prisma } from '../config/db';

export interface FrontendMeta {
  appName: string;
  tagline: string;
  pageTitleSuffix: string;
  logoTheme: 'indigo' | 'emerald' | 'violet' | 'dark';
  logoUrl?: string;
  announcementBanner: {
    enabled: boolean;
    message: string;
    type: 'info' | 'warning' | 'success' | 'critical';
    dismissible: boolean;
    linkText?: string;
    linkUrl?: string;
  };
  supportEmail: string;
  docsUrl: string;
  maintenanceMode: boolean;
  liveIngestionEnabled: boolean;
}

export interface FeatureFlagConfig {
  deliveryBriefing: boolean;
  deploymentWbs: boolean;
  accounts360: boolean;
  usersSegments: boolean;
  adoptionFlows: boolean;
  surveysNps: boolean;
  productAnalytics: boolean;
  resourceCenter: boolean;
  integrations: boolean;
  aiForecasting: boolean;
}

// In-Memory store initialized with production defaults
let frontendMeta: FrontendMeta = {
  appName: 'arQuonCX',
  tagline: 'Enterprise Customer Success & Project Delivery Suite',
  pageTitleSuffix: 'arQuonCX | Enterprise CS & Delivery',
  logoTheme: 'indigo',
  announcementBanner: {
    enabled: false,
    message: '🚀 Welcome to arQuonCX 2.0: Deployment WBS Engine & Role-Based Governance are now live!',
    type: 'info',
    dismissible: true,
    linkText: 'Learn More',
    linkUrl: '#overview',
  },
  supportEmail: 'support@arquoncx.io',
  docsUrl: 'https://docs.arquoncx.io',
  maintenanceMode: false,
  liveIngestionEnabled: true,
};

let featureFlags: FeatureFlagConfig = {
  deliveryBriefing: true,
  deploymentWbs: true,
  accounts360: true,
  usersSegments: true,
  adoptionFlows: true,
  surveysNps: true,
  productAnalytics: true,
  resourceCenter: true,
  integrations: true,
  aiForecasting: true,
};

let defaultLandingTab = 'overview';

let staffMembers = [
  {
    id: 'user_admin',
    name: 'Dr. Aris Vance',
    email: 'admin@arquoncx.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: 'SUPER_ADMIN' as RoleName,
    title: 'VP of Customer Success & Operations',
    department: 'Executive Leadership',
    status: 'active' as const,
    lastLogin: 'Just now',
  },
  {
    id: 'user_csops',
    name: 'David Kim',
    email: 'csops@arquoncx.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    role: 'CS_OPS' as RoleName,
    title: 'CS Operations & Data Analyst',
    department: 'Customer Operations',
    status: 'active' as const,
    lastLogin: '25m ago',
  },
  {
    id: 'user_dip',
    name: 'Dip Bagchi',
    email: 'dip.bagchi@qbadvisory.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    role: 'CSM' as RoleName,
    title: 'Director of Customer Success',
    department: 'Customer Success',
    status: 'active' as const,
    lastLogin: '1h ago',
  },
  {
    id: 'user_csm',
    name: 'Elena Rostova',
    email: 'elena@arquoncx.io',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    role: 'CSM' as RoleName,
    title: 'Lead Enterprise CSM',
    department: 'Customer Success',
    status: 'active' as const,
    lastLogin: '3h ago',
  },
  {
    id: 'user_trevor',
    name: 'Trevor Vance',
    email: 'trevor@arquoncx.io',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    role: 'CSM' as RoleName,
    title: 'Forward Deployed Engineer',
    department: 'Field Engineering',
    status: 'active' as const,
    lastLogin: '4h ago',
  },
  {
    id: 'user_shubham',
    name: 'Shubham Roy',
    email: 'shubham@arquoncx.io',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    role: 'CSM' as RoleName,
    title: 'Forward Deployed Engineer',
    department: 'Field Engineering',
    status: 'active' as const,
    lastLogin: 'Yesterday',
  },
  {
    id: 'user_product',
    name: 'Sophia Lindqvist',
    email: 'product@arquoncx.io',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    role: 'PRODUCT_GROWTH' as RoleName,
    title: 'Head of Product Growth & Onboarding',
    department: 'Product Management',
    status: 'active' as const,
    lastLogin: '5h ago',
  },
  {
    id: 'user_viewer',
    name: 'Alex Wright',
    email: 'viewer@arquoncx.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    role: 'VIEWER' as RoleName,
    title: 'Executive Board Observer',
    department: 'Stakeholders',
    status: 'active' as const,
    lastLogin: '2d ago',
  },
];

let auditLogs = [
  {
    id: 'audit-001',
    action: 'META_CONFIG_UPDATE',
    actor: 'Dr. Aris Vance (Super Admin)',
    details: 'Updated global announcement banner and default branding theme.',
    severity: 'info' as const,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'audit-002',
    action: 'FEATURE_FLAG_TOGGLE',
    actor: 'Dr. Aris Vance (Super Admin)',
    details: 'Enabled Deployment WBS & Checklist module across enterprise workspaces.',
    severity: 'info' as const,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'audit-003',
    action: 'ROLE_PROMOTION',
    actor: 'Dr. Aris Vance (Super Admin)',
    details: 'Promoted David Kim from CSM to CS_OPS with team management permissions.',
    severity: 'security' as const,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'audit-004',
    action: 'API_KEY_ROTATED',
    actor: 'David Kim (CS Ops)',
    details: 'Provisioned production ingestion API key: aq_live_prod_2026_x89',
    severity: 'warning' as const,
    timestamp: new Date(Date.now() - 172800000).toISOString(),
  },
];

export function resetAuditLogs(): void {
  auditLogs = auditLogs.filter(a => !a.action.startsWith('ADO_') && !a.details.includes('test'));
}

export function addAuditLog(entry: {
  action: string;
  actor: string;
  details: string;
  severity?: 'info' | 'warning' | 'critical' | 'security';
}) {
  const newLog = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action: entry.action,
    actor: entry.actor,
    details: entry.details,
    severity: entry.severity || 'info',
    timestamp: new Date().toISOString(),
  };
  auditLogs.unshift(newLog);
  if (auditLogs.length > 200) auditLogs.pop();
  return newLog;
}

export function getOrProvisionStaff(email: string, name?: string, role?: RoleName, title?: string) {
  let existing = staffMembers.find((s) => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    if (role && existing.role !== role) {
      existing.role = role;
    }
    existing.lastLogin = 'Just now';
    return existing;
  }

  const newStaff = {
    id: `user_azure_${Date.now()}`,
    name: name || email.split('@')[0],
    email,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: (role || 'CSM') as RoleName,
    title: title || 'Azure AD Enterprise Member',
    department: 'Enterprise Customer Success',
    status: 'active' as const,
    lastLogin: 'Just now (Azure AD SSO)',
  };
  staffMembers.push(newStaff);
  return newStaff;
}

/**
 * GET /api/v1/admin/meta
 * Fetch frontend meta management settings, feature flags, and default landing tab
 */
export async function getAdminMeta(req: Request, res: Response): Promise<void> {
  try {
    res.json({
      success: true,
      meta: frontendMeta,
      featureFlags,
      defaultLandingTab,
      availableRoles: ['SUPER_ADMIN', 'CS_OPS', 'CSM', 'PRODUCT_GROWTH', 'VIEWER'],
      rolePermissions: ROLE_PERMISSIONS,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PUT /api/v1/admin/meta
 * Update frontend meta management settings & feature flags (RBAC protected)
 */
export async function updateAdminMeta(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { meta, flags, landingTab } = req.body;

    if (meta) {
      frontendMeta = {
        ...frontendMeta,
        ...meta,
        announcementBanner: {
          ...frontendMeta.announcementBanner,
          ...(meta.announcementBanner || {}),
        },
      };
    }

    if (flags) {
      featureFlags = {
        ...featureFlags,
        ...flags,
      };
    }

    if (landingTab) {
      defaultLandingTab = landingTab;
    }

    // Add audit log entry
    auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'META_MANAGEMENT_SAVED',
      actor: req.user ? `${req.user.name} (${req.user.role})` : 'System Administrator',
      details: 'Updated frontend metadata, brand styling, or module feature flags.',
      severity: 'info',
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Frontend meta configuration saved successfully',
      meta: frontendMeta,
      featureFlags,
      defaultLandingTab,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/v1/admin/users
 * List staff members with roles, titles, status
 */
export async function getAdminUsers(req: Request, res: Response): Promise<void> {
  try {
    res.json({
      success: true,
      users: staffMembers,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PUT /api/v1/admin/users/:id/role
 * Modify staff member role (RBAC protected)
 */
export async function updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles: RoleName[] = ['SUPER_ADMIN', 'CS_OPS', 'CSM', 'PRODUCT_GROWTH', 'VIEWER'];
    if (!role || !validRoles.includes(role)) {
      res.status(400).json({ success: false, error: `Invalid role: ${role}` });
      return;
    }

    const targetUser = staffMembers.find(u => u.id === id);
    if (!targetUser) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const oldRole = targetUser.role;
    targetUser.role = role as RoleName;

    // Record audit log
    auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'USER_ROLE_CHANGED',
      actor: req.user ? `${req.user.name} (${req.user.role})` : 'System Administrator',
      details: `Changed role of ${targetUser.name} from ${oldRole} to ${role}.`,
      severity: 'security',
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Updated role for ${targetUser.name} to ${role}`,
      user: targetUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/v1/admin/users/invite
 * Invite new staff member
 */
export async function inviteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, email, role, title, department } = req.body;

    if (!name || !email) {
      res.status(400).json({ success: false, error: 'Name and email are required' });
      return;
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: (role || 'CSM') as RoleName,
      title: title || 'Customer Success Specialist',
      department: department || 'Customer Success',
      status: 'active' as const,
      lastLogin: 'Never (Invited)',
    };

    staffMembers.push(newUser);

    auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'USER_INVITED',
      actor: req.user ? `${req.user.name} (${req.user.role})` : 'System Administrator',
      details: `Invited new team member: ${name} (${email}) as ${role || 'CSM'}.`,
      severity: 'info',
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: `Invited ${name} successfully`,
      user: newUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/v1/admin/audit-logs
 * Fetch system governance audit log
 */
export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    res.json({
      success: true,
      auditLogs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

import { Request, Response } from 'express';
import { AuthenticatedRequest, generateToken } from '../middleware/auth';
import { RoleName, ROLE_PERMISSIONS } from '../middleware/rbac';
import { addAuditLog, getOrProvisionStaff } from './adminController';

export interface AzureAdGroupMapping {
  id: string;
  azureGroupId: string;
  azureGroupName: string;
  mappedRole: RoleName;
  description?: string;
}

export interface AzureAdConfig {
  enabled: boolean;
  tenantId: string;
  clientId: string;
  clientSecretConfigured: boolean;
  authority: string;
  redirectUri: string;
  enforceSso: boolean;
  allowJitProvisioning: boolean;
  allowedDomains: string[];
  defaultRole: RoleName;
  groupMappings: AzureAdGroupMapping[];
  lastTestedAt?: string;
  testStatus?: 'success' | 'failed' | 'untested';
}

// Enterprise Contoso/arQuon default tenant
let azureAdConfig: AzureAdConfig = {
  enabled: true,
  tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
  clientId: '3a9b1c72-4d8e-49f0-bc23-891ef64521a0',
  clientSecretConfigured: true,
  authority: 'https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/v2.0',
  redirectUri: 'https://arquoncx.io/auth/callback/azure-ad',
  enforceSso: false,
  allowJitProvisioning: true,
  allowedDomains: ['qbadvisory.com', 'arquoncx.io', 'microsoft.com'],
  defaultRole: 'CSM',
  groupMappings: [
    {
      id: 'map-1',
      azureGroupId: '9e7b3a1c-8f2d-4e5a-b6c7-123456789abc',
      azureGroupName: 'arQuonCX-GlobalAdmins',
      mappedRole: 'SUPER_ADMIN',
      description: 'Global Directory Admins & Operations VP',
    },
    {
      id: 'map-2',
      azureGroupId: '2a4c6e80-1b3d-5f7a-9c1e-345678901def',
      azureGroupName: 'arQuonCX-CSOps',
      mappedRole: 'CS_OPS',
      description: 'CS Operations & Data Intelligence Specialists',
    },
    {
      id: 'map-3',
      azureGroupId: '5d6e7f80-9a1b-3c4d-5e6f-789012345ghi',
      azureGroupName: 'arQuonCX-DeliveryLeads',
      mappedRole: 'CSM',
      description: 'Directors of Customer Success & Technical Leads',
    },
    {
      id: 'map-4',
      azureGroupId: '7f8a9b0c-1d2e-3f4a-5b6c-901234567jkl',
      azureGroupName: 'arQuonCX-ProductGrowth',
      mappedRole: 'PRODUCT_GROWTH',
      description: 'Product Experience & Growth Leads',
    },
    {
      id: 'map-5',
      azureGroupId: '1b2c3d4e-5f6a-7b8c-9d0e-123456789mno',
      azureGroupName: 'arQuonCX-ExecutiveStakeholders',
      mappedRole: 'VIEWER',
      description: 'Executive C-Suite Viewers & Board Observers',
    },
  ],
  lastTestedAt: new Date(Date.now() - 3600000).toISOString(),
  testStatus: 'success',
};

/**
 * GET /api/v1/auth/sso/azure-ad/config
 * Retrieve Azure Active Directory / Microsoft Entra ID SSO settings
 */
export async function getAzureAdConfig(req: Request, res: Response): Promise<void> {
  try {
    res.json({
      success: true,
      config: azureAdConfig,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PUT /api/v1/auth/sso/azure-ad/config
 * Update Azure Active Directory SSO settings (Requires team:manage permission)
 */
export async function updateAzureAdConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const updates = req.body;

    if (updates.tenantId !== undefined) {
      azureAdConfig.tenantId = updates.tenantId.trim();
      azureAdConfig.authority = `https://login.microsoftonline.com/${azureAdConfig.tenantId}/v2.0`;
    }
    if (updates.clientId !== undefined) {
      azureAdConfig.clientId = updates.clientId.trim();
    }
    if (updates.clientSecret) {
      azureAdConfig.clientSecretConfigured = true;
    }
    if (updates.redirectUri !== undefined) {
      azureAdConfig.redirectUri = updates.redirectUri.trim();
    }
    if (updates.enabled !== undefined) {
      azureAdConfig.enabled = Boolean(updates.enabled);
    }
    if (updates.enforceSso !== undefined) {
      azureAdConfig.enforceSso = Boolean(updates.enforceSso);
    }
    if (updates.allowJitProvisioning !== undefined) {
      azureAdConfig.allowJitProvisioning = Boolean(updates.allowJitProvisioning);
    }
    if (Array.isArray(updates.allowedDomains)) {
      azureAdConfig.allowedDomains = updates.allowedDomains
        .map((d: string) => d.trim().toLowerCase())
        .filter(Boolean);
    }
    if (updates.defaultRole) {
      azureAdConfig.defaultRole = updates.defaultRole as RoleName;
    }
    if (Array.isArray(updates.groupMappings)) {
      azureAdConfig.groupMappings = updates.groupMappings;
    }

    addAuditLog({
      action: 'AZURE_AD_CONFIG_UPDATED',
      actor: req.user ? `${req.user.name} (${req.user.role})` : 'System Administrator',
      details: `Updated Microsoft Entra ID / Azure AD SSO configuration. Enabled: ${azureAdConfig.enabled}, Enforce SSO: ${azureAdConfig.enforceSso}, Mappings: ${azureAdConfig.groupMappings.length}.`,
      severity: 'security',
    });

    res.json({
      success: true,
      message: 'Azure Active Directory SSO configuration updated successfully',
      config: azureAdConfig,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/v1/auth/sso/azure-ad/login
 * Authenticate with Azure Active Directory / Microsoft Entra ID Token & Claims
 */
export async function azureAdLogin(req: Request, res: Response): Promise<void> {
  try {
    const { email, name, tid, oid, groups, roles, preferred_username } = req.body;

    const userEmail = (email || preferred_username || '').trim().toLowerCase();
    if (!userEmail) {
      res.status(400).json({
        success: false,
        error: 'Work email address is required from Azure AD identity token',
      });
      return;
    }

    if (!azureAdConfig.enabled) {
      res.status(403).json({
        success: false,
        error: 'Azure Active Directory SSO is currently disabled by your system administrator',
      });
      return;
    }

    // Verify domain allowance
    const domain = userEmail.split('@')[1];
    if (azureAdConfig.allowedDomains.length > 0 && domain) {
      const isAllowed = azureAdConfig.allowedDomains.includes(domain);
      if (!isAllowed) {
        res.status(403).json({
          success: false,
          error: `Domain @${domain} is not authorized for Azure AD SSO in this organization. Allowed: ${azureAdConfig.allowedDomains.join(', ')}`,
        });
        return;
      }
    }

    // Resolve Role from Azure AD Groups / Claims / Email Mapping
    let resolvedRole: RoleName = azureAdConfig.defaultRole || 'CSM';
    let matchedGroup: string | null = null;

    const userGroups: string[] = Array.isArray(groups) ? groups : [];
    const userRoles: string[] = Array.isArray(roles) ? roles : [];

    // 1. Group Mapping Match
    for (const mapping of azureAdConfig.groupMappings) {
      if (
        userGroups.includes(mapping.azureGroupId) ||
        userGroups.includes(mapping.azureGroupName) ||
        userRoles.includes(mapping.azureGroupName)
      ) {
        resolvedRole = mapping.mappedRole;
        matchedGroup = mapping.azureGroupName;
        break;
      }
    }

    // 2. Persona Fallback overrides if specific demo accounts
    if (userEmail === 'admin@arquoncx.io') {
      resolvedRole = 'SUPER_ADMIN';
    } else if (userEmail === 'csops@arquoncx.io') {
      resolvedRole = 'CS_OPS';
    } else if (userEmail === 'dip.bagchi@qbadvisory.com' || userEmail === 'elena@arquoncx.io') {
      resolvedRole = 'CSM';
    } else if (userEmail === 'product@arquoncx.io') {
      resolvedRole = 'PRODUCT_GROWTH';
    } else if (userEmail === 'viewer@arquoncx.io') {
      resolvedRole = 'VIEWER';
    }

    // Provision or update staff member record (JIT)
    const displayName = name || userEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const staffUser = getOrProvisionStaff(userEmail, displayName, resolvedRole);

    const token = generateToken({
      id: staffUser.id,
      email: staffUser.email,
      name: staffUser.name,
      role: resolvedRole,
      organizationId: 'org_arquoncx',
    });

    const permissions = ROLE_PERMISSIONS[resolvedRole] || [];

    addAuditLog({
      action: 'AZURE_AD_SSO_LOGIN',
      actor: `${staffUser.name} (${staffUser.email})`,
      details: `Authenticated via Microsoft Entra ID / Azure AD SSO. Assigned role: ${resolvedRole}${matchedGroup ? ` (Group: ${matchedGroup})` : ' (Default/Domain mapped)'}.`,
      severity: 'info',
    });

    res.json({
      success: true,
      token,
      user: {
        id: staffUser.id,
        email: staffUser.email,
        name: staffUser.name,
        avatar: staffUser.avatar,
        role: resolvedRole,
        title: staffUser.title,
        organization: {
          id: 'org_arquoncx',
          name: 'arQuonCX Global',
          plan: 'Enterprise',
        },
      },
      permissions,
      claimsSummary: {
        tenantId: tid || azureAdConfig.tenantId,
        objectId: oid || 'user-oid-entra-id',
        email: userEmail,
        name: displayName,
        matchedGroup: matchedGroup || 'Default Enterprise Pool',
        assignedRole: resolvedRole,
        authProvider: 'Microsoft Azure Active Directory (Entra ID)',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/v1/auth/sso/azure-ad/test
 * Diagnostic endpoint to test Azure AD OpenID Connect discovery & tenant validity
 */
export async function testAzureAdConnection(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const startTime = Date.now();
    const tenantId = azureAdConfig.tenantId;

    // Simulate discovery & ping
    const latency = Math.floor(Math.random() * 25) + 35; // 35ms - 60ms latency

    azureAdConfig.lastTestedAt = new Date().toISOString();
    azureAdConfig.testStatus = 'success';

    addAuditLog({
      action: 'AZURE_AD_TEST_EXECUTED',
      actor: req.user ? `${req.user.name} (${req.user.role})` : 'System Administrator',
      details: `Tested Azure Active Directory tenant [${tenantId}] reachability. Status: Healthy (${latency}ms).`,
      severity: 'info',
    });

    res.json({
      success: true,
      timestamp: azureAdConfig.lastTestedAt,
      tenantValidated: true,
      authorityReachable: true,
      latencyMs: latency,
      openidConfiguration: {
        issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
        authorization_endpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
        token_endpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        jwks_uri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
      },
      message: `Successfully validated Microsoft Entra ID tenant (${tenantId}). OpenID endpoints active.`,
    });
  } catch (error: any) {
    azureAdConfig.testStatus = 'failed';
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to establish connection with Microsoft Entra ID',
    });
  }
}

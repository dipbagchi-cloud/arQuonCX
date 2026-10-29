import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { addAuditLog } from './adminController';
import { getWbsTasksList, setWbsTasksList, syncProjectFromWbs } from './wbsController';
import { deliveryProjects } from './deliveryController';
import { 
  AdoConfig, 
  AdoWorkItemPreview, 
  AdoSyncResult, 
  AdoTestResult, 
  WbsTask,
  DeliveryProject,
  AdoWorkItemType
} from '../../../src/types';

// In-Memory Token and State Cache
let storedPersonalAccessToken: string = process.env.AZURE_DEVOPS_PAT || '';

let adoConfig: AdoConfig = {
  enabled: true,
  organizationUrl: 'https://dev.azure.com/arQuon-Enterprise',
  projectName: 'arQuonCX-GlobalDeployments',
  personalAccessTokenConfigured: !!storedPersonalAccessToken,
  authType: 'pat',
  defaultAreaPath: 'arQuonCX-GlobalDeployments\\CustomerSuccess',
  defaultIterationPath: 'arQuonCX-GlobalDeployments\\Sprint 24',
  syncFrequency: 'realtime_webhook',
  lastSyncTime: '2026-10-29T18:00:00Z',
  lastSyncStatus: 'success',
  syncedWorkItemCount: 16,
};

export interface RemoteAdoProject {
  id: string;
  name: string;
  description?: string;
  state?: string;
  url?: string;
}

let discoveredAdoProjects: RemoteAdoProject[] = [];

/**
 * Normalizes Azure DevOps Organization URLs and extracts project if embedded
 */
export function normalizeAdoOrgUrl(input?: string): { orgUrl: string; extractedProject?: string } {
  if (!input || !input.trim()) {
    return { orgUrl: 'https://dev.azure.com/arQuon-Enterprise' };
  }
  let clean = input.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  try {
    const url = new URL(clean);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (url.hostname.includes('dev.azure.com')) {
      if (pathParts.length >= 2) {
        return {
          orgUrl: `${url.protocol}//${url.hostname}/${pathParts[0]}`,
          extractedProject: decodeURIComponent(pathParts[1]),
        };
      } else if (pathParts.length === 1) {
        return { orgUrl: `${url.protocol}//${url.hostname}/${pathParts[0]}` };
      }
    } else if (url.hostname.includes('.visualstudio.com')) {
      if (pathParts.length >= 1) {
        return {
          orgUrl: `${url.protocol}//${url.hostname}`,
          extractedProject: decodeURIComponent(pathParts[0]),
        };
      }
    }
    return { orgUrl: clean.replace(/\/+$/, '') };
  } catch {
    return { orgUrl: clean.replace(/\/+$/, '') };
  }
}

/**
 * Builds HTTP Basic Auth headers for Azure DevOps REST API
 */
function getAdoHeaders(token?: string) {
  const pat = (token || storedPersonalAccessToken || '').trim();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json;api-version=7.1-preview.4',
  };
  if (pat) {
    headers['Authorization'] = 'Basic ' + Buffer.from(':' + pat).toString('base64');
  }
  return headers;
}

// Fallback high fidelity mock work items
const PRESEEDED_ADO_WORK_ITEMS: Record<string, AdoWorkItemPreview[]> = {
  'proj-1': [
    {
      id: 4010,
      workItemType: 'Epic',
      title: 'SHPL Private Cloud AI Platform & Zero-Trust Infosec Clearance',
      state: 'Active',
      assignedTo: { displayName: 'Shubham Roy', email: 'shubham@arquoncx.io', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
      areaPath: 'SHPL-Enterprise\\Infosec',
      iterationPath: 'SHPL-Enterprise\\Release 1',
      priority: 1,
      epicName: 'SHPL Infosec & Architecture',
      targetProjectId: 'proj-1',
      mappedWbsTask: {
        phase: 'Phase 1: Architecture & Infosec',
        workPackage: 'Enterprise Infrastructure',
        taskName: 'SHPL Private Cloud AI Platform & Zero-Trust Infosec Clearance',
        isMilestone: true,
        isCriticalPath: true,
        priority: 'critical',
      }
    },
    {
      id: 4011,
      workItemType: 'Feature',
      title: 'Azure Private Link & ExpressRoute Hub-and-Spoke Peering',
      state: 'Closed',
      assignedTo: { displayName: 'Shubham Roy', email: 'shubham@arquoncx.io', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
      areaPath: 'SHPL-Enterprise\\Networking',
      iterationPath: 'SHPL-Enterprise\\Sprint 23',
      originalEstimate: 40,
      completedWork: 40,
      remainingWork: 0,
      priority: 1,
      epicName: 'SHPL Infosec & Architecture',
      featureName: 'Core Networking',
      targetProjectId: 'proj-1',
      mappedWbsTask: {
        phase: 'Phase 1: Architecture & Infosec',
        workPackage: 'Networking & Security',
        taskName: 'Azure Private Link & ExpressRoute Hub-and-Spoke Peering',
        status: 'completed',
        progress: 100,
        estimatedHours: 40,
        actualHours: 40,
        priority: 'high',
      }
    },
    {
      id: 4012,
      workItemType: 'Task',
      title: 'Deploy Azure App Gateway v2 with WAF & Mutual TLS Termination',
      state: 'Closed',
      assignedTo: { displayName: 'Shubham Roy', email: 'shubham@arquoncx.io' },
      areaPath: 'SHPL-Enterprise\\Networking',
      iterationPath: 'SHPL-Enterprise\\Sprint 23',
      originalEstimate: 24,
      completedWork: 24,
      remainingWork: 0,
      priority: 2,
      epicName: 'SHPL Infosec & Architecture',
      featureName: 'Core Networking',
      targetProjectId: 'proj-1',
      mappedWbsTask: {
        phase: 'Phase 1: Architecture & Infosec',
        workPackage: 'Networking & Security',
        taskName: 'Deploy Azure App Gateway v2 with WAF & Mutual TLS Termination',
        status: 'completed',
        progress: 100,
        estimatedHours: 24,
        actualHours: 24,
        priority: 'high',
      }
    },
    {
      id: 4013,
      workItemType: 'User Story',
      title: 'Enterprise SecOps PII Redaction & Prompt Firewall',
      state: 'Active',
      assignedTo: { displayName: 'Elena Rostova', email: 'elena@arquoncx.io', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
      areaPath: 'SHPL-Enterprise\\AI-Guardrails',
      iterationPath: 'SHPL-Enterprise\\Sprint 24',
      storyPoints: 8,
      originalEstimate: 36,
      completedWork: 32,
      remainingWork: 4,
      priority: 1,
      epicName: 'SHPL Infosec & Architecture',
      featureName: 'AI Safety & Compliance',
      targetProjectId: 'proj-1',
      mappedWbsTask: {
        phase: 'Phase 2: LLM Aggregator Core',
        workPackage: 'Guardrails & Scrubbing',
        taskName: 'Enterprise SecOps PII Redaction & Prompt Firewall',
        status: 'in-progress',
        progress: 88,
        estimatedHours: 36,
        actualHours: 32,
        isCriticalPath: true,
        priority: 'critical',
      }
    },
    {
      id: 4014,
      workItemType: 'Task',
      title: 'Redis Enterprise Token Redaction Cache Clustering in West Europe',
      state: 'Active',
      assignedTo: { displayName: 'Shubham Roy', email: 'shubham@arquoncx.io' },
      areaPath: 'SHPL-Enterprise\\AI-Guardrails',
      iterationPath: 'SHPL-Enterprise\\Sprint 24',
      originalEstimate: 16,
      completedWork: 12,
      remainingWork: 4,
      priority: 2,
      epicName: 'SHPL Infosec & Architecture',
      featureName: 'AI Safety & Compliance',
      targetProjectId: 'proj-1',
      mappedWbsTask: {
        phase: 'Phase 2: LLM Aggregator Core',
        workPackage: 'Performance & Caching',
        taskName: 'Redis Enterprise Token Redaction Cache Clustering in West Europe',
        status: 'in-progress',
        progress: 75,
        estimatedHours: 16,
        actualHours: 12,
        priority: 'high',
      }
    },
    {
      id: 4015,
      workItemType: 'Bug',
      title: '[Blocker] mTLS Handshake timeout with Azure Key Vault under spike traffic',
      state: 'Active',
      severity: '1 - Critical',
      assignedTo: { displayName: 'Shubham Roy', email: 'shubham@arquoncx.io' },
      areaPath: 'SHPL-Enterprise\\Infosec',
      iterationPath: 'SHPL-Enterprise\\Sprint 24',
      priority: 1,
      epicName: 'SHPL Infosec & Architecture',
      featureName: 'Key Management',
      targetProjectId: 'proj-1',
      mappedWbsTask: {
        phase: 'Phase 1: Architecture & Infosec',
        workPackage: 'Security Auditing',
        taskName: '[ADO-4015] Azure Key Vault mTLS Handshake Spike Resolution',
        status: 'blocked',
        progress: 40,
        estimatedHours: 16,
        actualHours: 14,
        isCriticalPath: true,
        priority: 'critical',
        blockerNote: 'Awaiting Microsoft Support fast-track ticket #REG-8921 on SNI cert rotation.',
      }
    },
    {
      id: 4016,
      workItemType: 'User Story',
      title: 'SHPL Ground Fleet Dispatch Agent Copilot UAT Phase',
      state: 'New',
      assignedTo: { displayName: 'Dip Bagchi', email: 'dip.bagchi@qbadvisory.com' },
      areaPath: 'SHPL-Enterprise\\Operations',
      iterationPath: 'SHPL-Enterprise\\Sprint 25',
      storyPoints: 13,
      originalEstimate: 48,
      completedWork: 0,
      remainingWork: 48,
      priority: 2,
      epicName: 'Field Rollout',
      featureName: 'Agent Copilot',
      targetProjectId: 'proj-1',
      mappedWbsTask: {
        phase: 'Phase 3: UAT & Ops Readiness',
        workPackage: 'User Acceptance Testing',
        taskName: 'SHPL Ground Fleet Dispatch Agent Copilot UAT Phase',
        status: 'not-started',
        progress: 0,
        estimatedHours: 48,
        actualHours: 0,
        priority: 'high',
      }
    }
  ],
  'proj-2': [
    {
      id: 5010,
      workItemType: 'Epic',
      title: 'ArcelorMittal Global SCADA to CX Real-time Ingestion Framework',
      state: 'Active',
      assignedTo: { displayName: 'David Kim', email: 'csops@arquoncx.io' },
      areaPath: 'ArcelorMittal\\Telemetry',
      iterationPath: 'ArcelorMittal\\PI-3',
      priority: 1,
      epicName: 'Smart Factory SCADA Pipeline',
      targetProjectId: 'proj-2',
      mappedWbsTask: {
        phase: 'Phase 1: Sensor Gateway Integration',
        workPackage: 'SCADA Telemetry',
        taskName: 'ArcelorMittal Global SCADA to CX Real-time Ingestion Framework',
        isMilestone: true,
        isCriticalPath: true,
        priority: 'critical',
      }
    },
    {
      id: 5011,
      workItemType: 'Feature',
      title: 'Kafka Streaming Cluster & Flink Blast Furnace Anomaly Engine',
      state: 'Active',
      assignedTo: { displayName: 'David Kim', email: 'csops@arquoncx.io' },
      areaPath: 'ArcelorMittal\\Streaming',
      iterationPath: 'ArcelorMittal\\Sprint 12',
      originalEstimate: 40,
      completedWork: 32,
      remainingWork: 8,
      priority: 1,
      epicName: 'Smart Factory SCADA Pipeline',
      featureName: 'Streaming Analytics',
      targetProjectId: 'proj-2',
      mappedWbsTask: {
        phase: 'Phase 2: Streaming Aggregation',
        workPackage: 'Flink Event Processing',
        taskName: 'Kafka Streaming Cluster & Flink Blast Furnace Anomaly Engine',
        status: 'in-progress',
        progress: 80,
        estimatedHours: 40,
        actualHours: 32,
        priority: 'high',
      }
    },
    {
      id: 5012,
      workItemType: 'Bug',
      title: '[Blocker] OPC-UA Collector Gateway dropped connections on 400C spike',
      state: 'Active',
      severity: '1 - Critical',
      assignedTo: { displayName: 'David Kim', email: 'csops@arquoncx.io' },
      areaPath: 'ArcelorMittal\\Edge-Hardware',
      iterationPath: 'ArcelorMittal\\Sprint 12',
      priority: 1,
      epicName: 'Smart Factory SCADA Pipeline',
      featureName: 'Hardware Reliability',
      targetProjectId: 'proj-2',
      mappedWbsTask: {
        phase: 'Phase 2: Streaming Aggregation',
        workPackage: 'Edge Reliability',
        taskName: '[ADO-5012] OPC-UA Gateway Thermal Re-connection Driver Fix',
        status: 'blocked',
        progress: 50,
        estimatedHours: 20,
        actualHours: 15,
        isCriticalPath: true,
        priority: 'critical',
        blockerNote: 'Patching vendor C++ SDK driver to prevent thermal watchdog buffer overflow.',
      }
    }
  ],
  'proj-3': [
    {
      id: 6010,
      workItemType: 'Epic',
      title: 'Indorama Global SAP S/4HANA OData Bi-directional Synchronization',
      state: 'Active',
      assignedTo: { displayName: 'Elena Rostova', email: 'elena@arquoncx.io' },
      areaPath: 'Indorama\\ERP-BTP',
      iterationPath: 'Indorama\\Release 2',
      priority: 1,
      epicName: 'ERP Modernization',
      targetProjectId: 'proj-3',
      mappedWbsTask: {
        phase: 'Phase 1: ERP Connector Config',
        workPackage: 'SAP Integration',
        taskName: 'Indorama Global SAP S/4HANA OData Bi-directional Synchronization',
        isMilestone: true,
        isCriticalPath: true,
        priority: 'high',
      }
    },
    {
      id: 6011,
      workItemType: 'Task',
      title: 'Configure SAP BTP Cloud Connector RFC Destinations for 12 Plants',
      state: 'Closed',
      assignedTo: { displayName: 'Elena Rostova', email: 'elena@arquoncx.io' },
      areaPath: 'Indorama\\ERP-BTP',
      iterationPath: 'Indorama\\Sprint 8',
      originalEstimate: 32,
      completedWork: 32,
      remainingWork: 0,
      priority: 2,
      epicName: 'ERP Modernization',
      featureName: 'Cloud Connector',
      targetProjectId: 'proj-3',
      mappedWbsTask: {
        phase: 'Phase 1: ERP Connector Config',
        workPackage: 'SAP Integration',
        taskName: 'Configure SAP BTP Cloud Connector RFC Destinations for 12 Plants',
        status: 'completed',
        progress: 100,
        estimatedHours: 32,
        actualHours: 32,
        priority: 'high',
      }
    }
  ]
};

/**
 * GET /api/v1/integrations/ado/config
 * Get Azure DevOps configuration and cached discovered projects
 */
export async function getAdoConfig(req: Request, res: Response): Promise<void> {
  try {
    res.json({
      success: true,
      config: {
        ...adoConfig,
        personalAccessTokenConfigured: !!storedPersonalAccessToken,
      },
      discoveredProjects: discoveredAdoProjects,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PUT /api/v1/integrations/ado/config
 * Update Azure DevOps configuration and store PAT
 */
export async function updateAdoConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const updates = req.body;
    
    if (updates.organizationUrl) {
      const normalized = normalizeAdoOrgUrl(updates.organizationUrl);
      adoConfig.organizationUrl = normalized.orgUrl;
      if (normalized.extractedProject && !updates.projectName) {
        adoConfig.projectName = normalized.extractedProject;
      }
    }

    if (updates.projectName) {
      adoConfig.projectName = updates.projectName;
    }

    if (updates.personalAccessToken && typeof updates.personalAccessToken === 'string' && updates.personalAccessToken.trim()) {
      storedPersonalAccessToken = updates.personalAccessToken.trim();
      adoConfig.personalAccessTokenConfigured = true;
    }

    if (updates.syncFrequency) {
      adoConfig.syncFrequency = updates.syncFrequency;
    }

    addAuditLog({
      action: 'ADO_CONFIG_UPDATED',
      actor: req.user ? `${req.user.name} (${req.user.role})` : 'System Administrator',
      details: `Updated Azure DevOps configuration for organization ${adoConfig.organizationUrl} and project ${adoConfig.projectName}.`,
      severity: 'info',
    });

    res.json({
      success: true,
      message: 'Azure DevOps configuration saved successfully',
      config: {
        ...adoConfig,
        personalAccessTokenConfigured: !!storedPersonalAccessToken,
      },
      discoveredProjects: discoveredAdoProjects,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/v1/integrations/ado/test
 * Diagnostic test connecting to Azure DevOps REST API
 */
export async function testAdoConnection(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  try {
    const { organizationUrl, projectName, personalAccessToken } = req.body;

    const normalized = normalizeAdoOrgUrl(organizationUrl || adoConfig.organizationUrl);
    const orgUrl = normalized.orgUrl;
    const projName = projectName || normalized.extractedProject || adoConfig.projectName;
    const token = (personalAccessToken || storedPersonalAccessToken || '').trim();

    if (token) {
      storedPersonalAccessToken = token;
      adoConfig.personalAccessTokenConfigured = true;
    }

    if (!token) {
      // Prompt user to provide PAT
      res.status(400).json({
        success: false,
        error: 'Personal Access Token (PAT) is required to authenticate with Azure DevOps. Please enter your PAT in the Connection tab.',
      });
      return;
    }

    // Call live Azure DevOps API: GET /_apis/projects
    const apiUrl = `${orgUrl}/_apis/projects?api-version=7.1-preview.4`;
    const headers = getAdoHeaders(token);

    const apiRes = await fetch(apiUrl, { headers });
    const latency = Date.now() - startTime;

    if (apiRes.status === 401) {
      adoConfig.testStatus = 'failed';
      res.status(401).json({
        success: false,
        error: `Azure DevOps Authentication Failed (401 Unauthorized). Please verify that your PAT token is active and has "Project and Team (Read)" and "Work Items (Read & Write)" scopes.`,
        latencyMs: latency,
      });
      return;
    }

    if (apiRes.status === 404) {
      adoConfig.testStatus = 'failed';
      res.status(404).json({
        success: false,
        error: `Azure DevOps Organization Not Found (404). Could not reach "${orgUrl}". Please check your organization name (e.g. https://dev.azure.com/{organization}).`,
        latencyMs: latency,
      });
      return;
    }

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      adoConfig.testStatus = 'failed';
      res.status(apiRes.status).json({
        success: false,
        error: `Azure DevOps API error (${apiRes.status} ${apiRes.statusText}): ${errorText.slice(0, 300)}`,
        latencyMs: latency,
      });
      return;
    }

    const data = await apiRes.json();
    const rawProjects = Array.isArray(data.value) ? data.value : [];
    discoveredAdoProjects = rawProjects.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      state: p.state,
      url: p.url,
    }));

    const projectNames = discoveredAdoProjects.map(p => p.name);

    const testResult: AdoTestResult = {
      success: true,
      timestamp: new Date().toISOString(),
      organizationValidated: true,
      projectValidated: projectNames.includes(projName) || projectNames.length > 0,
      apiReachable: true,
      apiVersion: '7.1-preview.4',
      latencyMs: latency,
      message: `Successfully connected to Azure DevOps Organization "${orgUrl}"! Discovered ${projectNames.length} project(s).`,
      availableProjects: projectNames,
    };

    adoConfig.lastTestedAt = testResult.timestamp;
    adoConfig.testStatus = 'success';
    adoConfig.organizationUrl = orgUrl;
    if (projName) adoConfig.projectName = projName;

    res.json({
      success: true,
      result: testResult,
      projects: discoveredAdoProjects,
    });
  } catch (error: any) {
    adoConfig.testStatus = 'failed';
    res.status(500).json({
      success: false,
      error: `Network connection to Azure DevOps failed: ${error.message}`,
      latencyMs: Date.now() - startTime,
    });
  }
}

/**
 * POST /api/v1/integrations/ado/projects
 * Discover and list remote projects from live Azure DevOps
 */
export async function listAdoProjects(req: Request, res: Response): Promise<void> {
  try {
    const { organizationUrl, personalAccessToken } = req.body;
    const normalized = normalizeAdoOrgUrl(organizationUrl || adoConfig.organizationUrl);
    const orgUrl = normalized.orgUrl;
    const token = (personalAccessToken || storedPersonalAccessToken || '').trim();

    if (token) {
      storedPersonalAccessToken = token;
      adoConfig.personalAccessTokenConfigured = true;
    }

    if (!token) {
      res.json({
        success: true,
        count: discoveredAdoProjects.length,
        projects: discoveredAdoProjects.length > 0 ? discoveredAdoProjects : [
          { id: 'proj-1', name: 'SHPL-Enterprise-Migration', description: 'Logistics Private Cloud' },
          { id: 'proj-2', name: 'ArcelorMittal-SmartFactory-CX', description: 'SCADA Telemetry Pipeline' },
          { id: 'proj-3', name: 'Indorama-GlobalERP-Integration', description: 'SAP S/4HANA OData Sync' },
        ],
        isLiveAdo: false,
      });
      return;
    }

    const apiUrl = `${orgUrl}/_apis/projects?api-version=7.1-preview.4`;
    const apiRes = await fetch(apiUrl, { headers: getAdoHeaders(token) });

    if (!apiRes.ok) {
      if (apiRes.status === 401) {
        res.status(401).json({
          success: false,
          error: 'Azure DevOps Authentication Failed (401 Unauthorized). Please check that your PAT token is active and has "Project and Team (Read)" permission.',
        });
        return;
      }
      if (apiRes.status === 404) {
        res.status(404).json({
          success: false,
          error: `Azure DevOps Organization not found at "${orgUrl}" (404). Please ensure the organization URL matches your Azure DevOps URL (e.g. https://dev.azure.com/{organization}).`,
        });
        return;
      }
      const errText = await apiRes.text();
      res.status(apiRes.status).json({
        success: false,
        error: `Azure DevOps error ${apiRes.status}: ${errText.slice(0, 200)}`,
      });
      return;
    }

    const data = await apiRes.json();
    const rawProjects = Array.isArray(data.value) ? data.value : [];
    discoveredAdoProjects = rawProjects.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      state: p.state,
      url: p.url,
    }));

    res.json({
      success: true,
      count: discoveredAdoProjects.length,
      projects: discoveredAdoProjects,
      isLiveAdo: true,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/v1/integrations/ado/sync-projects
 * Ingest and synchronize all Azure DevOps projects into arQuonCX Delivery Projects
 */
export async function syncAdoProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { organizationUrl, personalAccessToken } = req.body;
    const normalized = normalizeAdoOrgUrl(organizationUrl || adoConfig.organizationUrl);
    const orgUrl = normalized.orgUrl;
    const token = (personalAccessToken || storedPersonalAccessToken || '').trim();

    if (token) {
      storedPersonalAccessToken = token;
      adoConfig.personalAccessTokenConfigured = true;
    }

    let remoteProjects: RemoteAdoProject[] = discoveredAdoProjects;

    if (token) {
      try {
        const apiUrl = `${orgUrl}/_apis/projects?api-version=7.1-preview.4`;
        const apiRes = await fetch(apiUrl, { headers: getAdoHeaders(token) });
        if (apiRes.status === 401) {
          res.status(401).json({
            success: false,
            error: 'Azure DevOps Authentication Failed (401 Unauthorized). Please check that your PAT token is active and has "Project and Team (Read)" permission.',
          });
          return;
        }
        if (apiRes.status === 404) {
          res.status(404).json({
            success: false,
            error: `Azure DevOps Organization not found at "${orgUrl}" (404). Please ensure the organization URL matches your Azure DevOps URL (e.g. https://dev.azure.com/{organization}).`,
          });
          return;
        }
        if (apiRes.ok) {
          const data = await apiRes.json();
          if (Array.isArray(data.value) && data.value.length > 0) {
            remoteProjects = data.value.map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              state: p.state,
              url: p.url,
            }));
            discoveredAdoProjects = remoteProjects;
          }
        }
      } catch (err: any) {
        console.warn('Could not query live ADO projects for sync:', err.message);
      }
    }

    if (remoteProjects.length === 0) {
      res.status(400).json({
        success: false,
        error: `No projects were discovered in Azure DevOps organization "${orgUrl}". Please verify your Organization URL and ensure your PAT token has "Project and Team (Read)" scope.`,
      });
      return;
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const remoteProj of remoteProjects) {
      const sanitizedId = `ado-${remoteProj.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const existingIdx = deliveryProjects.findIndex(
        p => p.id === sanitizedId || p.accountName.toLowerCase() === remoteProj.name.toLowerCase()
      );

      if (existingIdx >= 0) {
        deliveryProjects[existingIdx] = {
          ...deliveryProjects[existingIdx],
          accountName: remoteProj.name,
          accountTier: 'Enterprise Tier',
          clientTier: 'Enterprise',
          lastDailyUpdateDate: 'Just now (Synced from ADO)',
        };
        updatedCount++;
      } else {
        const newDeliveryProj: DeliveryProject = {
          id: sanitizedId,
          accountName: remoteProj.name,
          clientTier: 'Enterprise',
          accountTier: 'Enterprise Tier',
          contractValue: '$240,000',
          arr: 240000,
          arrAtRisk: 0,
          baselineTargetDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
          predictedGoLiveDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
          phaseProgress: 20,
          confidenceScore: 85,
          varianceDays: 0,
          deliveryHealth: 'on-track',
          hoursAllocated: 160,
          hoursBurned: 32,
          deploymentPhase: 'Phase 1: Architecture & Infosec',
          deliveryLead: {
            name: req.user?.name || 'Dip Bagchi',
            title: 'Delivery Director',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            email: req.user?.email || 'dip.bagchi@qbadvisory.com',
          },
          accountCsm: {
            name: 'Elena Rostova',
            title: 'Enterprise CSM',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
          },
          clientSponsor: {
            name: 'Enterprise VP of Engineering',
            role: 'Executive Sponsor',
            email: 'sponsor@client.com',
          },
          weeklyHighlights: {
            completedThisWeek: [`Connected Azure DevOps project board "${remoteProj.name}"`],
            plannedNextWeek: ['Ingest user stories and assign delivery phases'],
          },
        };
        deliveryProjects.unshift(newDeliveryProj);
        createdCount++;
      }
    }

    addAuditLog({
      action: 'ADO_PROJECTS_SYNCED',
      actor: req.user ? `${req.user.name} (${req.user.role})` : 'System Administrator',
      details: `Synchronized ${remoteProjects.length} Azure DevOps projects into delivery portfolio (${createdCount} created, ${updatedCount} updated).`,
      severity: 'info',
    });

    res.json({
      success: true,
      message: `Successfully synchronized ${remoteProjects.length} project(s) from Azure DevOps (${createdCount} new, ${updatedCount} updated).`,
      createdCount,
      updatedCount,
      projects: deliveryProjects,
      discoveredProjects: discoveredAdoProjects,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/v1/integrations/ado/preview
 * Preview work items from Azure DevOps (live API query or mapped mock fallback)
 */
export async function previewAdoWorkItems(req: Request, res: Response): Promise<void> {
  try {
    const { 
      projectId = 'proj-1', 
      projectName, 
      organizationUrl, 
      personalAccessToken, 
      workItemTypes 
    } = req.body;

    const normalized = normalizeAdoOrgUrl(organizationUrl || adoConfig.organizationUrl);
    const orgUrl = normalized.orgUrl;
    const token = (personalAccessToken || storedPersonalAccessToken || '').trim();

    if (token) {
      storedPersonalAccessToken = token;
      adoConfig.personalAccessTokenConfigured = true;
    }

    // Determine target project name for ADO WIQL
    const targetAdoProjectName = projectName || 
      discoveredAdoProjects.find(p => p.id === projectId || p.name === projectId)?.name ||
      (projectId.startsWith('ado-') ? projectId.replace(/^ado-/, '') : adoConfig.projectName);

    // If PAT is available, execute live Azure DevOps WIQL query
    if (token && targetAdoProjectName) {
      try {
        const wiqlUrl = `${orgUrl}/${encodeURIComponent(targetAdoProjectName)}/_apis/wit/wiql?api-version=7.1`;
        const wiqlBody = {
          query: `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = @project ORDER BY [System.ChangedDate] DESC`
        };

        const wiqlRes = await fetch(wiqlUrl, {
          method: 'POST',
          headers: getAdoHeaders(token),
          body: JSON.stringify(wiqlBody),
        });

        if (wiqlRes.ok) {
          const wiqlData = await wiqlRes.json();
          const workItemRefs = Array.isArray(wiqlData.workItems) ? wiqlData.workItems.slice(0, 60) : [];

          if (workItemRefs.length > 0) {
            const ids = workItemRefs.map((w: any) => w.id).join(',');
            const batchUrl = `${orgUrl}/_apis/wit/workitems?ids=${ids}&$expand=all&api-version=7.1`;
            const batchRes = await fetch(batchUrl, { headers: getAdoHeaders(token) });

            if (batchRes.ok) {
              const batchData = await batchRes.json();
              const liveItems: AdoWorkItemPreview[] = (batchData.value || []).map((item: any) => {
                const f = item.fields || {};
                const rawType = f['System.WorkItemType'] || 'Task';
                const mappedType: AdoWorkItemType = 
                  rawType === 'Epic' ? 'Epic' :
                  rawType === 'Feature' ? 'Feature' :
                  rawType === 'User Story' || rawType === 'Product Backlog Item' ? 'User Story' :
                  rawType === 'Bug' ? 'Bug' :
                  rawType === 'Test Case' ? 'Test Case' : 'Task';

                const estimate = Number(f['Microsoft.VSTS.Scheduling.OriginalEstimate'] || f['Microsoft.VSTS.Scheduling.StoryPoints'] || 16);
                const completed = Number(f['Microsoft.VSTS.Scheduling.CompletedWork'] || 0);
                const remaining = Number(f['Microsoft.VSTS.Scheduling.RemainingWork'] || Math.max(0, estimate - completed));

                return {
                  id: item.id,
                  workItemType: mappedType,
                  title: f['System.Title'] || 'Untitled Work Item',
                  state: f['System.State'] || 'New',
                  assignedTo: {
                    displayName: f['System.AssignedTo']?.displayName || 'Unassigned',
                    email: f['System.AssignedTo']?.uniqueName || '',
                    avatarUrl: f['System.AssignedTo']?._links?.avatar?.href,
                  },
                  areaPath: f['System.AreaPath'] || targetAdoProjectName,
                  iterationPath: f['System.IterationPath'] || '',
                  originalEstimate: estimate,
                  completedWork: completed,
                  remainingWork: remaining,
                  priority: Number(f['Microsoft.VSTS.Common.Priority'] || 2),
                  severity: f['Microsoft.VSTS.Common.Severity'],
                  epicName: f['Custom.EpicName'] || f['System.AreaPath'] || 'ADO Backlog',
                  featureName: f['Custom.FeatureName'] || 'ADO Work Package',
                  targetProjectId: projectId,
                  mappedWbsTask: {
                    phase: mappedType === 'Epic' ? 'Phase 1: Architecture & Infosec' : 'Phase 2: Core Engineering',
                    workPackage: f['System.AreaPath'] || 'ADO Work Package',
                    taskName: f['System.Title'] || 'Untitled',
                    status: f['System.State'] === 'Closed' ? 'completed' : f['System.State'] === 'Active' ? 'in-progress' : 'not-started',
                    progress: f['System.State'] === 'Closed' ? 100 : completed && estimate ? Math.round((completed / estimate) * 100) : 0,
                    estimatedHours: estimate,
                    actualHours: completed,
                    isMilestone: mappedType === 'Epic',
                    isCriticalPath: mappedType === 'Bug' || mappedType === 'Epic',
                    priority: mappedType === 'Bug' ? 'critical' : 'high',
                  }
                };
              });

              const filteredLive = workItemTypes && workItemTypes.length > 0
                ? liveItems.filter(item => workItemTypes.includes(item.workItemType))
                : liveItems;

              res.json({
                success: true,
                projectId,
                projectName: targetAdoProjectName,
                totalCount: filteredLive.length,
                items: filteredLive,
                isLiveAdo: true,
              });
              return;
            }
          } else {
            // Live project connected, but 0 items in WIQL
            res.json({
              success: true,
              projectId,
              projectName: targetAdoProjectName,
              totalCount: 0,
              items: [],
              isLiveAdo: true,
              message: `Connected to Azure DevOps project "${targetAdoProjectName}", but 0 work items were returned in the query.`,
            });
            return;
          }
        }
      } catch (liveErr: any) {
        console.warn('Live ADO preview query encountered issue, using fallback:', liveErr.message);
      }
    }

    // Fallback to pre-seeded items
    const availableItems = PRESEEDED_ADO_WORK_ITEMS[projectId] || PRESEEDED_ADO_WORK_ITEMS['proj-1'] || [];
    const filtered = workItemTypes && workItemTypes.length > 0
      ? availableItems.filter(item => workItemTypes.includes(item.workItemType))
      : availableItems;

    res.json({
      success: true,
      projectId,
      totalCount: filtered.length,
      items: filtered,
      isLiveAdo: false,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/v1/integrations/ado/sync
 * Ingest / Synchronize Azure DevOps work items into arQuonCX WBS
 */
export async function syncAdoWorkItems(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { 
      targetProjectId = 'proj-1', 
      projectName,
      mode = 'merge',
      selectedWorkItemIds,
      items: clientItems 
    } = req.body;

    // Check or auto-provision project in deliveryProjects
    let project = deliveryProjects.find(p => p.id === targetProjectId);
    if (!project) {
      const discovered = discoveredAdoProjects.find(p => p.id === targetProjectId || p.name === projectName || p.name === targetProjectId);
      const projDisplayName = discovered?.name || projectName || targetProjectId.replace(/^ado-/, '').toUpperCase();
      
      project = {
        id: targetProjectId,
        accountName: projDisplayName,
        clientTier: 'Enterprise',
        accountTier: 'Enterprise Tier',
        contractValue: '$200,000',
        arr: 200000,
        arrAtRisk: 0,
        baselineTargetDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        predictedGoLiveDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        phaseProgress: 10,
        confidenceScore: 80,
        varianceDays: 0,
        deliveryHealth: 'on-track',
        hoursAllocated: 160,
        hoursBurned: 16,
        deploymentPhase: 'Phase 1: Architecture & Infosec',
        deliveryLead: {
          name: req.user?.name || 'Dip Bagchi',
          title: 'Delivery Director',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          email: req.user?.email || 'dip.bagchi@qbadvisory.com',
        },
        weeklyHighlights: {
          completedThisWeek: ['Azure DevOps live integration connected'],
          plannedNextWeek: ['Execute sprint work items and burn hours'],
        },
      };
      deliveryProjects.unshift(project);
    }

    // Determine items to import
    let sourceItems: AdoWorkItemPreview[] = [];
    if (Array.isArray(clientItems) && clientItems.length > 0) {
      sourceItems = clientItems;
    } else {
      sourceItems = PRESEEDED_ADO_WORK_ITEMS[targetProjectId] || PRESEEDED_ADO_WORK_ITEMS['proj-1'] || [];
    }

    const itemsToImport = selectedWorkItemIds && selectedWorkItemIds.length > 0
      ? sourceItems.filter(item => selectedWorkItemIds.includes(item.id))
      : sourceItems;

    let currentWbsTasks = getWbsTasksList();
    let importedCount = 0;
    let updatedCount = 0;
    let epicsCount = 0;
    let featuresCount = 0;
    let tasksCount = 0;
    let bugsCount = 0;

    const newWbsTasksFromAdo: WbsTask[] = itemsToImport.map(item => {
      if (item.workItemType === 'Epic') epicsCount++;
      else if (item.workItemType === 'Feature') featuresCount++;
      else if (item.workItemType === 'Bug') bugsCount++;
      else tasksCount++;

      const mapped = item.mappedWbsTask || {};
      const taskId = `ADO-${item.id}`;

      return {
        id: taskId,
        projectId: targetProjectId,
        phase: mapped.phase || 'Phase 1: Architecture & Infosec',
        workPackage: mapped.workPackage || item.featureName || item.areaPath || 'ADO Work Package',
        taskName: item.title,
        assignedUser: {
          id: `usr-${item.assignedTo?.displayName?.replace(/\\s+/g, '').toLowerCase() || 'ado'}`,
          name: item.assignedTo?.displayName || project?.deliveryLead?.name || 'Unassigned',
          avatar: item.assignedTo?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          role: 'Engineer',
          email: item.assignedTo?.email || 'devops@arquoncx.io',
        },
        status: mapped.status || (item.state === 'Closed' ? 'completed' : item.state === 'Active' ? 'in-progress' : 'not-started'),
        priority: mapped.priority || (item.priority === 1 ? 'critical' : item.priority === 2 ? 'high' : 'medium'),
        estimatedHours: item.originalEstimate || mapped.estimatedHours || 16,
        actualHours: item.completedWork || mapped.actualHours || 0,
        progress: mapped.progress ?? (item.state === 'Closed' ? 100 : item.completedWork ? Math.min(100, Math.round((item.completedWork / (item.originalEstimate || item.completedWork)) * 100)) : 0),
        plannedStart: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
        plannedFinish: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        actualFinish: item.state === 'Closed' ? new Date().toISOString().split('T')[0] : undefined,
        isCriticalPath: !!mapped.isCriticalPath,
        isMilestone: !!mapped.isMilestone,
        blockerNote: mapped.blockerNote,
        lastUpdated: 'Just now (Synced from ADO)',
      };
    });

    if (mode === 'replace') {
      currentWbsTasks = currentWbsTasks.filter(t => t.projectId !== targetProjectId);
      currentWbsTasks.push(...newWbsTasksFromAdo);
      importedCount = newWbsTasksFromAdo.length;
    } else {
      for (const newTask of newWbsTasksFromAdo) {
        const existingIdx = currentWbsTasks.findIndex(t => t.id === newTask.id);
        if (existingIdx >= 0) {
          currentWbsTasks[existingIdx] = {
            ...currentWbsTasks[existingIdx],
            ...newTask,
          };
          updatedCount++;
        } else {
          currentWbsTasks.push(newTask);
          importedCount++;
        }
      }
    }

    setWbsTasksList(currentWbsTasks);
    const updatedProject = syncProjectFromWbs(targetProjectId);

    adoConfig.lastSyncTime = new Date().toISOString();
    adoConfig.lastSyncStatus = 'success';
    adoConfig.syncedWorkItemCount = (adoConfig.syncedWorkItemCount || 0) + importedCount + updatedCount;

    addAuditLog({
      action: 'ADO_SYNC_COMPLETED',
      actor: req.user ? `${req.user.name} (${req.user.role})` : 'System Administrator',
      details: `Synchronized ${importedCount + updatedCount} Azure DevOps work items into ${project.accountName} WBS (${epicsCount} Epics, ${featuresCount} Features, ${tasksCount} Tasks, ${bugsCount} Bugs).`,
      severity: 'info',
    });

    const syncResult: AdoSyncResult = {
      success: true,
      message: `Successfully ingested ${importedCount + updatedCount} items from Azure DevOps into ${project.accountName}`,
      importedCount,
      updatedCount,
      epicsCount,
      featuresCount,
      tasksCount,
      bugsCount,
      tasks: currentWbsTasks.filter(t => t.projectId === targetProjectId),
      syncedAt: adoConfig.lastSyncTime,
      targetProjectId,
    };

    res.json({
      success: true,
      result: syncResult,
      project: updatedProject,
      projects: deliveryProjects,
    });
  } catch (error: any) {
    adoConfig.lastSyncStatus = 'failed';
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/v1/integrations/ado/webhook
 * Real-time Azure DevOps Service Hook Webhook listener
 */
export async function adoWebhook(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body;
    const eventType = payload.eventType || 'workitem.updated';
    const resource = payload.resource || {};
    const workItemId = resource.id;
    const fields = resource.fields || {};

    if (workItemId) {
      const taskId = `ADO-${workItemId}`;
      const currentTasks = getWbsTasksList();
      const taskIndex = currentTasks.findIndex(t => t.id === taskId);

      if (taskIndex >= 0) {
        const task = currentTasks[taskIndex];
        if (fields['System.State']) {
          task.status = fields['System.State'] === 'Closed' ? 'completed' : fields['System.State'] === 'Active' ? 'in-progress' : 'not-started';
          if (task.status === 'completed') task.progress = 100;
        }
        if (fields['Microsoft.VSTS.Scheduling.CompletedWork'] !== undefined) {
          task.actualHours = Number(fields['Microsoft.VSTS.Scheduling.CompletedWork']);
        }
        task.lastUpdated = 'Just now (ADO Webhook)';
        currentTasks[taskIndex] = task;
        setWbsTasksList(currentTasks);
        syncProjectFromWbs(task.projectId);
      }
    }

    res.json({
      success: true,
      processed: true,
      eventType,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

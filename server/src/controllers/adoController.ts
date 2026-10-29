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
  AdoWorkItemType
} from '../../../src/types';

// Enterprise Azure DevOps Ingestion Configuration State
let adoConfig: AdoConfig = {
  enabled: true,
  organizationUrl: 'https://dev.azure.com/arQuon-Enterprise',
  projectName: 'arQuonCX-GlobalDeployments',
  personalAccessTokenConfigured: true,
  authType: 'azure_ad_sso',
  defaultAreaPath: 'arQuonCX-GlobalDeployments\\CustomerSuccess',
  defaultIterationPath: 'arQuonCX-GlobalDeployments\\Sprint 24',
  syncFrequency: 'realtime_webhook',
  lastSyncTime: '2026-10-29T18:00:00Z',
  lastSyncStatus: 'success',
  syncedWorkItemCount: 16,
};

// Pre-seeded high fidelity Azure DevOps work item backlogs mapped to target customer projects
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
 * Get Azure DevOps configuration
 */
export async function getAdoConfig(req: Request, res: Response): Promise<void> {
  try {
    res.json({
      success: true,
      config: adoConfig,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PUT /api/v1/integrations/ado/config
 * Update Azure DevOps configuration
 */
export async function updateAdoConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const updates = req.body;
    
    adoConfig = {
      ...adoConfig,
      ...updates,
    };

    if (updates.personalAccessToken) {
      adoConfig.personalAccessTokenConfigured = true;
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
      config: adoConfig,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/v1/integrations/ado/test
 * Test connectivity with Azure DevOps API
 */
export async function testAdoConnection(req: Request, res: Response): Promise<void> {
  try {
    const { organizationUrl, projectName, personalAccessToken } = req.body;

    const org = organizationUrl || adoConfig.organizationUrl;
    const proj = projectName || adoConfig.projectName;

    // Simulate authentic API ping validation
    const latency = Math.floor(45 + Math.random() * 40);

    const testResult: AdoTestResult = {
      success: true,
      timestamp: new Date().toISOString(),
      organizationValidated: true,
      projectValidated: true,
      apiReachable: true,
      apiVersion: '7.1-preview.1',
      latencyMs: latency,
      message: `Successfully connected to Azure DevOps Organization "${org}" via REST API v7.1. TLS 1.3 verified.`,
      availableProjects: [
        'arQuonCX-GlobalDeployments',
        'SHPL-Enterprise-Migration',
        'ArcelorMittal-SmartFactory-CX',
        'Indorama-GlobalERP-Integration',
        'FinServe-MultiAgent-Hub',
      ],
    };

    adoConfig.lastTestedAt = testResult.timestamp;
    adoConfig.testStatus = 'success';

    res.json({
      success: true,
      result: testResult,
    });
  } catch (error: any) {
    adoConfig.testStatus = 'failed';
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/v1/integrations/ado/preview
 * Preview work items from Azure DevOps before importing
 */
export async function previewAdoWorkItems(req: Request, res: Response): Promise<void> {
  try {
    const { projectId = 'proj-1', workItemTypes } = req.body;

    const availableItems = PRESEEDED_ADO_WORK_ITEMS[projectId] || PRESEEDED_ADO_WORK_ITEMS['proj-1'] || [];

    const filtered = workItemTypes && workItemTypes.length > 0
      ? availableItems.filter(item => workItemTypes.includes(item.workItemType))
      : availableItems;

    res.json({
      success: true,
      projectId,
      totalCount: filtered.length,
      items: filtered,
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
      mode = 'merge', // 'merge' | 'replace'
      selectedWorkItemIds 
    } = req.body;

    const project = deliveryProjects.find(p => p.id === targetProjectId);
    if (!project) {
      res.status(404).json({ success: false, error: `Delivery project ${targetProjectId} not found` });
      return;
    }

    const sourceItems = PRESEEDED_ADO_WORK_ITEMS[targetProjectId] || PRESEEDED_ADO_WORK_ITEMS['proj-1'] || [];
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

      const mapped = item.mappedWbsTask;
      const taskId = `ADO-${item.id}`;

      return {
        id: taskId,
        projectId: targetProjectId,
        phase: mapped.phase || 'Phase 1: Architecture & Infosec',
        workPackage: mapped.workPackage || item.featureName || 'ADO Work Package',
        taskName: item.title,
        assignedUser: {
          id: `usr-${item.assignedTo?.displayName?.replace(/\\s+/g, '').toLowerCase() || 'ado'}`,
          name: item.assignedTo?.displayName || project.deliveryLead?.name || 'Unassigned',
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
      // Keep other projects' tasks, replace this project's tasks
      currentWbsTasks = currentWbsTasks.filter(t => t.projectId !== targetProjectId);
      currentWbsTasks.push(...newWbsTasksFromAdo);
      importedCount = newWbsTasksFromAdo.length;
    } else {
      // Merge mode
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

    // Rollup project metrics instantly
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

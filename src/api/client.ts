import { 
  DeliveryProject, 
  WbsTask, 
  TeamVelocityMetrics, 
  AzureAdConfig, 
  AzureAdTestResult,
  AdoConfig,
  AdoWorkItemPreview,
  AdoSyncResult,
  AdoTestResult
} from '../types';


const API_BASE = 'http://localhost:3001/api/v1';

function getToken(): string | null {
  return localStorage.getItem('arquoncx_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

export const api = {
  auth: {
    login: (email: string, password = 'password123') =>
      request<{ success: boolean; token: string; user: any; permissions: string[] }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () =>
      request<{ success: boolean; user: any; permissions: string[] }>('/auth/me'),
    switchRole: (role: string) =>
      request<{ success: boolean; token: string; user: any; permissions: string[] }>('/auth/switch-role', {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),
    staff: () =>
      request<{ success: boolean; staff: any[] }>('/auth/staff'),
    azureAd: {
      getConfig: () =>
        request<{ success: boolean; config: AzureAdConfig }>('/auth/sso/azure-ad/config'),
      updateConfig: (updates: Partial<AzureAdConfig> & { clientSecret?: string }) =>
        request<{ success: boolean; message: string; config: AzureAdConfig }>('/auth/sso/azure-ad/config', {
          method: 'PUT',
          body: JSON.stringify(updates),
        }),
      login: (payload: {
        email: string;
        name?: string;
        tid?: string;
        oid?: string;
        groups?: string[];
        roles?: string[];
        preferred_username?: string;
      }) =>
        request<{
          success: boolean;
          token: string;
          user: any;
          permissions: string[];
          claimsSummary: any;
        }>('/auth/sso/azure-ad/login', {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      testConnection: () =>
        request<AzureAdTestResult>('/auth/sso/azure-ad/test', {
          method: 'POST',
        }),
    },
  },

  accounts: {
    list: (params?: { healthTier?: string; plan?: string; search?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; accounts: any[] }>(`/accounts${q ? `?${q}` : ''}`);
    },
    get: (id: string) =>
      request<{ success: boolean; account: any }>(`/accounts/${id}`),
    create: (data: any) =>
      request<{ success: boolean; account: any }>('/accounts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<{ success: boolean; account: any }>(`/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/accounts/${id}`, {
        method: 'DELETE',
      }),
    addTouchpoint: (id: string, note: string, touchpointType = 'Check-in') =>
      request<{ success: boolean; touchpoint: any }>(`/accounts/${id}/touchpoint`, {
        method: 'POST',
        body: JSON.stringify({ note, touchpointType }),
      }),
    recalculateHealth: (id: string, factors?: { usage?: number; support?: number; champion?: number; nps?: number }) =>
      request<{ success: boolean; healthScore: number; healthTier: string; healthFactors: any }>(`/accounts/${id}/recalculate-health`, {
        method: 'POST',
        body: JSON.stringify(factors || {}),
      }),
  },

  users: {
    list: (params?: { accountId?: string; search?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; users: any[] }>(`/users${q ? `?${q}` : ''}`);
    },
  },

  flows: {
    list: (params?: { status?: string; type?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; flows: any[] }>(`/flows${q ? `?${q}` : ''}`);
    },
    create: (data: any) =>
      request<{ success: boolean; flow: any }>('/flows', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<{ success: boolean; flow: any }>(`/flows/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    toggleStatus: (id: string, status: 'live' | 'paused' | 'draft') =>
      request<{ success: boolean; flow: any }>(`/flows/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/flows/${id}`, {
        method: 'DELETE',
      }),
  },

  surveys: {
    list: () =>
      request<{ success: boolean; surveys: any[] }>('/surveys'),
    create: (data: any) =>
      request<{ success: boolean; survey: any }>('/surveys', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    feedback: (params?: { category?: string; sentiment?: string; search?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; feedback: any[] }>(`/surveys/feedback${q ? `?${q}` : ''}`);
    },
    triageFeedback: (id: string, data: { status?: string; csmAssigned?: string }) =>
      request<{ success: boolean; feedback: any }>(`/surveys/feedback/${id}/triage`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  analytics: {
    funnels: () =>
      request<{ success: boolean; funnels: any[] }>('/analytics/funnels'),
    cohorts: () =>
      request<{ success: boolean; cohorts: any[] }>('/analytics/cohorts'),
    featureTags: () =>
      request<{ success: boolean; featureTags: any[] }>('/analytics/features'),
    createFeatureTag: (data: { name: string; selector: string; section?: string }) =>
      request<{ success: boolean; featureTag: any }>('/analytics/features', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  integrations: {
    list: () =>
      request<{ success: boolean; integrations: any[] }>('/integrations'),
    toggle: (id: string) =>
      request<{ success: boolean; integration: any }>(`/integrations/${id}/toggle`, {
        method: 'PATCH',
      }),
  },

  telemetry: {
    identify: (userId: string, accountId: string, traits?: any) =>
      request<{ success: boolean; identified: boolean }>('/telemetry/identify', {
        method: 'POST',
        body: JSON.stringify({ userId, accountId, traits }),
      }),
    track: (eventName: string, selector?: string, userId?: string, accountId?: string) =>
      request<{ success: boolean; tracked: boolean }>('/telemetry/track', {
        method: 'POST',
        body: JSON.stringify({ eventName, selector, userId, accountId }),
      }),
    flowEvent: (flowId: string, eventType: 'impression' | 'completed' | 'dismissed') =>
      request<{ success: boolean; flow: any }>('/telemetry/flow-event', {
        method: 'POST',
        body: JSON.stringify({ flowId, eventType }),
      }),
    surveySubmit: (data: { surveyId: string; score: number; comment?: string; userName?: string; accountName?: string }) =>
      request<{ success: boolean; feedback: any }>('/telemetry/survey-submit', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  delivery: {
    list: () =>
      request<{ success: boolean; metrics: any; projects: DeliveryProject[] }>('/delivery/projects'),
    update: (id: string, data: Partial<DeliveryProject>) =>
      request<{ success: boolean; project: DeliveryProject }>(`/delivery/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    predict: (id: string) =>
      request<{ success: boolean; prediction: any }>(`/delivery/projects/${id}/predict`, {
        method: 'POST',
      }),
    import: (projects: DeliveryProject[], mode: 'replace' | 'merge') =>
      request<{ success: boolean; message: string; metrics: any; projects: DeliveryProject[] }>('/delivery/import', {
        method: 'POST',
        body: JSON.stringify({ projects, mode }),
      }),
    getWbs: (projectId: string) =>
      request<{ success: boolean; projectId: string; tasks: WbsTask[]; progress: number; confidenceScore: number; velocity: TeamVelocityMetrics; prediction: any }>(`/delivery/projects/${projectId}/wbs`),
    listAllWbs: () =>
      request<{ success: boolean; tasks: WbsTask[]; totalTasks: number; globalVelocity: TeamVelocityMetrics }>('/delivery/wbs'),
    createWbsTask: (projectId: string, taskData: Partial<WbsTask>) =>
      request<{ success: boolean; task: WbsTask; project?: DeliveryProject }>(`/delivery/projects/${projectId}/wbs`, {
        method: 'POST',
        body: JSON.stringify(taskData),
      }),
    updateWbsTask: (taskId: string, updates: Partial<WbsTask>) =>
      request<{ success: boolean; task: WbsTask; project?: DeliveryProject }>(`/delivery/wbs/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    deleteWbsTask: (taskId: string) =>
      request<{ success: boolean; deletedTaskId: string; project?: DeliveryProject }>(`/delivery/wbs/${taskId}`, {
        method: 'DELETE',
      }),
  },

  admin: {
    getMeta: () =>
      request<{
        success: boolean;
        meta: any;
        featureFlags: any;
        defaultLandingTab: string;
        availableRoles: string[];
        rolePermissions: Record<string, string[]>;
      }>('/admin/meta'),
    updateMeta: (data: { meta?: any; flags?: any; landingTab?: string }) =>
      request<{
        success: boolean;
        message: string;
        meta: any;
        featureFlags: any;
        defaultLandingTab: string;
      }>('/admin/meta', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getUsers: () =>
      request<{ success: boolean; users: any[] }>('/admin/users'),
    updateUserRole: (id: string, role: string) =>
      request<{ success: boolean; message: string; user: any }>(`/admin/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),
    inviteUser: (data: { name: string; email: string; role: string; title?: string; department?: string }) =>
      request<{ success: boolean; message: string; user: any }>('/admin/users/invite', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAuditLogs: () =>
      request<{ success: boolean; auditLogs: any[] }>('/admin/audit-logs'),
  },

  ado: {
    getConfig: () =>
      request<{ success: boolean; config: AdoConfig }>('/integrations/ado/config'),
    updateConfig: (updates: Partial<AdoConfig> & { personalAccessToken?: string }) =>
      request<{ success: boolean; message: string; config: AdoConfig }>('/integrations/ado/config', {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    testConnection: (data?: { organizationUrl?: string; projectName?: string; personalAccessToken?: string }) =>
      request<{ success: boolean; result: AdoTestResult }>('/integrations/ado/test', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    preview: (data?: { projectId?: string; workItemTypes?: string[]; iteration?: string }) =>
      request<{ success: boolean; projectId: string; totalCount: number; items: AdoWorkItemPreview[] }>('/integrations/ado/preview', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    sync: (data: { targetProjectId?: string; mode?: 'merge' | 'replace'; selectedWorkItemIds?: number[] }) =>
      request<{ success: boolean; result: AdoSyncResult; project?: DeliveryProject }>('/integrations/ado/sync', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Sliders, 
  Flag, 
  Users, 
  FileText, 
  Sparkles, 
  Save, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Lock, 
  Eye, 
  Plus, 
  Search, 
  Mail, 
  Globe, 
  HelpCircle, 
  Layout, 
  Briefcase, 
  ListChecks, 
  Building2, 
  MessageSquareHeart, 
  BarChart3, 
  Plug, 
  Download, 
  UserCheck, 
  UserX,
  ExternalLink,
  KeyRound,
  Trash2,
  RefreshCw,
  Server,
  ArrowRight
} from 'lucide-react';
import { useAuth, RoleName, ROLE_PERMISSIONS, ROLE_PERSONAS } from '../../context/AuthContext';
import { useFrontendMeta } from '../../context/FrontendMetaContext';
import { StaffMember, AuditLogEntry, FeatureFlagConfig, NavigationTab, AzureAdConfig, AzureAdGroupMapping, AzureAdTestResult } from '../../types';
import { api } from '../../api/client';
import { MicrosoftLogoSvg } from '../modals/AzureAdSsoModal';
import { AdoImportModal, AzureDevOpsLogoSvg } from '../modals/AdoImportModal';
import { RBACBanner } from '../common/RBACBanner';

export const AdminPortalPage: React.FC = () => {
  const { user, role, can, switchRole } = useAuth();
  const { 
    meta, 
    featureFlags, 
    defaultLandingTab, 
    updateMeta, 
    updateFeatureFlags, 
    updateDefaultLandingTab, 
    resetToDefaults 
  } = useFrontendMeta();

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'meta' | 'features' | 'rbac' | 'sso' | 'ado' | 'staff' | 'audit'>('meta');
  const [isAdoModalOpen, setIsAdoModalOpen] = useState(false);

  // Form states for Meta Management
  const [appName, setAppName] = useState(meta.appName);
  const [tagline, setTagline] = useState(meta.tagline);
  const [pageTitleSuffix, setPageTitleSuffix] = useState(meta.pageTitleSuffix);
  const [logoTheme, setLogoTheme] = useState(meta.logoTheme);
  const [supportEmail, setSupportEmail] = useState(meta.supportEmail);
  const [docsUrl, setDocsUrl] = useState(meta.docsUrl);
  const [maintenanceMode, setMaintenanceMode] = useState(meta.maintenanceMode);
  
  // Announcement banner form
  const [bannerEnabled, setBannerEnabled] = useState(meta.announcementBanner.enabled);
  const [bannerMessage, setBannerMessage] = useState(meta.announcementBanner.message);
  const [bannerType, setBannerType] = useState(meta.announcementBanner.type);
  const [bannerDismissible, setBannerDismissible] = useState(meta.announcementBanner.dismissible);
  const [bannerLinkText, setBannerLinkText] = useState(meta.announcementBanner.linkText || '');
  const [bannerLinkUrl, setBannerLinkUrl] = useState(meta.announcementBanner.linkUrl || '');

  // Save feedback state
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Staff members state
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffSearch, setStaffSearch] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<RoleName>('CSM');
  const [inviteTitle, setInviteTitle] = useState('');
  const [inviteDept, setInviteDept] = useState('Customer Success');

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditFilter, setAuditFilter] = useState<'all' | 'security' | 'warning' | 'info'>('all');

  // Azure AD SSO configuration state
  const [ssoConfig, setSsoConfig] = useState<AzureAdConfig>({
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
      { id: 'map-1', azureGroupId: '9e7b3a1c-8f2d-4e5a-b6c7-123456789abc', azureGroupName: 'arQuonCX-GlobalAdmins', mappedRole: 'SUPER_ADMIN', description: 'Global Directory Admins & Operations VP' },
      { id: 'map-2', azureGroupId: '2a4c6e80-1b3d-5f7a-9c1e-345678901def', azureGroupName: 'arQuonCX-CSOps', mappedRole: 'CS_OPS', description: 'CS Operations & Data Intelligence' },
      { id: 'map-3', azureGroupId: '5d6e7f80-9a1b-3c4d-5e6f-789012345ghi', azureGroupName: 'arQuonCX-DeliveryLeads', mappedRole: 'CSM', description: 'Directors of Customer Success & Technical Leads' },
      { id: 'map-4', azureGroupId: '7f8a9b0c-1d2e-3f4a-5b6c-901234567jkl', azureGroupName: 'arQuonCX-ProductGrowth', mappedRole: 'PRODUCT_GROWTH', description: 'Product Experience & Growth Leads' },
      { id: 'map-5', azureGroupId: '1b2c3d4e-5f6a-7b8c-9d0e-123456789mno', azureGroupName: 'arQuonCX-ExecutiveStakeholders', mappedRole: 'VIEWER', description: 'Executive C-Suite Viewers & Board Observers' },
    ],
    lastTestedAt: new Date(Date.now() - 3600000).toISOString(),
    testStatus: 'success',
  });

  const [ssoClientSecretInput, setSsoClientSecretInput] = useState('');
  const [newDomainInput, setNewDomainInput] = useState('');
  const [isSavingSso, setIsSavingSso] = useState(false);
  const [ssoSaveSuccess, setSsoSaveSuccess] = useState(false);
  const [isTestingSso, setIsTestingSso] = useState(false);
  const [ssoTestResult, setSsoTestResult] = useState<AzureAdTestResult | null>(null);

  // Add Group Mapping Modal
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupId, setNewGroupId] = useState('');
  const [newGroupRole, setNewGroupRole] = useState<RoleName>('CSM');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // Sync initial meta values when context updates
  useEffect(() => {
    setAppName(meta.appName);
    setTagline(meta.tagline);
    setPageTitleSuffix(meta.pageTitleSuffix);
    setLogoTheme(meta.logoTheme);
    setSupportEmail(meta.supportEmail);
    setDocsUrl(meta.docsUrl);
    setMaintenanceMode(meta.maintenanceMode);
    setBannerEnabled(meta.announcementBanner.enabled);
    setBannerMessage(meta.announcementBanner.message);
    setBannerType(meta.announcementBanner.type);
    setBannerDismissible(meta.announcementBanner.dismissible);
    setBannerLinkText(meta.announcementBanner.linkText || '');
    setBannerLinkUrl(meta.announcementBanner.linkUrl || '');
  }, [meta]);

  // Load staff & audit logs
  useEffect(() => {
    async function loadAdminData() {
      try {
        const [usersRes, auditRes, ssoRes] = await Promise.allSettled([
          api.admin.getUsers(),
          api.admin.getAuditLogs(),
          api.auth.azureAd.getConfig(),
        ]);

        if (ssoRes.status === 'fulfilled' && ssoRes.value.config) {
          setSsoConfig(ssoRes.value.config);
        }

        if (usersRes.status === 'fulfilled' && usersRes.value.users) {
          setStaff(usersRes.value.users);
        } else {
          // Pre-seed staff if API returns empty
          setStaff([
            { id: 'user_admin', name: 'Dr. Aris Vance', email: 'admin@arquoncx.io', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', role: 'SUPER_ADMIN', title: 'VP of Customer Success & Operations', department: 'Leadership', status: 'active', lastLogin: 'Just now' },
            { id: 'user_csops', name: 'David Kim', email: 'csops@arquoncx.io', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', role: 'CS_OPS', title: 'CS Operations & Data Analyst', department: 'CS Ops', status: 'active', lastLogin: '25m ago' },
            { id: 'user_dip', name: 'Dip Bagchi', email: 'dip.bagchi@qbadvisory.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80', role: 'CSM', title: 'Director of Customer Success', department: 'Customer Success', status: 'active', lastLogin: '1h ago' },
            { id: 'user_csm', name: 'Elena Rostova', email: 'elena@arquoncx.io', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', role: 'CSM', title: 'Lead Enterprise CSM', department: 'Customer Success', status: 'active', lastLogin: '3h ago' },
            { id: 'user_trevor', name: 'Trevor Vance', email: 'trevor@arquoncx.io', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', role: 'CSM', title: 'Forward Deployed Engineer', department: 'Field Engineering', status: 'active', lastLogin: '4h ago' },
            { id: 'user_shubham', name: 'Shubham Roy', email: 'shubham@arquoncx.io', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', role: 'CSM', title: 'Forward Deployed Engineer', department: 'Field Engineering', status: 'active', lastLogin: 'Yesterday' },
            { id: 'user_product', name: 'Sophia Lindqvist', email: 'product@arquoncx.io', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80', role: 'PRODUCT_GROWTH', title: 'Head of Product Growth & Onboarding', department: 'Product Growth', status: 'active', lastLogin: '5h ago' },
            { id: 'user_viewer', name: 'Alex Wright', email: 'viewer@arquoncx.io', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', role: 'VIEWER', title: 'Executive Board Observer', department: 'Stakeholders', status: 'active', lastLogin: '2d ago' },
          ]);
        }

        if (auditRes.status === 'fulfilled' && auditRes.value.auditLogs) {
          setAuditLogs(auditRes.value.auditLogs);
        } else {
          setAuditLogs([
            { id: 'audit-001', action: 'META_CONFIG_UPDATE', actor: 'Dr. Aris Vance (Super Admin)', details: 'Updated global announcement banner and default branding theme.', severity: 'info', timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: 'audit-002', action: 'FEATURE_FLAG_TOGGLE', actor: 'Dr. Aris Vance (Super Admin)', details: 'Enabled Deployment WBS & Checklist module across enterprise workspaces.', severity: 'info', timestamp: new Date(Date.now() - 7200000).toISOString() },
            { id: 'audit-003', action: 'ROLE_PROMOTION', actor: 'Dr. Aris Vance (Super Admin)', details: 'Promoted David Kim from CSM to CS_OPS with team management permissions.', severity: 'security', timestamp: new Date(Date.now() - 86400000).toISOString() },
            { id: 'audit-004', action: 'API_KEY_ROTATED', actor: 'David Kim (CS Ops)', details: 'Provisioned production ingestion API key: aq_live_prod_2026_x89', severity: 'warning', timestamp: new Date(Date.now() - 172800000).toISOString() },
          ]);
        }
      } catch (err) {
        console.warn('Admin data load notice:', err);
      }
    }

    loadAdminData();
  }, []);

  // Check Admin permission gate
  const isAdmin = role === 'SUPER_ADMIN' || role === 'CS_OPS' || can('team:manage');

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white dark:bg-[#0E162E] rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Access Restricted: Administrator Privileges Required
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            The Admin Console and Frontend Meta Management features are restricted to users with the <strong className="text-slate-800 dark:text-slate-200">SUPER_ADMIN</strong> or <strong className="text-slate-800 dark:text-slate-200">CS_OPS</strong> role.
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-[#111C35] rounded-xl border border-slate-200 dark:border-[#22355C] max-w-sm mx-auto text-xs text-left space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Current User:</span>
            <strong className="text-slate-800 dark:text-slate-200">{user.name}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Current Role:</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {role}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => switchRole('SUPER_ADMIN')}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Switch to Super Admin (Evaluation Mode)</span>
          </button>
        </div>
      </div>
    );
  }

  // Handle Meta Save
  const handleSaveMeta = async () => {
    setIsSavingMeta(true);
    try {
      await updateMeta({
        appName,
        tagline,
        pageTitleSuffix,
        logoTheme,
        supportEmail,
        docsUrl,
        maintenanceMode,
        announcementBanner: {
          enabled: bannerEnabled,
          message: bannerMessage,
          type: bannerType,
          dismissible: bannerDismissible,
          linkText: bannerLinkText,
          linkUrl: bannerLinkUrl,
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSavingMeta(false);
    }
  };

  // Handle Feature Flag Toggle
  const handleToggleFlag = async (key: keyof FeatureFlagConfig) => {
    const updated = !featureFlags[key];
    await updateFeatureFlags({ [key]: updated });
  };

  // Handle Staff Role Change
  const handleChangeStaffRole = async (staffId: string, newRole: RoleName) => {
    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, role: newRole } : s));
    try {
      await api.admin.updateUserRole(staffId, newRole);
    } catch (err) {
      console.warn('Role update notice:', err);
    }
  };

  // Handle Invite Staff Submit
  const handleInviteStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    const newStaffMember: StaffMember = {
      id: `user_${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: inviteRole,
      title: inviteTitle || 'Customer Success Specialist',
      department: inviteDept || 'Customer Success',
      status: 'active',
      lastLogin: 'Never (Invited)',
    };

    setStaff(prev => [...prev, newStaffMember]);
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInviteTitle('');

    try {
      await api.admin.inviteUser({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        title: inviteTitle,
        department: inviteDept,
      });
    } catch (err) {
      console.warn('Invite notice:', err);
    }
  };

  // Handle Save SSO Configuration
  const handleSaveSso = async () => {
    setIsSavingSso(true);
    try {
      const res = await api.auth.azureAd.updateConfig({
        ...ssoConfig,
        clientSecret: ssoClientSecretInput ? ssoClientSecretInput : undefined,
      });
      if (res.success && res.config) {
        setSsoConfig(res.config);
        setSsoClientSecretInput('');
      }
      setSsoSaveSuccess(true);
      setTimeout(() => setSsoSaveSuccess(false), 3000);
    } catch (err: any) {
      console.warn('Save SSO notice:', err);
      setSsoSaveSuccess(true);
      setTimeout(() => setSsoSaveSuccess(false), 3000);
    } finally {
      setIsSavingSso(false);
    }
  };

  // Handle Test Azure AD Connection
  const handleTestSsoConnection = async () => {
    setIsTestingSso(true);
    try {
      const result = await api.auth.azureAd.testConnection();
      setSsoTestResult(result);
      setSsoConfig(prev => ({
        ...prev,
        lastTestedAt: result.timestamp,
        testStatus: result.success ? 'success' : 'failed',
      }));
    } catch (err: any) {
      setSsoTestResult({
        success: false,
        timestamp: new Date().toISOString(),
        tenantValidated: false,
        authorityReachable: false,
        latencyMs: 0,
        openidConfiguration: {
          issuer: `https://login.microsoftonline.com/${ssoConfig.tenantId}/v2.0`,
          authorization_endpoint: '',
          token_endpoint: '',
          jwks_uri: '',
        },
        message: err.message || 'Connection test failed',
      });
    } finally {
      setIsTestingSso(false);
    }
  };

  // Handle Allowed Domains
  const handleAddDomain = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newDomainInput.trim().toLowerCase().replace(/^@/, '');
    if (!clean) return;
    if (!ssoConfig.allowedDomains.includes(clean)) {
      setSsoConfig(prev => ({
        ...prev,
        allowedDomains: [...prev.allowedDomains, clean],
      }));
    }
    setNewDomainInput('');
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    setSsoConfig(prev => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter(d => d !== domainToRemove),
    }));
  };

  // Handle Group Mappings
  const handleAddGroupMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupId.trim()) return;

    const newMapping: AzureAdGroupMapping = {
      id: `map-${Date.now()}`,
      azureGroupName: newGroupName.trim(),
      azureGroupId: newGroupId.trim(),
      mappedRole: newGroupRole,
      description: newGroupDesc.trim() || `Mapped to ${newGroupRole}`,
    };

    setSsoConfig(prev => ({
      ...prev,
      groupMappings: [...prev.groupMappings, newMapping],
    }));

    setNewGroupName('');
    setNewGroupId('');
    setNewGroupDesc('');
    setIsAddGroupModalOpen(false);
  };

  const handleDeleteGroupMapping = (mappingId: string) => {
    setSsoConfig(prev => ({
      ...prev,
      groupMappings: prev.groupMappings.filter(m => m.id !== mappingId),
    }));
  };

  // Filtered staff list
  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
    s.title.toLowerCase().includes(staffSearch.toLowerCase()) ||
    s.role.toLowerCase().includes(staffSearch.toLowerCase())
  );

  // Filtered audit logs
  const filteredAudit = auditLogs.filter(a => {
    if (auditFilter === 'all') return true;
    return a.severity === auditFilter;
  });

  return (
    <div className="space-y-4">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-[#0B1228] p-4 rounded-xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Admin Console & Frontend Meta Management
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure application branding, feature flags, global announcement banners, RBAC permissions, and staff provisioning.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-[#111C35] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#22355C] rounded-lg hover:bg-slate-50 dark:hover:bg-[#162547] transition-colors cursor-pointer"
            title="Reset frontend meta and feature flags to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSaveMeta}
            disabled={isSavingMeta}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved & Applied!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dynamic RBAC Role & Persona Access Control Simulator */}
      <RBACBanner />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#0B1228] p-1.5 rounded-xl border border-slate-200 dark:border-[#1E2D52] overflow-x-auto text-xs font-semibold">
        {[
          { id: 'meta' as const, label: 'Frontend Meta & Brand', icon: Layout },
          { id: 'features' as const, label: 'Feature Flags & Modules', icon: Flag },
          { id: 'rbac' as const, label: 'RBAC Permission Matrix', icon: Lock },
          { id: 'sso' as const, label: 'Azure AD & Entra ID SSO', icon: KeyRound },
          { id: 'ado' as const, label: 'Azure DevOps (ADO)', icon: Server },
          { id: 'staff' as const, label: 'Staff Directory & Roles', icon: Users },
          { id: 'audit' as const, label: 'Security & Audit Logs', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111C35]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Frontend Meta & Brand Management */}
      {activeTab === 'meta' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Configuration Card */}
          <div className="lg:col-span-2 space-y-4">
            {/* Brand & Wordmark Identity */}
            <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Application Identity & Wordmark
                </h3>
                <span className="text-[10px] text-slate-400">Live reactive across UI</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Application Name *
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. arQuonCX"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white font-bold outline-hidden focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Rendered on topbar, sidebar logo, and login screen.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Browser Page Title Suffix
                  </label>
                  <input
                    type="text"
                    value={pageTitleSuffix}
                    onChange={(e) => setPageTitleSuffix(e.target.value)}
                    placeholder="e.g. Enterprise CS & Delivery"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Appears in browser tab: <code className="font-mono text-[9px]">{appName} | {pageTitleSuffix}</code>
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Brand Tagline / Workspace Subtitle
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Enterprise Customer Success & Project Delivery Suite"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Theme Accent Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Brand Theme & Color Scheme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'indigo' as const, label: 'Quantum Indigo', color: 'bg-indigo-600', ring: 'ring-indigo-500' },
                    { id: 'emerald' as const, label: 'Enterprise Mint', color: 'bg-emerald-600', ring: 'ring-emerald-500' },
                    { id: 'violet' as const, label: 'Cyber Violet', color: 'bg-purple-600', ring: 'ring-purple-500' },
                    { id: 'dark' as const, label: 'Obsidian Navy', color: 'bg-slate-800', ring: 'ring-slate-400' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setLogoTheme(t.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        logoTheme === t.id
                          ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/20 font-bold'
                          : 'border-slate-200 dark:border-[#22355C] bg-white dark:bg-[#111C35] hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${t.color}`} />
                      <span className="text-[11px] truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Global Announcement Banner Configuration */}
            <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Flag className="w-4 h-4 text-amber-500" />
                    Global Top Announcement Banner
                  </h3>
                  <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full ${
                    bannerEnabled 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {bannerEnabled ? 'Active Live' : 'Disabled'}
                  </span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={bannerEnabled}
                    onChange={(e) => setBannerEnabled(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Display Banner</span>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Announcement Message Content
                  </label>
                  <textarea
                    rows={2}
                    value={bannerMessage}
                    onChange={(e) => setBannerMessage(e.target.value)}
                    placeholder="Enter announcement text visible to all staff..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-purple-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Banner Severity / Style
                    </label>
                    <select
                      value={bannerType}
                      onChange={(e) => setBannerType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-purple-500"
                    >
                      <option value="info">Info (Blue / Indigo)</option>
                      <option value="warning">Warning (Amber / Yellow)</option>
                      <option value="success">Success (Emerald Green)</option>
                      <option value="critical">Critical / Incident (Rose Red)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Action Link Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={bannerLinkText}
                      onChange={(e) => setBannerLinkText(e.target.value)}
                      placeholder="e.g. Learn More"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Action Link URL
                    </label>
                    <input
                      type="text"
                      value={bannerLinkUrl}
                      onChange={(e) => setBannerLinkUrl(e.target.value)}
                      placeholder="e.g. #delivery-briefing"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Live Banner Preview
                  </span>
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    bannerType === 'critical'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                      : bannerType === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                        : bannerType === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                          : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-800 dark:text-indigo-300'
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      {bannerType === 'critical' ? <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" /> :
                       bannerType === 'warning' ? <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" /> :
                       bannerType === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> :
                       <Info className="w-4 h-4 shrink-0 text-indigo-500" />}
                      <span className="font-medium truncate">{bannerMessage || 'Announcement message preview'}</span>
                    </div>
                    {bannerLinkText && (
                      <span className="font-bold underline text-[11px] shrink-0">
                        {bannerLinkText} →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: System Modes & Support Meta */}
          <div className="space-y-4">
            {/* System Modes & Safety Killswitch */}
            <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Emergency & System Modes
              </h3>

              <div className="space-y-3 text-xs">
                {/* Maintenance Mode */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Maintenance Mode
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Puts non-admin sessions into read-only mode for upgrades.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600" />
                  </label>
                </div>

                {/* Telemetry Ingestion */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Live Telemetry Ingestion
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Accept incoming events from client-side JS SDK.
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Support & Docs Meta */}
            <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-3 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Support & Help Meta
              </h3>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Support Contact Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-purple-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Knowledge Base / Docs URL
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={docsUrl}
                    onChange={(e) => setDocsUrl(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-purple-500 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Feature Flags & Module Controls */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#1E2D52]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flag className="w-4 h-4 text-purple-600" />
                  Frontend Navigation Modules & Feature Switches
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Toggling a feature off immediately removes the navigation tab and disables associated access across all staff roles.
                </p>
              </div>

              {/* Default Landing Tab Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Default Staff Landing:</span>
                <select
                  value={defaultLandingTab}
                  onChange={(e) => updateDefaultLandingTab(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg font-bold text-indigo-600 dark:text-indigo-400 outline-hidden"
                >
                  <option value="overview">Overview Dashboard</option>
                  <option value="delivery-briefing">C-Suite Delivery Briefing</option>
                  <option value="deployment-wbs">Deployment WBS & Checklist</option>
                  <option value="accounts">Accounts 360°</option>
                  <option value="flows">Adoption Flows</option>
                  <option value="surveys">Surveys & NPS</option>
                </select>
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
              {[
                { key: 'deliveryBriefing' as const, label: 'C-Suite Delivery Briefing', icon: Briefcase, desc: 'Weekly executive delivery status, predicted Go-Live variance, and ARR-at-risk tracking.' },
                { key: 'deploymentWbs' as const, label: 'Deployment WBS & Checklist', icon: ListChecks, desc: 'Work breakdown structure, effort-weighted completion %, algorithmic confidence, and team velocity.' },
                { key: 'accounts360' as const, label: 'Accounts 360° CRM', icon: Building2, desc: 'Enterprise account health scores, ARR tracking, stakeholder champion tags, and renewal countdowns.' },
                { key: 'usersSegments' as const, label: 'Users & Segments Directory', icon: Users, desc: 'Tracked client user directory with session frequency, feature tagging, and dynamic cohorts.' },
                { key: 'adoptionFlows' as const, label: 'In-App Adoption Flows & Tours', icon: Sparkles, desc: 'Visual walkthrough builder, modals, step-by-step guides, and interactive flow simulator.' },
                { key: 'surveysNps' as const, label: 'Surveys & NPS CSAT Feedback', icon: MessageSquareHeart, desc: 'Voice of customer surveys, sentiment analysis, and detractor close-the-loop triage workflow.' },
                { key: 'productAnalytics' as const, label: 'Product Analytics & Funnels', icon: BarChart3, desc: 'Feature adoption heatmaps, multi-step funnel conversion drop-offs, and retention cohorts.' },
                { key: 'resourceCenter' as const, label: 'Resource Center Floating Widget', icon: HelpCircle, desc: 'Persistent on-screen widget offering in-app guides, search, and instant support.' },
                { key: 'integrations' as const, label: 'Integrations & Webhook Hub', icon: Plug, desc: 'Connectors for Salesforce, HubSpot, Slack, Segment, Mixpanel, and ingestion API keys.' },
                { key: 'aiForecasting' as const, label: 'AI Predictive Forecasting Engine', icon: Sparkles, desc: 'Algorithmic Go-Live prediction factoring team velocity, blocker severity, and hour burn rate.' },
              ].map(mod => {
                const Icon = mod.icon;
                const isEnabled = featureFlags[mod.key];
                return (
                  <div
                    key={mod.key}
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 transition-all ${
                      isEnabled
                        ? 'bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#22355C]'
                        : 'bg-slate-50 dark:bg-[#0A1024] border-slate-200/60 dark:border-[#1E2D52] opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`p-2 rounded-lg mt-0.5 ${isEnabled ? 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {mod.label}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded-full ${
                            isEnabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {mod.desc}
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggleFlag(mod.key)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600" />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: RBAC Roles & Permissions Matrix */}
      {activeTab === 'rbac' && (
        <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                Role-Based Access Control (RBAC) Authority Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Granular permission mappings strictly enforced on both frontend components and backend REST endpoints.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#111C35] text-slate-600 dark:text-slate-300">
              5 System Roles Configured
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#1E2D52] bg-slate-50/70 dark:bg-[#111C35] text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="py-2.5 px-3">Permission Key / Domain</th>
                  <th className="py-2.5 px-3 text-center">Super Admin</th>
                  <th className="py-2.5 px-3 text-center">CS Ops</th>
                  <th className="py-2.5 px-3 text-center">CSM</th>
                  <th className="py-2.5 px-3 text-center">Product Growth</th>
                  <th className="py-2.5 px-3 text-center">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E2D52]">
                {[
                  { domain: 'Accounts 360 & Touchpoints', items: [
                    { key: 'account:read', name: 'Read Account CRM & Scores' },
                    { key: 'account:write', name: 'Create / Edit Client Accounts' },
                    { key: 'account:touchpoint', name: 'Log CSM Meeting Notes' },
                    { key: 'account:delete', name: 'Delete Client Accounts' },
                  ]},
                  { domain: 'In-App Adoption Flows', items: [
                    { key: 'flow:read', name: 'View Flows & Tours' },
                    { key: 'flow:write', name: 'Author Flows in Simulator' },
                    { key: 'flow:publish', name: 'Publish Live to Clients' },
                    { key: 'flow:delete', name: 'Archive / Delete Flows' },
                  ]},
                  { domain: 'Voice of Customer & Surveys', items: [
                    { key: 'survey:read', name: 'View NPS Scores & CSAT' },
                    { key: 'survey:write', name: 'Create NPS / Micro Surveys' },
                    { key: 'survey:triage', name: 'Triage Detractor Feedback' },
                  ]},
                  { domain: 'Product Analytics & Tagging', items: [
                    { key: 'analytics:read', name: 'View Retention & Funnels' },
                    { key: 'analytics:tag', name: 'Tag UI Selectors for Tracking' },
                    { key: 'analytics:export', name: 'Export Telemetry Data' },
                  ]},
                  { domain: 'Admin, Meta & Governance', items: [
                    { key: 'team:manage', name: 'Manage Staff Roles & Meta' },
                    { key: 'api_keys:manage', name: 'Provision Ingestion API Keys' },
                    { key: 'integrations:manage', name: 'Connect CRM & Webhooks' },
                    { key: 'audit:read', name: 'Inspect Security Audit Trail' },
                  ]},
                ].map(group => (
                  <React.Fragment key={group.domain}>
                    <tr className="bg-slate-100/50 dark:bg-[#070B19]/50 font-bold text-[10px] uppercase text-purple-700 dark:text-purple-300">
                      <td colSpan={6} className="py-1.5 px-3">{group.domain}</td>
                    </tr>
                    {group.items.map(item => (
                      <tr key={item.key} className="hover:bg-slate-50 dark:hover:bg-[#131F3B] transition-colors">
                        <td className="py-2 px-3">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">{item.name}</span>
                          <span className="font-mono text-[9px] text-slate-400 block">{item.key}</span>
                        </td>
                        {(['SUPER_ADMIN', 'CS_OPS', 'CSM', 'PRODUCT_GROWTH', 'VIEWER'] as RoleName[]).map(r => {
                          const hasPerm = ROLE_PERMISSIONS[r]?.includes(item.key as any);
                          return (
                            <td key={r} className="py-2 px-3 text-center">
                              {hasPerm ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                                  <Check className="w-3 h-3" />
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-700 font-mono text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Azure Active Directory / Microsoft Entra ID SSO */}
      {activeTab === 'sso' && (
        <div className="space-y-4">
          {/* Top Banner Card */}
          <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#152347] border border-slate-200/80 dark:border-[#243B6E] shadow-xs shrink-0">
                  <MicrosoftLogoSvg className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Microsoft Azure Active Directory (Entra ID) Single Sign-On
                    </h2>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      ssoConfig.enabled
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}>
                      {ssoConfig.enabled ? 'SSO Active' : 'SSO Disabled'}
                    </span>
                    {ssoConfig.testStatus === 'success' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-500" />
                        Tenant Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Federate arQuonCX authentication directly with your Microsoft 365 / Entra ID tenant, security groups, and automated JIT provisioning.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleTestSsoConnection}
                  disabled={isTestingSso}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-[#111C35] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#22355C] rounded-lg hover:bg-slate-50 dark:hover:bg-[#162547] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSso ? 'animate-spin text-blue-500' : ''}`} />
                  <span>{isTestingSso ? 'Testing Tenant...' : 'Test Azure AD Connection'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveSso}
                  disabled={isSavingSso}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {ssoSaveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Settings Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save SSO Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Diagnostic Result Drawer if tested */}
            {ssoTestResult && (
              <div className={`mt-4 p-3.5 rounded-xl border text-xs ${
                ssoTestResult.success
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/50 dark:border-emerald-800/50 mb-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{ssoTestResult.message}</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/60 dark:bg-black/30">
                    Roundtrip Latency: {ssoTestResult.latencyMs}ms
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Authority Issuer: </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{ssoTestResult.openidConfiguration.issuer}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Token Endpoint: </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{ssoTestResult.openidConfiguration.token_endpoint}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Column: App Registration & Domain Governance (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* App Registration Details */}
              <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Azure AD App Registration (Entra ID)
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={ssoConfig.enabled}
                      onChange={(e) => setSsoConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className={ssoConfig.enabled ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
                      Enable Azure AD SSO
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Directory (Tenant) ID *
                    </label>
                    <input
                      type="text"
                      value={ssoConfig.tenantId}
                      onChange={(e) => setSsoConfig(prev => ({ ...prev, tenantId: e.target.value, authority: `https://login.microsoftonline.com/${e.target.value}/v2.0` }))}
                      placeholder="e.g. 72f988bf-86f1-41af-91ab-2d7cd011db47"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Application (Client) ID *
                    </label>
                    <input
                      type="text"
                      value={ssoConfig.clientId}
                      onChange={(e) => setSsoConfig(prev => ({ ...prev, clientId: e.target.value }))}
                      placeholder="e.g. 3a9b1c72-4d8e-49f0-bc23-891ef64521a0"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                        Client Secret
                      </label>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {ssoConfig.clientSecretConfigured ? '✓ Configured & Masked' : 'Not set'}
                      </span>
                    </div>
                    <input
                      type="password"
                      value={ssoClientSecretInput}
                      onChange={(e) => setSsoClientSecretInput(e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Redirect URI (Callback)
                    </label>
                    <input
                      type="text"
                      value={ssoConfig.redirectUri}
                      onChange={(e) => setSsoConfig(prev => ({ ...prev, redirectUri: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Authority / Issuer URL
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={ssoConfig.authority}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-[#152342] border border-slate-200 dark:border-[#22355C] rounded-lg font-mono text-slate-600 dark:text-slate-400 select-all"
                  />
                </div>
              </div>

              {/* Corporate Domains & Governance Policies */}
              <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Allowed Corporate Domains & Security Policies
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {ssoConfig.allowedDomains.length} domains active
                  </span>
                </div>

                {/* Allowed Domains Tags */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                    Whitelisted Corporate Email Domains
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    {ssoConfig.allowedDomains.map(domain => (
                      <span
                        key={domain}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-mono text-xs font-bold"
                      >
                        <span>@{domain}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain(domain)}
                          className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  <form onSubmit={handleAddDomain} className="flex gap-2">
                    <input
                      type="text"
                      value={newDomainInput}
                      onChange={(e) => setNewDomainInput(e.target.value)}
                      placeholder="e.g. acme-corp.com"
                      className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg font-mono text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#162547] dark:hover:bg-[#1E305C] font-semibold text-slate-700 dark:text-slate-200 rounded-lg text-xs cursor-pointer"
                    >
                      + Add Domain
                    </button>
                  </form>
                </div>

                {/* Security Policy Switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-[#1E2D52]">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111C35] border border-slate-200/80 dark:border-[#22355C] space-y-1">
                    <label className="flex items-center justify-between cursor-pointer font-bold text-slate-900 dark:text-white">
                      <span>Enforce Azure AD SSO</span>
                      <input
                        type="checkbox"
                        checked={ssoConfig.enforceSso}
                        onChange={(e) => setSsoConfig(prev => ({ ...prev, enforceSso: e.target.checked }))}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Disallow password login for users in allowed corporate domains.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111C35] border border-slate-200/80 dark:border-[#22355C] space-y-1">
                    <label className="flex items-center justify-between cursor-pointer font-bold text-slate-900 dark:text-white">
                      <span>Just-In-Time (JIT) Provisioning</span>
                      <input
                        type="checkbox"
                        checked={ssoConfig.allowJitProvisioning}
                        onChange={(e) => setSsoConfig(prev => ({ ...prev, allowJitProvisioning: e.target.checked }))}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Auto-create staff accounts on first successful Entra ID token authentication.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Default Role for Unmapped Entra ID Users
                  </label>
                  <select
                    value={ssoConfig.defaultRole}
                    onChange={(e) => setSsoConfig(prev => ({ ...prev, defaultRole: e.target.value as RoleName }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="CSM">CSM / Delivery Lead (Recommended)</option>
                    <option value="VIEWER">Viewer (Read-Only)</option>
                    <option value="PRODUCT_GROWTH">Product Growth</option>
                    <option value="CS_OPS">CS Operations</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Group-to-Role Mapping Manager (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Azure AD Group-to-Role Mapping ({ssoConfig.groupMappings.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Entra ID groups claim determines arQuonCX authorization role.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddGroupModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Rule</span>
                  </button>
                </div>

                {/* Group Mapping Rules List */}
                <div className="space-y-2.5">
                  {ssoConfig.groupMappings.map(mapping => {
                    const roleColor = mapping.mappedRole === 'SUPER_ADMIN' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                      : mapping.mappedRole === 'CS_OPS'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      : mapping.mappedRole === 'CSM'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : mapping.mappedRole === 'PRODUCT_GROWTH'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

                    return (
                      <div
                        key={mapping.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-[#111C35] border border-slate-200/80 dark:border-[#22355C] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {mapping.azureGroupName}
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${roleColor}`}>
                              {mapping.mappedRole}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteGroupMapping(mapping.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded-sm cursor-pointer"
                            title="Delete mapping rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          <span className="truncate max-w-[200px]" title={mapping.azureGroupId}>
                            OID: {mapping.azureGroupId}
                          </span>
                          <span className="text-slate-400 font-sans italic truncate max-w-[150px]">
                            {mapping.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Helpful instructions note */}
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-[#111D3D] border border-blue-200/70 dark:border-blue-900/50 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300">
                    <Info className="w-3.5 h-3.5" />
                    <span>Azure AD Claims Configuration Tip</span>
                  </div>
                  <p className="leading-relaxed">
                    In the Azure Portal, navigate to <strong>App registrations &gt; Token configuration &gt; Add groups claim</strong>, and select <em>Security groups</em>. arQuonCX evaluates both the group name and object ID.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Azure DevOps Ingestion & Synchronizer */}
      {activeTab === 'ado' && (
        <div className="space-y-4">
          {/* Top Status & Launch Bar */}
          <div className="bg-gradient-to-r from-blue-900/40 via-sky-950/30 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl">
                <AzureDevOpsLogoSvg className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Azure DevOps (ADO) Work Item &amp; Sprint Synchronization
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                    REST API v7.1
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Enterprise-grade ingestion engine connecting Microsoft Azure DevOps boards with arQuonCX WBS deliverables, real-time sprint burndown, and executive C-Suite delivery briefings.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsAdoModalOpen(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <AzureDevOpsLogoSvg className="w-4 h-4 text-white" />
                <span>Launch ADO Ingestion Console</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#0E162E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span className="font-bold uppercase tracking-wider">Default Organization</span>
                <Globe className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                https://dev.azure.com/arQuon-Enterprise
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                TLS 1.3 Verified • Latency: 54ms
              </div>
            </div>

            <div className="bg-white dark:bg-[#0E162E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span className="font-bold uppercase tracking-wider">Sync Mechanism</span>
                <RefreshCw className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Bi-Directional + Service Hooks
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Real-time Webhook listener receiving state &amp; work changes
              </div>
            </div>

            <div className="bg-white dark:bg-[#0E162E] p-4 rounded-xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span className="font-bold uppercase tracking-wider">Synchronized Accounts</span>
                <Server className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                SHPL, ArcelorMittal, Indorama
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Automatic rollup into executive confidence scores
              </div>
            </div>
          </div>

          {/* Webhook Endpoint Instructions */}
          <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Azure DevOps Service Hook Webhook Integration
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              To trigger instantaneous updates in arQuonCX whenever an engineer completes a task, closes a bug, or moves a story on the Azure Boards Kanban, configure this webhook in your Azure DevOps Project Settings under <strong>Service Hooks &gt; Web Hooks</strong>.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono text-xs">
              <span className="text-blue-600 dark:text-blue-400">https://api.arquoncx.io/api/v1/integrations/ado/webhook</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://api.arquoncx.io/api/v1/integrations/ado/webhook');
                }}
                className="text-[11px] font-sans font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 cursor-pointer"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Staff Directory & User Role Assignment */}
      {activeTab === 'staff' && (
        <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Internal Staff Directory & Role Provisioning ({staff.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Assign roles to staff members to grant or restrict specific application areas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  placeholder="Filter by name, role, email..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#111C35] rounded-lg border border-slate-200 dark:border-[#22355C] text-slate-800 dark:text-slate-100 outline-hidden"
                />
              </div>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Invite Staff</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#1E2D52] bg-slate-50/70 dark:bg-[#111C35] text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="py-2.5 px-3">Team Member</th>
                  <th className="py-2.5 px-3">Assigned Role</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Last Active</th>
                  <th className="py-2.5 px-3 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E2D52]">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-[#131F3B] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {member.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        member.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200' :
                        member.role === 'CS_OPS' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200' :
                        member.role === 'CSM' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200' :
                        member.role === 'PRODUCT_GROWTH' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200'
                      }`}>
                        {member.role}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium">
                      {member.department}
                    </td>

                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                      {member.lastLogin}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeStaffRole(member.id, e.target.value as RoleName)}
                        className="px-2 py-1 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer"
                      >
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="CS_OPS">CS Operations</option>
                        <option value="CSM">CSM / FDE</option>
                        <option value="PRODUCT_GROWTH">Product Growth</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Security & Governance Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Administrative Audit Trail & Security Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Immutable event stream documenting metadata adjustments, role promotions, and feature switches.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {(['all', 'security', 'warning', 'info'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setAuditFilter(sev)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border capitalize transition-all cursor-pointer ${
                    auditFilter === sev
                      ? 'bg-purple-600 text-white border-transparent'
                      : 'bg-white dark:bg-[#111C35] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#22355C]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredAudit.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-[#1E2D52] bg-slate-50/50 dark:bg-[#111C35]/50 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className={`p-1.5 rounded-lg mt-0.5 ${
                    log.severity === 'security' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                    log.severity === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}>
                    {log.severity === 'security' ? <ShieldAlert className="w-3.5 h-3.5" /> :
                     log.severity === 'warning' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                     <Info className="w-3.5 h-3.5" />}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400">by {log.actor}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                      {log.details}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Staff Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E162E] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E2D52] overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-[#1E2D52] flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Invite New Staff Member
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteStaffSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Rachel Chen"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as RoleName)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-purple-500"
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="CS_OPS">CS Operations</option>
                    <option value="CSM">CSM / Delivery</option>
                    <option value="PRODUCT_GROWTH">Product Growth</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value)}
                    placeholder="Customer Success"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  placeholder="e.g. Strategic Customer Success Manager"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Azure AD Group Mapping */}
      {isAddGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0E162E] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E2D52] overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-[#1E2D52] flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MicrosoftLogoSvg className="w-4 h-4" />
                Add Azure AD Group-to-Role Rule
              </h3>
              <button
                onClick={() => setIsAddGroupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGroupMapping} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Azure AD Security Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. arQuonCX-FieldEng"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Azure Object ID (GUID) *
                </label>
                <input
                  type="text"
                  required
                  value={newGroupId}
                  onChange={(e) => setNewGroupId(e.target.value)}
                  placeholder="e.g. 5d6e7f80-9a1b-3c4d-5e6f-789012345ghi"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target arQuonCX Role *
                </label>
                <select
                  value={newGroupRole}
                  onChange={(e) => setNewGroupRole(e.target.value as RoleName)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-blue-500 font-semibold cursor-pointer"
                >
                  <option value="CSM">CSM / Field Delivery Lead</option>
                  <option value="SUPER_ADMIN">Super Admin (Privileged)</option>
                  <option value="CS_OPS">CS Operations & Analytics</option>
                  <option value="PRODUCT_GROWTH">Product Growth</option>
                  <option value="VIEWER">Viewer (Executive Read-Only)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rule Description
                </label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="e.g. Field Engineering and Customer Delivery leads"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGroupModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                >
                  Save Group Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Azure DevOps Ingestion Modal */}
      <AdoImportModal
        isOpen={isAdoModalOpen}
        onClose={() => setIsAdoModalOpen(false)}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  X, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Key, 
  Globe, 
  FolderGit2, 
  Filter, 
  Database,
  ArrowRight,
  ShieldCheck,
  Bug,
  ListTodo,
  FileSpreadsheet,
  Download,
  Building2,
  Sparkles,
  Trash2
} from 'lucide-react';
import { api } from '../../api/client';
import { 
  AdoConfig, 
  AdoWorkItemPreview, 
  AdoSyncResult, 
  AdoTestResult, 
  AdoWorkItemType,
  DeliveryProject 
} from '../../types';

interface AdoImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProjectId?: string;
  availableProjects?: DeliveryProject[];
  onProjectsSynced?: (projects: DeliveryProject[]) => void;
  onSyncComplete?: (result: AdoSyncResult, updatedProject?: DeliveryProject) => void;
}

export const AzureDevOpsLogoSvg = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 8.868L4.354 5.67V3.535L13.79 0V4.321L7.202 6.549v10.873l6.588 2.257V24L4.354 20.465v-2.135L0 15.132V8.868z" fill="#0078D7"/>
    <path d="M19.646 5.67L24 8.868v6.264l-4.354 3.198v2.135L10.21 24v-4.329l6.588-2.257V6.541L10.21 4.284V0l9.436 3.535V5.67z" fill="#0078D7"/>
  </svg>
);

export const AdoImportModal: React.FC<AdoImportModalProps> = ({
  isOpen,
  onClose,
  targetProjectId = 'proj-1',
  availableProjects = [],
  onProjectsSynced,
  onSyncComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'config'>('preview');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(targetProjectId);
  const [selectedProjectName, setSelectedProjectName] = useState<string>('');
  const [syncMode, setSyncMode] = useState<'merge' | 'replace'>('merge');
  
  // Data states
  const [portfolioProjects, setPortfolioProjects] = useState<DeliveryProject[]>(availableProjects);
  const [config, setConfig] = useState<AdoConfig | null>(null);
  const [remoteProjects, setRemoteProjects] = useState<Array<{ id: string; name: string; description?: string }>>([]);
  const [previewItems, setPreviewItems] = useState<AdoWorkItemPreview[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [isLiveAdo, setIsLiveAdo] = useState(false);
  
  // Form states
  const [orgUrl, setOrgUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [patToken, setPatToken] = useState('');
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingProjects, setIsSyncingProjects] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [testResult, setTestResult] = useState<AdoTestResult | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<AdoSyncResult | null>(null);
  const [projectSyncNotice, setProjectSyncNotice] = useState<string | null>(null);
  const [cleanSuccessNotice, setCleanSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync selectedProjectId with prop if changed
  useEffect(() => {
    if (targetProjectId) {
      setSelectedProjectId(targetProjectId);
    }
  }, [targetProjectId]);

  // Load config & preview data on modal open or project switch
  useEffect(() => {
    if (isOpen) {
      loadConfigAndProjects();
      setSyncSuccess(null);
      setErrorMessage(null);
      setCleanSuccessNotice(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedProjectId) {
      loadPreview(selectedProjectId, selectedProjectName);
    }
  }, [selectedProjectId, selectedProjectName]);

  const loadConfigAndProjects = async () => {
    try {
      const res = await api.ado.getConfig();
      if (res.success && res.config) {
        setConfig(res.config);
        setOrgUrl(res.config.organizationUrl || '');
        setProjectName(res.config.projectName || '');
      }

      if (availableProjects.length === 0) {
        try {
          const pRes = await api.delivery.list();
          if (pRes.success && Array.isArray(pRes.projects)) {
            setPortfolioProjects(pRes.projects);
          }
        } catch (e) {
          console.warn('Could not fetch delivery projects:', e);
        }
      }

      // If PAT is already configured, fetch live remote projects
      try {
        const projRes = await api.ado.listProjects();
        if (projRes.success && Array.isArray(projRes.projects) && projRes.projects.length > 0) {
          setRemoteProjects(projRes.projects);
          if (projRes.isLiveAdo) {
            setIsLiveAdo(true);
          }
        }
      } catch (err) {
        console.warn('Could not auto-list remote projects:', err);
      }
    } catch (err: any) {
      console.warn('Could not load ADO config:', err.message);
    }
  };

  const handleOrgUrlChange = (value: string) => {
    setOrgUrl(value);
    // If user pasted a full URL like https://dev.azure.com/org/project, auto-extract
    try {
      let clean = value.trim();
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = 'https://' + clean;
      }
      const u = new URL(clean);
      const parts = u.pathname.split('/').filter(Boolean);
      if (u.hostname.includes('dev.azure.com') && parts.length >= 2) {
        setOrgUrl(`${u.protocol}//${u.hostname}/${parts[0]}`);
        setProjectName(decodeURIComponent(parts[1]));
      } else if (u.hostname.includes('.visualstudio.com') && parts.length >= 1) {
        setOrgUrl(`${u.protocol}//${u.hostname}`);
        setProjectName(decodeURIComponent(parts[0]));
      }
    } catch {
      // Keep as-is
    }
  };

  const loadPreview = async (projId: string, projName?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.ado.preview({ 
        projectId: projId,
        projectName: projName,
        organizationUrl: orgUrl || undefined,
        personalAccessToken: patToken || undefined,
      });
      if (res.success) {
        setPreviewItems(res.items || []);
        setSelectedItemIds((res.items || []).map(i => i.id));
        setIsLiveAdo(!!res.isLiveAdo);
        if (res.message) {
          setErrorMessage(res.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to preview ADO items');
    } finally {
      setIsLoading(false);
    }
  };

  // Test connection & auto-discover projects
  const handleTestConnection = async () => {
    if (!patToken && !config?.personalAccessTokenConfigured) {
      setErrorMessage('Please insert your Personal Access Token (PAT) before running the test.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setErrorMessage(null);
    setProjectSyncNotice(null);
    try {
      const res = await api.ado.testConnection({
        organizationUrl: orgUrl,
        projectName: projectName,
        personalAccessToken: patToken || undefined,
      });
      if (res.success) {
        setTestResult(res.result);
        if (Array.isArray(res.projects) && res.projects.length > 0) {
          setRemoteProjects(res.projects);
          setIsLiveAdo(true);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to Azure DevOps API');
    } finally {
      setIsTesting(false);
    }
  };

  // Save Settings & Credentials
  const handleSaveConfig = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.ado.updateConfig({
        organizationUrl: orgUrl,
        projectName: projectName,
        personalAccessToken: patToken || undefined,
      });
      if (res.success) {
        setConfig(res.config);
        // Refresh project list with new credentials
        const projRes = await api.ado.listProjects({
          organizationUrl: orgUrl,
          personalAccessToken: patToken || undefined,
        });
        if (projRes.success && Array.isArray(projRes.projects)) {
          setRemoteProjects(projRes.projects);
          setIsLiveAdo(!!projRes.isLiveAdo);
        }
        setProjectSyncNotice('Credentials saved and verified with Azure DevOps REST API.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update config');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync Projects from Azure DevOps to Portfolio
  const handleSyncAllProjects = async () => {
    setIsSyncingProjects(true);
    setErrorMessage(null);
    setProjectSyncNotice(null);
    try {
      const res = await api.ado.syncProjects({
        organizationUrl: orgUrl,
        personalAccessToken: patToken || undefined,
      });
      if (res.success) {
        setProjectSyncNotice(res.message);
        if (Array.isArray(res.discoveredProjects)) {
          setRemoteProjects(res.discoveredProjects);
        }
        if (onProjectsSynced && res.projects) {
          onProjectsSynced(res.projects);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to synchronize projects from Azure DevOps');
    } finally {
      setIsSyncingProjects(false);
    }
  };

  // Trigger Ingestion of Work Items into WBS
  const handleTriggerSync = async () => {
    if (selectedItemIds.length === 0) {
      setErrorMessage('Please select at least one work item to synchronize.');
      return;
    }

    setIsSyncing(true);
    setErrorMessage(null);
    try {
      const res = await api.ado.sync({
        targetProjectId: selectedProjectId,
        projectName: selectedProjectName || projectName,
        mode: syncMode,
        selectedWorkItemIds: selectedItemIds,
        items: previewItems,
      });

      if (res.success) {
        setSyncSuccess(res.result);
        if (onProjectsSynced && res.projects) {
          onProjectsSynced(res.projects);
        }
        if (onSyncComplete) {
          onSyncComplete(res.result, res.project);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  // Clean all test data, imported work items, test projects & reset credentials
  const handleCleanTestData = async () => {
    if (!window.confirm('Are you sure you want to clean all test data, imported ADO work items, and test projects? Baseline enterprise accounts will be preserved.')) {
      return;
    }

    setIsCleaning(true);
    setErrorMessage(null);
    setProjectSyncNotice(null);
    setCleanSuccessNotice(null);
    try {
      const res = await api.ado.cleanTestData();
      if (res.success) {
        setConfig(res.config);
        if (res.config?.organizationUrl) {
          setOrgUrl(res.config.organizationUrl);
        }
        if (res.config?.projectName) {
          setProjectName(res.config.projectName);
        }
        setPatToken('');
        setPreviewItems([]);
        setSelectedItemIds([]);
        setRemoteProjects([]);
        setTestResult(null);
        setSyncSuccess(null);
        setIsLiveAdo(false);
        setCleanSuccessNotice(res.message);
        if (res.projects) {
          setPortfolioProjects(res.projects);
          if (onProjectsSynced) {
            onProjectsSynced(res.projects);
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to clean test data');
    } finally {
      setIsCleaning(false);
    }
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredItems.map(i => i.id);
    const allSelected = visibleIds.every(id => selectedItemIds.includes(id));
    if (allSelected) {
      setSelectedItemIds(selectedItemIds.filter(id => !visibleIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedItemIds, ...visibleIds]));
      setSelectedItemIds(merged);
    }
  };

  const toggleSelectItem = (id: number) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter(x => x !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const filteredItems = previewItems.filter(item => {
    if (selectedTypeFilter === 'all') return true;
    return item.workItemType.toLowerCase() === selectedTypeFilter.toLowerCase();
  });

  const getItemTypeBadge = (type: AdoWorkItemType) => {
    switch (type) {
      case 'Epic':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Feature':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'User Story':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'Bug':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'Task':
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  // Combine delivery projects and discovered remote ADO projects
  const allProjectOptions = [
    ...portfolioProjects.map(p => ({
      id: p.id,
      name: p.accountName,
      source: 'portfolio',
    })),
    ...remoteProjects
      .filter(rp => !portfolioProjects.some(ap => ap.accountName.toLowerCase() === rp.name.toLowerCase() || ap.id === `ado-${rp.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`))
      .map(rp => ({
        id: `ado-${rp.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: rp.name,
        source: 'ado_remote',
      }))
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <AzureDevOpsLogoSvg className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Azure DevOps (ADO) Live Ingestion &amp; Sync</h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-white/20 text-white rounded-full border border-white/20">
                  REST API v7.1
                </span>
                {isLiveAdo && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-400/30 text-emerald-100 rounded-full border border-emerald-300/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Live ADO Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Ingest Epics, Features, Stories, Tasks &amp; Bugs from remote Azure DevOps boards into arQuonCX WBS deliverables &amp; burndown curves
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 shrink-0">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'preview'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              Backlog Ingestion &amp; Live Sync
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'config'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Key className="w-4 h-4" />
              Connection, PAT Token &amp; Remote Projects ({remoteProjects.length})
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={handleSyncAllProjects}
              disabled={isSyncingProjects}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
              title="Synchronize all remote Azure DevOps projects into arQuonCX Delivery Projects"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingProjects ? 'animate-spin' : ''}`} />
              <span>Sync ADO Projects</span>
            </button>
            <button
              type="button"
              onClick={handleCleanTestData}
              disabled={isCleaning}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
              title="Purge all test work items, test projects and reset ADO integration state"
            >
              {isCleaning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              <span>Clean All Test Data</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {cleanSuccessNotice && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-sm text-amber-900 dark:text-amber-200">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Test Data Cleaned</p>
                <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{cleanSuccessNotice}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-sm text-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Azure DevOps Diagnostics</p>
                <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {projectSyncNotice && (
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3 text-sm text-blue-800 dark:text-blue-300">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Project Synchronization Status</p>
                <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{projectSyncNotice}</p>
              </div>
            </div>
          )}

          {syncSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">{syncSuccess.message}</h4>
                  <div className="flex flex-wrap gap-2.5 mt-2 text-xs">
                    <span className="bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-md font-medium">
                      Epics: <strong>{syncSuccess.epicsCount}</strong>
                    </span>
                    <span className="bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-md font-medium">
                      Features: <strong>{syncSuccess.featuresCount}</strong>
                    </span>
                    <span className="bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-md font-medium">
                      Tasks Synced: <strong>{syncSuccess.tasksCount}</strong>
                    </span>
                    <span className="bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-md font-medium">
                      Blockers / Bugs: <strong>{syncSuccess.bugsCount}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2">
                    Deployment progress, velocity curves and predicted Go-Live variance recalculated automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' ? (
            <div className="space-y-4">
              {/* Controls bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                {/* Target Project selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Target Project
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('config')}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Connect New Project
                    </button>
                  </div>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedProjectId(val);
                      const matched = allProjectOptions.find(p => p.id === val);
                      if (matched) setSelectedProjectName(matched.name);
                    }}
                    className="w-full text-xs px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <optgroup label="Enterprise Delivery Portfolio">
                      {portfolioProjects.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.accountName}
                        </option>
                      ))}
                    </optgroup>
                    {remoteProjects.length > 0 && (
                      <optgroup label="Discovered from Azure DevOps">
                        {remoteProjects.map(rp => (
                          <option key={rp.id} value={`ado-${rp.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                            [ADO] {rp.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Ingestion Mode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ingestion Mode
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="syncMode"
                        value="merge"
                        checked={syncMode === 'merge'}
                        onChange={() => setSyncMode('merge')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Merge &amp; Upsert</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer ml-3">
                      <input
                        type="radio"
                        name="syncMode"
                        value="replace"
                        checked={syncMode === 'replace'}
                        onChange={() => setSyncMode('replace')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Replace Project Tasks</span>
                    </label>
                  </div>
                </div>

                {/* Filter by Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Item Filter
                  </label>
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {['all', 'Epic', 'Feature', 'User Story', 'Task', 'Bug'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTypeFilter(t)}
                        className={`px-2 py-1 text-[11px] rounded font-medium whitespace-nowrap transition-colors ${
                          selectedTypeFilter.toLowerCase() === t.toLowerCase()
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Work Items Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filteredItems.length > 0 && filteredItems.every(i => selectedItemIds.includes(i.id))}
                      onChange={toggleSelectAll}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Select All ({selectedItemIds.length} of {previewItems.length} selected)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    {isLiveAdo && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Live ADO Work Items
                      </span>
                    )}
                    <span>Showing {filteredItems.length} items</span>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[340px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                        <th className="p-2.5 w-8"></th>
                        <th className="p-2.5 w-20">ADO ID</th>
                        <th className="p-2.5 w-24">Type</th>
                        <th className="p-2.5 min-w-[240px]">Title &amp; Hierarchy</th>
                        <th className="p-2.5 w-32">Assignee</th>
                        <th className="p-2.5 w-20">State</th>
                        <th className="p-2.5 w-24">Hours / Progress</th>
                        <th className="p-2.5 w-36">WBS Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {isLoading ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                            Querying Azure DevOps backlog items...
                          </td>
                        </tr>
                      ) : filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <div className="max-w-md mx-auto space-y-2">
                              <Database className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500 opacity-60" />
                              <div className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                                No Work Items Found
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                All test data is clean. Configure your live Azure DevOps organization URL and Personal Access Token (PAT) in the Connection tab to discover projects and stage work items.
                              </p>
                              <button
                                type="button"
                                onClick={() => setActiveTab('config')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                              >
                                Configure ADO Connection
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map(item => {
                          const isSelected = selectedItemIds.includes(item.id);
                          return (
                            <tr 
                              key={item.id}
                              className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/80 transition-colors ${
                                isSelected ? 'bg-blue-50/20 dark:bg-slate-800/40' : ''
                              }`}
                            >
                              <td className="p-2.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectItem(item.id)}
                                  className="rounded text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              <td className="p-2.5 font-mono text-slate-500 dark:text-slate-400 font-semibold">
                                #{item.id}
                              </td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getItemTypeBadge(item.workItemType)}`}>
                                  {item.workItemType}
                                </span>
                              </td>
                              <td className="p-2.5">
                                <div className="font-semibold text-slate-900 dark:text-slate-100">
                                  {item.title}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <span>{item.areaPath}</span>
                                  {item.iterationPath && (
                                    <>
                                      <span>•</span>
                                      <span className="text-blue-600 dark:text-blue-400">{item.iterationPath}</span>
                                    </>
                                  )}
                                  {item.severity && (
                                    <>
                                      <span>•</span>
                                      <span className="text-red-600 dark:text-red-400 font-semibold">{item.severity}</span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="p-2.5">
                                <div className="flex items-center gap-1.5">
                                  {item.assignedTo?.avatarUrl ? (
                                    <img 
                                      src={item.assignedTo.avatarUrl} 
                                      alt={item.assignedTo.displayName} 
                                      className="w-5 h-5 rounded-full object-cover" 
                                    />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                      {item.assignedTo?.displayName?.[0] || 'U'}
                                    </div>
                                  )}
                                  <span className="truncate max-w-[90px] text-slate-700 dark:text-slate-300">
                                    {item.assignedTo?.displayName || 'Unassigned'}
                                  </span>
                                </div>
                              </td>
                              <td className="p-2.5">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  item.state === 'Closed'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : item.state === 'Active'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}>
                                  {item.state}
                                </span>
                              </td>
                              <td className="p-2.5">
                                <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                  {item.completedWork || 0}h / {item.originalEstimate || 0}h
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                                  <div 
                                    className="bg-blue-600 h-1.5 rounded-full" 
                                    style={{ 
                                      width: `${item.originalEstimate ? Math.min(100, Math.round(((item.completedWork || 0) / item.originalEstimate) * 100)) : item.state === 'Closed' ? 100 : 0}%` 
                                    }} 
                                  />
                                </div>
                              </td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400">
                                <div className="truncate font-medium text-slate-800 dark:text-slate-200">
                                  {item.mappedWbsTask.workPackage || 'Core WBS'}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {item.mappedWbsTask.phase}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Connection Tab */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-200">
                  <p className="font-semibold text-sm">Connect Azure DevOps Organization</p>
                  <p className="mt-1">
                    Provide your Azure DevOps Organization URL and a Personal Access Token (PAT). arQuonCX queries your live projects via Azure DevOps REST API v7.1 and maps them into executive delivery trackers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Azure DevOps Organization URL *
                  </label>
                  <input
                    type="text"
                    value={orgUrl}
                    onChange={(e) => handleOrgUrlChange(e.target.value)}
                    placeholder="https://dev.azure.com/{organization}"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Example: https://dev.azure.com/my-company or https://mycompany.visualstudio.com</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Project Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. MyEnterpriseProject"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Leave blank to discover all projects automatically.</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Personal Access Token (PAT) *
                  </label>
                  {config?.personalAccessTokenConfigured && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Stored &amp; Active on Server
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  value={patToken}
                  onChange={(e) => setPatToken(e.target.value)}
                  placeholder={
                    config?.personalAccessTokenConfigured
                      ? "•••••••••••••••••••••••••••••••• (Saved on Server — leave blank to keep)"
                      : "Paste your Azure DevOps PAT token here..."
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Required Scopes: <strong>Project and Team (Read)</strong> and <strong>Work Items (Read &amp; Write)</strong>.</span>
                  {config?.personalAccessTokenConfigured ? (
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      Token is securely saved on disk
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Discovered Remote Projects */}
              {remoteProjects.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Discovered Remote Projects ({remoteProjects.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleSyncAllProjects}
                      disabled={isSyncingProjects}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncingProjects ? 'animate-spin' : ''}`} />
                      Sync All to Portfolio
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {remoteProjects.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(`ado-${p.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);
                          setSelectedProjectName(p.name);
                          setProjectName(p.name);
                          setActiveTab('preview');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5"
                      >
                        <FolderGit2 className="w-3.5 h-3.5 text-blue-500" />
                        <span>{p.name}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Real-time Webhook Hook */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Service Hook Webhook Listener Endpoint
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 font-mono">
                    POST
                  </span>
                </div>
                <code className="block p-2 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-mono select-all">
                  https://api.arquoncx.io/api/v1/integrations/ado/webhook
                </code>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Configure this endpoint in ADO Project Settings &gt; Service Hooks to enable automatic sub-second sprint updates when tasks or bugs change state in Azure Boards.
                </p>
              </div>

              {/* Test Results Output */}
              {testResult && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Connection Diagnostic Passed ({testResult.latencyMs}ms)</span>
                  </div>
                  <p>{testResult.message}</p>
                  {testResult.availableProjects && (
                    <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400">
                      Discovered {testResult.availableProjects.length} remote projects:{' '}
                      <span className="font-mono">{testResult.availableProjects.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                  Test Connection &amp; Fetch Projects
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Credentials
                </button>
                <button
                  type="button"
                  onClick={handleSyncAllProjects}
                  disabled={isSyncingProjects}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {isSyncingProjects ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                  Sync All Projects
                </button>
                <button
                  type="button"
                  onClick={handleCleanTestData}
                  disabled={isCleaning}
                  className="px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer sm:ml-auto"
                >
                  {isCleaning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Clean All Test Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {activeTab === 'preview' && (
              <span>
                {selectedItemIds.length} item{selectedItemIds.length !== 1 ? 's' : ''} staged for ingestion into{' '}
                <strong className="text-slate-700 dark:text-slate-200">
                  {selectedProjectName || selectedProjectId}
                </strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {activeTab === 'preview' && (
              <button
                onClick={handleTriggerSync}
                disabled={isSyncing || selectedItemIds.length === 0}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Ingesting from Azure DevOps...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Ingest &amp; Recalculate WBS ({selectedItemIds.length})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

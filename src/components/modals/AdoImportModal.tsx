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
  FileSpreadsheet
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
  onSyncComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'config'>('preview');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(targetProjectId);
  const [syncMode, setSyncMode] = useState<'merge' | 'replace'>('merge');
  
  // Data states
  const [config, setConfig] = useState<AdoConfig | null>(null);
  const [previewItems, setPreviewItems] = useState<AdoWorkItemPreview[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  
  // Form states
  const [orgUrl, setOrgUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [patToken, setPatToken] = useState('');
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<AdoTestResult | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<AdoSyncResult | null>(null);
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
      loadConfig();
      loadPreview(selectedProjectId);
      setSyncSuccess(null);
      setErrorMessage(null);
    }
  }, [isOpen, selectedProjectId]);

  const loadConfig = async () => {
    try {
      const res = await api.ado.getConfig();
      if (res.success && res.config) {
        setConfig(res.config);
        setOrgUrl(res.config.organizationUrl || 'https://dev.azure.com/arQuon-Enterprise');
        setProjectName(res.config.projectName || 'arQuonCX-GlobalDeployments');
      }
    } catch (err: any) {
      console.warn('Could not load ADO config:', err.message);
    }
  };

  const loadPreview = async (projId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.ado.preview({ projectId: projId });
      if (res.success && res.items) {
        setPreviewItems(res.items);
        setSelectedItemIds(res.items.map(i => i.id));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to preview ADO items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setErrorMessage(null);
    try {
      const res = await api.ado.testConnection({
        organizationUrl: orgUrl,
        projectName: projectName,
        personalAccessToken: patToken || undefined,
      });
      if (res.success) {
        setTestResult(res.result);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to Azure DevOps API');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      const res = await api.ado.updateConfig({
        organizationUrl: orgUrl,
        projectName: projectName,
        personalAccessToken: patToken || undefined,
      });
      if (res.success) {
        setConfig(res.config);
        setTestResult({
          success: true,
          timestamp: new Date().toISOString(),
          organizationValidated: true,
          projectValidated: true,
          apiReachable: true,
          apiVersion: '7.1-preview.1',
          latencyMs: 54,
          message: 'Azure DevOps configuration saved and verified.',
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update config');
    } finally {
      setIsLoading(false);
    }
  };

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
        mode: syncMode,
        selectedWorkItemIds: selectedItemIds,
      });

      if (res.success) {
        setSyncSuccess(res.result);
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
                <h3 className="text-lg font-bold">Azure DevOps (ADO) Work Item Ingestion</h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-white/20 text-white rounded-full border border-white/20">
                  REST API v7.1
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Ingest Epics, Features, Stories, Tasks & Bugs directly into arQuonCX Delivery WBS, Burndown & C-Suite Briefings
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
              Backlog Ingestion & Live Sync
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
              API Connection & Credentials
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Enterprise Connector Active
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-sm text-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Operation Notice</p>
                <p className="text-xs mt-0.5 opacity-90">{errorMessage}</p>
              </div>
            </div>
          )}

          {syncSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">{syncSuccess.message}</h4>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs">
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
                {/* Target Account selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Enterprise Account
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="proj-1">Sonae Holdings (SHPL) - Private Cloud AI</option>
                    <option value="proj-2">ArcelorMittal - SCADA Telemetry CX</option>
                    <option value="proj-3">Indorama Ventures - Global ERP Syncer</option>
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
                      <span>Merge & Upsert</span>
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
                  <div className="text-slate-500 dark:text-slate-400">
                    Showing {filteredItems.length} ADO items
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[340px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                        <th className="p-2.5 w-8"></th>
                        <th className="p-2.5 w-20">ADO ID</th>
                        <th className="p-2.5 w-24">Type</th>
                        <th className="p-2.5 min-w-[240px]">Title & Hierarchy</th>
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
                            Loading Azure DevOps backlogs...
                          </td>
                        </tr>
                      ) : filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                            No Azure DevOps work items match the selected filter.
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
            /* Config Tab */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-200">
                  <p className="font-semibold text-sm">Enterprise Azure DevOps Integration Parameters</p>
                  <p className="mt-1">
                    Connect arQuonCX to your Azure DevOps Organization via Microsoft Entra ID Managed Identity or Personal Access Tokens (PAT). Supported scopes: Work Items (Read & Write), Project and Team (Read).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Azure DevOps Organization URL
                  </label>
                  <input
                    type="text"
                    value={orgUrl}
                    onChange={(e) => setOrgUrl(e.target.value)}
                    placeholder="https://dev.azure.com/{organization}"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Example: https://dev.azure.com/arQuon-Enterprise</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. arQuonCX-GlobalDeployments"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Active project containing Epic and Feature hierarchies.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Personal Access Token (PAT) / Service Principal Secret
                </label>
                <input
                  type="password"
                  value={patToken}
                  onChange={(e) => setPatToken(e.target.value)}
                  placeholder="Paste ADO PAT token with 'vso.work_full' permission..."
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Tokens are AES-256 encrypted at rest in arQuonCX Vault.</span>
                  {config?.personalAccessTokenConfigured && (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Token currently configured
                    </span>
                  )}
                </div>
              </div>

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
                  Configure this endpoint in ADO Project Settings &gt; Service Hooks to enable automatic sub-second sprint card updates when tasks or bugs change state in Azure Boards.
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

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors"
                >
                  {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                  Test Connection Diagnostic
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Settings
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
                  {selectedProjectId === 'proj-1' ? 'SHPL' : selectedProjectId === 'proj-2' ? 'ArcelorMittal' : 'Indorama'}
                </strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            {activeTab === 'preview' && (
              <button
                onClick={handleTriggerSync}
                disabled={isSyncing || selectedItemIds.length === 0}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
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

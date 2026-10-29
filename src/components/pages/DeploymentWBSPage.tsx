import React, { useState, useMemo, useEffect } from 'react';
import { 
  Layers, 
  CheckSquare, 
  TrendingUp, 
  Users, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Kanban, 
  Table, 
  ListChecks, 
  Briefcase, 
  ChevronDown, 
  ChevronRight, 
  Flame, 
  Download, 
  Trash2,
  Target,
  ShieldCheck,
  FileCheck2,
  GitCommit,
  Check,
  GripVertical
} from 'lucide-react';
import { WbsTask, DeliveryProject, WbsTaskStatus, WbsTaskPriority } from '../../types';
import { calculateWbsProgress, calculateConfidenceScore, calculateTeamVelocity, calculatePredictedGoLive, calculateBurnChartSeries } from '../../utils/wbsMetrics';
import { CreateWbsTaskModal } from '../modals/CreateWbsTaskModal';
import { AdoImportModal, AzureDevOpsLogoSvg } from '../modals/AdoImportModal';

interface DeploymentWBSPageProps {
  projects: DeliveryProject[];
  tasks?: WbsTask[];
  wbsTasks?: WbsTask[];
  onUpdateTask: (taskId: string, updates: Partial<WbsTask>) => void;
  onCreateTask: (taskData: Partial<WbsTask>) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectProject?: (project: DeliveryProject) => void;
  onNavigateTab?: (tab: string) => void;
  onNavigateToBriefing?: () => void;
  initialProjectId?: string;
  onSyncAdoTasks?: (tasks: WbsTask[], updatedProject?: DeliveryProject) => void;
  onProjectsSynced?: (projects: DeliveryProject[]) => void;
}

export const DeploymentWBSPage: React.FC<DeploymentWBSPageProps> = ({
  projects = [],
  tasks: propTasks,
  wbsTasks,
  onUpdateTask,
  onCreateTask,
  onDeleteTask,
  onSelectProject,
  onNavigateTab,
  onNavigateToBriefing,
  initialProjectId,
  onSyncAdoTasks,
  onProjectsSynced,
}) => {
  const tasks = propTasks || wbsTasks || [];
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || 'all');
  const [viewMode, setViewMode] = useState<'wbs-tree' | 'checklist' | 'velocity' | 'kanban' | 'burndown'>('wbs-tree');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdoModalOpen, setIsAdoModalOpen] = useState(false);

  // Active project context
  const currentProject = useMemo(() => {
    if (selectedProjectId === 'all') return null;
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Filter tasks based on project, user, status, priority, search
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (selectedProjectId !== 'all' && t.projectId !== selectedProjectId) return false;
      if (userFilter !== 'all' && t.assignedUser?.name !== userFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = t.taskName.toLowerCase().includes(query);
        const matchesPkg = t.workPackage.toLowerCase().includes(query);
        const matchesPhase = t.phase.toLowerCase().includes(query);
        const matchesAssignee = (t.assignedUser?.name || '').toLowerCase().includes(query);
        const matchesBlocker = (t.blockerNote || '').toLowerCase().includes(query);
        if (!matchesName && !matchesPkg && !matchesPhase && !matchesAssignee && !matchesBlocker) return false;
      }
      return true;
    });
  }, [tasks, selectedProjectId, userFilter, statusFilter, priorityFilter, searchTerm]);

  // Dynamic Real-Time Calculations
  const calculatedProgress = useMemo(() => {
    return calculateWbsProgress(filteredTasks);
  }, [filteredTasks]);

  const calculatedConfidence = useMemo(() => {
    return calculateConfidenceScore(filteredTasks, currentProject || undefined);
  }, [filteredTasks, currentProject]);

  const calculatedVelocity = useMemo(() => {
    return calculateTeamVelocity(filteredTasks, currentProject?.hoursAllocated || 200);
  }, [filteredTasks, currentProject]);

  const calculatedPrediction = useMemo(() => {
    return calculatePredictedGoLive(
      currentProject?.baselineTargetDate || '2026-11-20',
      calculatedProgress,
      calculatedConfidence,
      calculatedVelocity
    );
  }, [currentProject, calculatedProgress, calculatedConfidence, calculatedVelocity]);

  // Kanban Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<WbsTaskStatus | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Burndown specific project selection state (defaults to initialProjectId or first project or 'all')
  const [activeBurnProjectId, setActiveBurnProjectId] = useState<string>(
    initialProjectId && initialProjectId !== 'all' ? initialProjectId : (projects[0]?.id || 'all')
  );

  // Keep activeBurnProjectId in sync when top-level project selector changes
  useEffect(() => {
    if (selectedProjectId !== 'all') {
      setActiveBurnProjectId(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Burndown active project computation
  const activeBurnProject = useMemo(() => {
    if (activeBurnProjectId === 'all') return null;
    return projects.find(p => p.id === activeBurnProjectId) || null;
  }, [projects, activeBurnProjectId]);

  const activeBurnTasks = useMemo(() => {
    if (!activeBurnProject) return tasks;
    return tasks.filter(t => t.projectId === activeBurnProject.id);
  }, [tasks, activeBurnProject]);

  const activeBurnAllocated = useMemo(() => {
    if (activeBurnProject) return activeBurnProject.hoursAllocated || 200;
    return projects.reduce((s, p) => s + (p.hoursAllocated || 200), 0) || 640;
  }, [activeBurnProject, projects]);

  const activeBurnBurned = useMemo(() => {
    if (activeBurnProject) {
      return activeBurnProject.hoursBurned !== undefined
        ? activeBurnProject.hoursBurned
        : activeBurnTasks.reduce((s, t) => s + (t.actualHours || 0), 0);
    }
    return projects.reduce((s, p) => s + (p.hoursBurned !== undefined ? p.hoursBurned : 0), 0) ||
      tasks.reduce((s, t) => s + (t.actualHours || 0), 0);
  }, [activeBurnProject, projects, activeBurnTasks, tasks]);

  const activeBurnTargetDate = useMemo(() => {
    return activeBurnProject?.baselineTargetDate || '2026-11-20';
  }, [activeBurnProject]);

  const activeBurnProgress = useMemo(() => {
    if (activeBurnProject) {
      return activeBurnProject.phaseProgress !== undefined ? activeBurnProject.phaseProgress : calculateWbsProgress(activeBurnTasks);
    }
    return calculateWbsProgress(tasks);
  }, [activeBurnProject, activeBurnTasks, tasks]);

  const activeBurnChartData = useMemo(() => {
    return calculateBurnChartSeries(
      activeBurnTasks,
      activeBurnAllocated,
      activeBurnBurned,
      activeBurnTargetDate
    );
  }, [activeBurnTasks, activeBurnAllocated, activeBurnBurned, activeBurnTargetDate]);

  const maxBurnScale = useMemo(() => {
    const values = [
      ...activeBurnChartData.flatMap(d => [d.idealBurnRemaining, d.actualBurnRemaining, d.totalScope, d.completedScope]),
      activeBurnAllocated,
      activeBurnBurned,
      60
    ];
    const rawMax = Math.max(...values);
    return Math.max(60, Math.ceil((rawMax * 1.08) / 20) * 20);
  }, [activeBurnChartData, activeBurnAllocated, activeBurnBurned]);

  // Kanban Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
    setTimeout(() => setIsDragging(false), 80);
  };

  const handleDragOver = (e: React.DragEvent, statusKey: WbsTaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== statusKey) {
      setDragOverColumn(statusKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent, statusKey: WbsTaskStatus) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumn === statusKey) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: WbsTaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);
    setTimeout(() => setIsDragging(false), 80);

    if (!taskId) return;

    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove || taskToMove.status === targetStatus) return;

    let newProgress = taskToMove.progress;
    if (targetStatus === 'completed') newProgress = 100;
    else if (targetStatus === 'not-started') newProgress = 0;
    else if (targetStatus === 'in-progress' && (taskToMove.progress === 0 || taskToMove.progress === 100)) newProgress = 25;
    else if (targetStatus === 'in-review' && taskToMove.progress < 80) newProgress = 80;

    const updates: Partial<WbsTask> = {
      status: targetStatus,
      progress: newProgress,
      actualFinish: targetStatus === 'completed' ? new Date().toISOString().split('T')[0] : taskToMove.actualFinish
    };

    onUpdateTask(taskId, updates);
  };

  const burnChartData = useMemo(() => {
    return calculateBurnChartSeries(filteredTasks, currentProject?.hoursAllocated || 200);
  }, [filteredTasks, currentProject]);

  // Unique assignees for pill filters
  const uniqueAssignees = useMemo(() => {
    const map = new Map<string, { name: string; avatar: string; role: string }>();
    tasks.forEach(t => {
      if (t.assignedUser?.name) {
        map.set(t.assignedUser.name, {
          name: t.assignedUser.name,
          avatar: t.assignedUser.avatar,
          role: t.assignedUser.role
        });
      }
    });
    return Array.from(map.values());
  }, [tasks]);

  // Group filtered tasks by Phase and Work Package for Hierarchical WBS
  const phaseGroups = useMemo(() => {
    const groups: Record<string, Record<string, WbsTask[]>> = {};
    filteredTasks.forEach(task => {
      const phaseKey = task.phase || 'General Phase';
      const pkgKey = task.workPackage || 'Core Deliverables';
      if (!groups[phaseKey]) groups[phaseKey] = {};
      if (!groups[phaseKey][pkgKey]) groups[phaseKey][pkgKey] = [];
      groups[phaseKey][pkgKey].push(task);
    });
    return groups;
  }, [filteredTasks]);

  const togglePhaseCollapse = (phase: string) => {
    setCollapsedPhases(prev => ({ ...prev, [phase]: !prev[phase] }));
  };

  const getStatusBadge = (status: WbsTaskStatus) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">✓ Done</span>;
      case 'in-progress':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">● In Progress</span>;
      case 'in-review':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">👁 In Review</span>;
      case 'blocked':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 animate-pulse">⚠️ Blocked</span>;
      case 'not-started':
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">○ Not Started</span>;
    }
  };

  const getPriorityBadge = (priority: WbsTaskPriority) => {
    switch (priority) {
      case 'critical':
        return <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800/60">CRITICAL</span>;
      case 'high':
        return <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">HIGH</span>;
      case 'medium':
        return <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/60">MED</span>;
      case 'low':
      default:
        return <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">LOW</span>;
    }
  };

  const handleExportCsv = () => {
    const headers = ['Task ID', 'Project', 'Phase', 'Work Package', 'Task Name', 'Assignee', 'Priority', 'Status', 'Estimated Hours', 'Actual Hours', 'Progress %', 'Start Date', 'Finish Date', 'Blocker'];
    const rows = filteredTasks.map(t => {
      const proj = projects.find(p => p.id === t.projectId)?.accountName || t.projectId;
      return [
        `"${t.id}"`,
        `"${proj}"`,
        `"${t.phase}"`,
        `"${t.workPackage}"`,
        `"${t.taskName.replace(/"/g, '""')}"`,
        `"${t.assignedUser?.name || 'Unassigned'}"`,
        t.priority,
        t.status,
        t.estimatedHours,
        t.actualHours,
        t.progress,
        t.plannedStart,
        t.plannedFinish,
        `"${(t.blockerNote || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `arQuonCX_WBS_Deployment_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumbs / C-Suite Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0D1527] p-4 rounded-2xl border border-slate-200 dark:border-[#1E2C4F] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Deployment Checklist & Work Breakdown Structure (WBS)
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Operational Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track granular user deliverables, estimate vs actual burned hours, calculate confidence, and monitor team velocity.
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('delivery-briefing')}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Return to Executive C-Suite Delivery Briefing"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>C-Suite Briefing</span>
            </button>
          )}

          <button
            onClick={() => setIsAdoModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Ingest Epics, Features, User Stories, Tasks & Bugs from Azure DevOps"
          >
            <AzureDevOpsLogoSvg className="w-3.5 h-3.5" />
            <span>Sync Azure DevOps</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download WBS CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add WBS Task</span>
          </button>
        </div>
      </div>

      {/* 4 Algorithmic KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Overall Progress */}
        <div className="bg-white dark:bg-[#0D1527] p-3.5 rounded-2xl border border-slate-200 dark:border-[#1E2C4F] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completion Progress</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {calculatedProgress}%
              </span>
              <span className="text-xs text-slate-500">
                ({filteredTasks.filter(t => t.status === 'completed').length}/{filteredTasks.length} tasks)
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${calculatedProgress}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span>Effort-weighted rollup</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {filteredTasks.filter(t => t.isMilestone && t.status === 'completed').length} Milestones Done
            </span>
          </div>
        </div>

        {/* KPI 2: Confidence Score */}
        <div className="bg-white dark:bg-[#0D1527] p-3.5 rounded-2xl border border-slate-200 dark:border-[#1E2C4F] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delivery Confidence</span>
            <TrendingUp className={`w-4 h-4 ${calculatedConfidence >= 85 ? 'text-emerald-500' : calculatedConfidence >= 65 ? 'text-amber-500' : 'text-rose-500'}`} />
          </div>
          <div className="my-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {calculatedConfidence}%
              </span>
              <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                calculatedConfidence >= 85 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' 
                  : calculatedConfidence >= 65 
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' 
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
              }`}>
                {calculatedConfidence >= 85 ? 'High Probability' : calculatedConfidence >= 65 ? 'Medium Risk' : 'Low Confidence'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span>Blocker / Schedule Variance</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              {filteredTasks.filter(t => t.status === 'blocked').length} Active Blockers
            </span>
          </div>
        </div>

        {/* KPI 3: Team Velocity */}
        <div className="bg-white dark:bg-[#0D1527] p-3.5 rounded-2xl border border-slate-200 dark:border-[#1E2C4F] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Team Velocity & Burn</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {calculatedVelocity.weeklyBurnHours}h
              </span>
              <span className="text-xs text-slate-500">
                / week ({calculatedVelocity.targetBurnHours}h target)
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                calculatedVelocity.velocityTrend === 'accelerating' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' 
                  : calculatedVelocity.velocityTrend === 'steady' 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' 
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
              }`}>
                {calculatedVelocity.velocityTrend}
              </span>
              <span className="text-[11px] text-slate-500">
                Sprint #{calculatedVelocity.sprintNumber} pace
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span>Sprint Throughput</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {calculatedVelocity.tasksCompletedThisSprint} of {calculatedVelocity.totalTasksInSprint} Done
            </span>
          </div>
        </div>

        {/* KPI 4: Predicted Go-Live */}
        <div className="bg-white dark:bg-[#0D1527] p-3.5 rounded-2xl border border-slate-200 dark:border-[#1E2C4F] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Target / Forecast</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-white truncate">
                {calculatedPrediction.predictedDate}
              </span>
            </div>
            <div className="mt-1">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                calculatedPrediction.varianceDays > 0 
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' 
                  : calculatedPrediction.varianceDays < 0 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' 
                    : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
              }`}>
                {calculatedPrediction.varianceDays > 0 
                  ? `+${calculatedPrediction.varianceDays}d Delay` 
                  : calculatedPrediction.varianceDays < 0 
                    ? `${Math.abs(calculatedPrediction.varianceDays)}d Ahead` 
                    : 'On Schedule'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span>Base Target Date</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {currentProject?.baselineTargetDate || 'Multiple Projects'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Project Selector, View Modes, Assignee Filter Pills */}
      <div className="bg-white dark:bg-[#0D1527] p-3 rounded-2xl border border-slate-200 dark:border-[#1E2C4F] space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Project Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Project:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#111C35] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">🌐 All Projects ({projects.length} Deployments)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.accountName} ({p.plan} • {p.deliveryHealth.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <button
              onClick={() => setViewMode('wbs-tree')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'wbs-tree' 
                  ? 'bg-white dark:bg-[#0E162E] text-indigo-600 dark:text-indigo-400 shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>WBS Hierarchy</span>
            </button>
            <button
              onClick={() => setViewMode('checklist')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'checklist' 
                  ? 'bg-white dark:bg-[#0E162E] text-indigo-600 dark:text-indigo-400 shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>Checklist</span>
            </button>
            <button
              onClick={() => setViewMode('velocity')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'velocity' 
                  ? 'bg-white dark:bg-[#0E162E] text-indigo-600 dark:text-indigo-400 shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Team Velocity</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'kanban' 
                  ? 'bg-white dark:bg-[#0E162E] text-indigo-600 dark:text-indigo-400 shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Sprint Board</span>
            </button>
            <button
              onClick={() => setViewMode('burndown')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'burndown' 
                  ? 'bg-white dark:bg-[#0E162E] text-indigo-600 dark:text-indigo-400 shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Burn Down & Burn Up</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search task, owner, blocker..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#111C35] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* User / Assignee Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Users className="w-3 h-3" /> Assignee:
          </span>
          <button
            onClick={() => setUserFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors ${
              userFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Members ({tasks.length})
          </button>
          {uniqueAssignees.map(user => {
            const count = tasks.filter(t => t.assignedUser?.name === user.name).length;
            const isSelected = userFilter === user.name;
            return (
              <button
                key={user.name}
                onClick={() => setUserFilter(user.name)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <img src={user.avatar} alt={user.name} className="w-4 h-4 rounded-full object-cover" />
                <span>{user.name}</span>
                <span className={`text-[9px] px-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: HIERARCHICAL WBS TREE TABLE                      */}
      {/* ======================================================== */}
      {viewMode === 'wbs-tree' && (
        <div className="space-y-4">
          {Object.entries(phaseGroups).length === 0 ? (
            <div className="bg-white dark:bg-[#0D1527] p-12 text-center rounded-2xl border border-slate-200 dark:border-[#1E2C4F]">
              <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No WBS items found</h3>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your project or assignee filters, or click "Add WBS Task".</p>
            </div>
          ) : (
            Object.entries(phaseGroups).map(([phaseName, workPackages]) => {
              const isCollapsed = collapsedPhases[phaseName];
              const phaseTasks = Object.values(workPackages).flat();
              const phaseProgress = calculateWbsProgress(phaseTasks);
              const phaseHours = phaseTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
              const phaseEst = phaseTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
              const blockedInPhase = phaseTasks.filter(t => t.status === 'blocked').length;

              return (
                <div key={phaseName} className="bg-white dark:bg-[#0D1527] rounded-2xl border border-slate-200 dark:border-[#1E2C4F] overflow-hidden shadow-xs">
                  {/* Phase Header Row */}
                  <div 
                    onClick={() => togglePhaseCollapse(phaseName)}
                    className="p-3.5 bg-slate-50 dark:bg-[#111C35] flex items-center justify-between cursor-pointer hover:bg-slate-100/80 dark:hover:bg-[#152342] transition-colors border-b border-slate-200 dark:border-[#1E2C4F]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                        {phaseName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        {phaseTasks.length} deliverables
                      </span>
                      {blockedInPhase > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-bold flex items-center gap-1 border border-rose-200 dark:border-rose-800">
                          <AlertTriangle className="w-3 h-3" /> {blockedInPhase} Blocked
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">{phaseHours}h / {phaseEst}h</span>
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${phaseProgress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white w-9 text-right">{phaseProgress}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase Body: Work Packages & Tasks */}
                  {!isCollapsed && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {Object.entries(workPackages).map(([pkgName, pkgTasks]) => (
                        <div key={pkgName} className="p-3 sm:p-4 space-y-2">
                          {/* Work Package Title */}
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                              <span className="font-bold text-slate-800 dark:text-slate-200">{pkgName}</span>
                              <span className="text-[10px] text-slate-400">({pkgTasks.length} tasks)</span>
                            </div>
                          </div>

                          {/* Task Rows Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/80 pb-1">
                                  <th className="py-1.5 font-bold pl-2">WBS ID</th>
                                  <th className="py-1.5 font-bold">Deliverable</th>
                                  <th className="py-1.5 font-bold">Assignee</th>
                                  <th className="py-1.5 font-bold">Priority</th>
                                  <th className="py-1.5 font-bold">Status</th>
                                  <th className="py-1.5 font-bold">Hours</th>
                                  <th className="py-1.5 font-bold">Progress</th>
                                  <th className="py-1.5 font-bold text-right pr-2">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                                {pkgTasks.map(task => {
                                  const isDone = task.status === 'completed';
                                  const isBlocked = task.status === 'blocked';
                                  return (
                                    <tr 
                                      key={task.id} 
                                      className={`group hover:bg-slate-50/80 dark:hover:bg-[#111C35]/60 transition-colors ${
                                        isBlocked ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                                      }`}
                                    >
                                      {/* ID */}
                                      <td className="py-2 pl-2 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                                        {task.id}
                                      </td>

                                      {/* Task Name */}
                                      <td className="py-2 pr-2">
                                        <div className="flex flex-col">
                                          <div className="flex items-center gap-1.5">
                                            <span className={`font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                              {task.taskName}
                                            </span>
                                            {task.isMilestone && (
                                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                MILESTONE
                                              </span>
                                            )}
                                          </div>
                                          {isBlocked && task.blockerNote && (
                                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-0.5 flex items-center gap-1">
                                              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                              {task.blockerNote}
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      {/* Assignee */}
                                      <td className="py-2 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                          <img 
                                            src={task.assignedUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                                            alt={task.assignedUser?.name || 'Assignee'} 
                                            className="w-5 h-5 rounded-full object-cover" 
                                          />
                                          <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                                            {task.assignedUser?.name || 'Unassigned'}
                                          </span>
                                        </div>
                                      </td>

                                      {/* Priority */}
                                      <td className="py-2 whitespace-nowrap">
                                        {getPriorityBadge(task.priority)}
                                      </td>

                                      {/* Status Select */}
                                      <td className="py-2 whitespace-nowrap">
                                        <select
                                          value={task.status}
                                          onChange={(e) => onUpdateTask(task.id, { 
                                            status: e.target.value as WbsTaskStatus,
                                            progress: e.target.value === 'completed' ? 100 : task.progress 
                                          })}
                                          className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111C35] text-slate-800 dark:text-slate-100 cursor-pointer"
                                        >
                                          <option value="not-started">Not Started</option>
                                          <option value="in-progress">In Progress</option>
                                          <option value="in-review">In Review</option>
                                          <option value="blocked">⚠️ Blocked</option>
                                          <option value="completed">✓ Completed</option>
                                        </select>
                                      </td>

                                      {/* Hours */}
                                      <td className="py-2 whitespace-nowrap text-[11px] text-slate-600 dark:text-slate-400">
                                        <span className="font-semibold text-slate-900 dark:text-white">{task.actualHours}h</span>
                                        <span className="text-slate-400"> / {task.estimatedHours}h</span>
                                      </td>

                                      {/* Progress Slider */}
                                      <td className="py-2 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={5}
                                            value={task.progress}
                                            onChange={(e) => onUpdateTask(task.id, { 
                                              progress: Number(e.target.value),
                                              status: Number(e.target.value) === 100 ? 'completed' : task.status === 'not-started' ? 'in-progress' : task.status
                                            })}
                                            className="w-16 accent-indigo-600"
                                          />
                                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 w-7">
                                            {task.progress}%
                                          </span>
                                        </div>
                                      </td>

                                      {/* Actions */}
                                      <td className="py-2 pr-2 text-right whitespace-nowrap">
                                        <button
                                          onClick={() => onDeleteTask(task.id)}
                                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition-all cursor-pointer"
                                          title="Delete task"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: STREAMLINED DEPLOYMENT CHECKLIST                 */}
      {/* ======================================================== */}
      {viewMode === 'checklist' && (
        <div className="bg-white dark:bg-[#0D1527] rounded-2xl border border-slate-200 dark:border-[#1E2C4F] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-indigo-500" />
                Field Engineer Execution Checklist
              </h3>
              <p className="text-xs text-slate-400">Check off tasks as deployment milestones complete in staging and production.</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {filteredTasks.filter(t => t.status === 'completed').length} of {filteredTasks.length} Completed
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTasks.map(task => {
              const isDone = task.status === 'completed';
              const isBlocked = task.status === 'blocked';
              return (
                <div key={task.id} className="py-3 flex items-start gap-3 group hover:bg-slate-50/60 dark:hover:bg-[#111C35]/40 px-2 rounded-xl transition-colors">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={(e) => onUpdateTask(task.id, {
                      status: e.target.checked ? 'completed' : 'in-progress',
                      progress: e.target.checked ? 100 : 50,
                      actualFinish: e.target.checked ? new Date().toISOString().split('T')[0] : undefined
                    })}
                    className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {task.taskName}
                      </span>
                      {getPriorityBadge(task.priority)}
                      {getStatusBadge(task.status)}
                      <span className="text-[10px] text-slate-400 font-mono">[{task.id}]</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <img src={task.assignedUser?.avatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                        {task.assignedUser?.name}
                      </span>
                      <span>Phase: {task.phase}</span>
                      <span>Package: {task.workPackage}</span>
                      <span>Hours: {task.actualHours}h burned / {task.estimatedHours}h est</span>
                      <span>Target: {task.plannedFinish}</span>
                    </div>

                    {isBlocked && task.blockerNote && (
                      <div className="mt-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] font-medium">
                        <span className="font-bold">Blocker: </span>{task.blockerNote}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: TEAM VELOCITY & WORKLOAD MATRIX                  */}
      {/* ======================================================== */}
      {viewMode === 'velocity' && (
        <div className="space-y-4">
          {/* Velocity Top Summary Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-800/80 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  Engineering & FDE Throughput Pace
                </span>
                <h3 className="text-lg font-black tracking-tight mt-0.5">
                  Team Burn Velocity: {calculatedVelocity.weeklyBurnHours} hrs/week
                </h3>
                <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
                  Active team members have burned {filteredTasks.reduce((acc, t) => acc + (t.actualHours || 0), 0)} hours across {filteredTasks.length} deployment deliverables.
                  Current pace is <span className="font-bold text-white">{calculatedVelocity.velocityTrend.toUpperCase()}</span>.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10 shrink-0">
                <div className="text-center">
                  <span className="block text-xs text-indigo-200">Sprint</span>
                  <span className="text-lg font-bold">#{calculatedVelocity.sprintNumber}</span>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <span className="block text-xs text-indigo-200">Throughput</span>
                  <span className="text-lg font-bold">{calculatedVelocity.tasksCompletedThisSprint} done</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Workload & Capacity Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {calculatedVelocity.userWorkloads.map(member => {
              const burnRatio = member.assignedHours > 0 ? Math.round((member.loggedHours / member.assignedHours) * 100) : 100;
              return (
                <div 
                  key={member.userId} 
                  className="bg-white dark:bg-[#0D1527] p-4 rounded-2xl border border-slate-200 dark:border-[#1E2C4F] shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40" 
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {member.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">{member.role}</p>
                    </div>
                    {member.openBlockers > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200">
                        {member.openBlockers} Blocker
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200">
                        On Track
                      </span>
                    )}
                  </div>

                  {/* Hours & Task Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#111C35]">
                      <span className="text-[10px] text-slate-400 block">Hours Burned</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {member.loggedHours}h <span className="text-[10px] font-normal text-slate-400">/ {member.assignedHours}h</span>
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#111C35]">
                      <span className="text-[10px] text-slate-400 block">Tasks Done</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {member.completedTasks} <span className="text-[10px] font-normal text-slate-400">/ {member.totalTasks}</span>
                      </span>
                    </div>
                  </div>

                  {/* Efficiency Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-medium">
                      <span>Capacity Utilization</span>
                      <span>{burnRatio}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${burnRatio > 120 ? 'bg-rose-500' : burnRatio > 90 ? 'bg-amber-500' : 'bg-indigo-600'}`} 
                        style={{ width: `${Math.min(100, burnRatio)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* VIEW 4: KANBAN SPRINT BOARD WITH DRAG & DROP             */}
      {/* ======================================================== */}
      {viewMode === 'kanban' && (
        <div className="space-y-3">
          {/* Board Subheader Hint */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Kanban className="w-4 h-4 text-indigo-500" />
              <span>Sprint Board: Drag &amp; drop task blocks across delivery columns to update status &amp; progress in real-time</span>
            </span>
            <span className="text-[11px] font-mono font-medium">
              Showing {filteredTasks.length} tasks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {(['not-started', 'in-progress', 'in-review', 'blocked', 'completed'] as WbsTaskStatus[]).map(statusKey => {
              const columnTasks = filteredTasks.filter(t => t.status === statusKey);
              const columnLabels: Record<WbsTaskStatus, { title: string; color: string }> = {
                'not-started': { title: 'Backlog / Queued', color: 'border-slate-300 dark:border-slate-700' },
                'in-progress': { title: 'In Progress', color: 'border-indigo-400 dark:border-indigo-600' },
                'in-review': { title: 'In Review', color: 'border-purple-400 dark:border-purple-600' },
                'blocked': { title: '⚠️ Blocked', color: 'border-rose-400 dark:border-rose-600' },
                'completed': { title: '✓ Completed', color: 'border-emerald-400 dark:border-emerald-600' }
              };

              const isDropTarget = dragOverColumn === statusKey;

              return (
                <div 
                  key={statusKey} 
                  onDragOver={(e) => handleDragOver(e, statusKey)}
                  onDragLeave={(e) => handleDragLeave(e, statusKey)}
                  onDrop={(e) => handleDrop(e, statusKey)}
                  className={`p-3 rounded-2xl border transition-all flex flex-col min-h-[520px] ${
                    isDropTarget
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-400/50 scale-[1.01]'
                      : 'bg-slate-50 dark:bg-[#0E162E] border-slate-200 dark:border-[#1E2C4F]'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {columnLabels[statusKey].title}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Column Cards Drop Area */}
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {columnTasks.length === 0 ? (
                      <div className={`h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-[11px] transition-colors ${
                        isDropTarget 
                          ? 'border-indigo-400 bg-indigo-100/30 text-indigo-700 dark:text-indigo-300 font-semibold' 
                          : 'border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-500'
                      }`}>
                        <span>Drop tasks here</span>
                      </div>
                    ) : (
                      columnTasks.map(task => {
                        const isBeingDragged = draggedTaskId === task.id;

                        return (
                          <div 
                            key={task.id} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragEnd={handleDragEnd}
                            onClick={() => {
                              if (isDragging) return;
                              const nextStatuses: Record<WbsTaskStatus, WbsTaskStatus> = {
                                'not-started': 'in-progress',
                                'in-progress': 'in-review',
                                'in-review': 'completed',
                                'blocked': 'in-progress',
                                'completed': 'not-started'
                              };
                              onUpdateTask(task.id, { status: nextStatuses[task.status] });
                            }}
                            title="Drag to change column, or click to advance status"
                            className={`bg-white dark:bg-[#131F3B] p-3 rounded-xl border shadow-2xs space-y-2 transition-all cursor-grab active:cursor-grabbing select-none hover:border-indigo-400 hover:shadow-md ${
                              isBeingDragged 
                                ? 'opacity-40 ring-2 ring-indigo-500 scale-95 border-indigo-500' 
                                : 'border-slate-200/80 dark:border-[#22355C]'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1 text-slate-400">
                                <GripVertical className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                <span className="font-mono">{task.id}</span>
                              </div>
                              {getPriorityBadge(task.priority)}
                            </div>

                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                              {task.taskName}
                            </p>

                            {task.userStory && (
                              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium line-clamp-1">
                                📖 {task.userStory}
                              </p>
                            )}

                            {task.blockerNote && statusKey === 'blocked' && (
                              <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium line-clamp-2 bg-rose-50 dark:bg-rose-950/30 p-1.5 rounded border border-rose-200 dark:border-rose-900/40">
                                ⚠️ {task.blockerNote}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 border-t border-slate-100 dark:border-slate-800/80">
                              <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                <img src={task.assignedUser?.avatar} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                                <span className="truncate max-w-[80px]">{task.assignedUser?.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400">
                                {task.storyPoints && (
                                  <span className="px-1 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-mono">
                                    {task.storyPoints}pt
                                  </span>
                                )}
                                <span>{task.actualHours}/{task.estimatedHours}h</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 5: PER-PROJECT BURN DOWN & BURN UP DELIVERY ENGINE  */}
      {/* ======================================================== */}
      {viewMode === 'burndown' && (
        <div className="space-y-5">
          {/* Executive Sprint & Scope Burn Analytics Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-[#0E162E] to-indigo-950 text-white p-5 rounded-2xl border border-indigo-900/60 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {activeBurnProject 
                      ? `${activeBurnProject.accountName} Delivery Burndown & Burnup` 
                      : 'Consolidated Agile Delivery: Multi-Project Burn Engine'}
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Telemetry Sync
                  </span>
                </div>
                <p className="text-xs text-indigo-200/80 mt-1 max-w-2xl leading-relaxed">
                  Real-time project-specific delivery burndown against budget hours, scope-creep tracking via burnup trajectory, Definition of Done (DoD) compliance, and test execution matrix.
                </p>
              </div>

              {/* Quick Metric Pills for Selected Project */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center shrink-0">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-indigo-300 block">Total Scope</span>
                  <span className="text-sm font-extrabold text-white">
                    {activeBurnChartData[activeBurnChartData.length - 1]?.totalScope || activeBurnAllocated}h
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-emerald-300 block">Scope Burned</span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    {activeBurnChartData[activeBurnChartData.length - 1]?.completedScope || 0}h
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-amber-300 block">Remaining</span>
                  <span className="text-sm font-extrabold text-amber-300">
                    {activeBurnChartData[activeBurnChartData.length - 1]?.actualBurnRemaining || 0}h
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-sky-300 block">Progress</span>
                  <span className="text-sm font-extrabold text-sky-300">
                    {activeBurnProgress}%
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Project Switcher Pill Strip */}
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-indigo-200 mr-1">
                Project View:
              </span>
              <button
                type="button"
                onClick={() => setActiveBurnProjectId('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeBurnProjectId === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400'
                    : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                }`}
              >
                <span>Consolidated (All Projects)</span>
                <span className="text-[10px] opacity-75">({projects.length})</span>
              </button>

              {projects.map((proj) => {
                const isSelected = activeBurnProjectId === proj.id;
                const statusDot = 
                  proj.deliveryHealth === 'on-track' ? 'bg-emerald-400' :
                  proj.deliveryHealth === 'at-risk' ? 'bg-amber-400' : 'bg-rose-400';

                return (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => setActiveBurnProjectId(proj.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400'
                        : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                    <span>{proj.accountName}</span>
                    <span className="text-[10px] font-mono opacity-80">
                      {proj.phaseProgress !== undefined ? `${proj.phaseProgress}%` : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Project Detail Scorecard (when an individual project is selected) */}
          {activeBurnProject && (
            <div className="bg-white dark:bg-[#0E162E] p-4 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {activeBurnProject.accountName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {activeBurnProject.accountName}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {activeBurnProject.domain}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        activeBurnProject.deliveryHealth === 'on-track' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : activeBurnProject.deliveryHealth === 'at-risk'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      }`}>
                        {activeBurnProject.deliveryHealth}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {activeBurnProject.deliveryPhase} • Plan Tier: <strong className="text-slate-700 dark:text-slate-300">{activeBurnProject.plan}</strong> • Lead: <strong className="text-indigo-600 dark:text-indigo-400">{typeof activeBurnProject.deliveryLead === 'object' ? activeBurnProject.deliveryLead?.name : activeBurnProject.deliveryLead}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Baseline Go-Live</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {activeBurnProject.baselineTargetDate}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Allocated vs Burned</span>
                    <span className={`font-bold font-mono ${
                      (activeBurnProject.hoursBurned || 0) > (activeBurnProject.hoursAllocated || 200)
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {activeBurnProject.hoursBurned || 0}h / {activeBurnProject.hoursAllocated || 200}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Blocker & Executive Action Banner if blocker exists */}
              {activeBurnProject.currentBlocker && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs space-y-1">
                  <div className="flex items-start gap-2 text-rose-800 dark:text-rose-300 font-medium">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Active Delivery Blocker: </span>
                      <span>{activeBurnProject.currentBlocker}</span>
                    </div>
                  </div>
                  {activeBurnProject.csuiteActionNeeded && (
                    <div className="pl-6 text-[11px] text-rose-700 dark:text-rose-400">
                      <strong>Executive Action Needed: </strong>
                      <span>{activeBurnProject.csuiteActionNeeded}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Charts Row: Side-by-Side Per-Project Burn Down and Burn Up Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Chart 1: Sprint Burn Down Chart */}
            <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {activeBurnProject ? `${activeBurnProject.accountName} Burndown` : 'Consolidated Burndown Chart'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Remaining effort vs. ideal linear trajectory (Max Scale: {maxBurnScale}h)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-slate-400 dark:bg-slate-500 border-dashed" />
                    <span className="text-slate-500">Ideal Burn</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    <span className="text-indigo-600 dark:text-indigo-400">Actual Remaining</span>
                  </div>
                </div>
              </div>

              {/* SVG Chart Visualization */}
              <div className="h-60 w-full relative pt-2">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="actualBurnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guide Lines with Dynamic Scales */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                    const yVal = 170 - frac * 145;
                    const hoursVal = Math.round(frac * maxBurnScale);
                    return (
                      <g key={idx}>
                        <line x1="40" y1={yVal} x2="480" y2={yVal} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
                        <text x="34" y={yVal + 3} textAnchor="end" className="text-[9px] fill-slate-400 font-mono">
                          {hoursVal}h
                        </text>
                      </g>
                    );
                  })}

                  {/* Ideal Burn Line (Dashed) */}
                  {(() => {
                    const idealStartY = 170 - (Math.min(maxBurnScale, activeBurnAllocated) / maxBurnScale) * 145;
                    return (
                      <line 
                        x1="45" 
                        y1={idealStartY} 
                        x2="475" 
                        y2="170" 
                        stroke="#94A3B8" 
                        strokeWidth="2" 
                        strokeDasharray="6 4" 
                      />
                    );
                  })()}

                  {/* Actual Burn Area & Line */}
                  {(() => {
                    const totalSteps = Math.max(1, activeBurnChartData.length - 1);
                    const pts = activeBurnChartData.map((pt, idx) => {
                      const x = 45 + (idx / totalSteps) * 430;
                      const clampedVal = Math.min(maxBurnScale, Math.max(0, pt.actualBurnRemaining));
                      const y = 170 - (clampedVal / maxBurnScale) * 145;
                      return { x, y, ...pt };
                    });

                    const pathStr = pts.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
                    const lastX = pts[pts.length - 1]?.x || 475;
                    const firstX = pts[0]?.x || 45;
                    const areaStr = `${pathStr} L ${lastX.toFixed(1)} 170 L ${firstX.toFixed(1)} 170 Z`;

                    return (
                      <>
                        <path d={areaStr} fill="url(#actualBurnGrad)" />
                        <path d={pathStr} fill="none" stroke="#6366F1" strokeWidth="2.5" />
                        {pts.map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r="3.5" fill="#6366F1" stroke="#FFFFFF" strokeWidth="1.5">
                              <title>{`${p.dayLabel}: ${p.actualBurnRemaining}h remaining`}</title>
                            </circle>
                            <text x={p.x} y="190" textAnchor="middle" className="text-[8px] fill-slate-400 font-mono">
                              {p.dayLabel}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Status Note */}
              <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    {activeBurnProgress === 100 ? (
                      <>Delivery Complete (<strong>100%</strong>) — All sprint deliverables deployed.</>
                    ) : activeBurnBurned > activeBurnAllocated ? (
                      <>Budget Overrun (<strong>+{activeBurnBurned - activeBurnAllocated}h</strong>) — Scope adjusted for technical blockers.</>
                    ) : (
                      <>Sprint Burn Pace: <strong>On Track</strong> — projected to reach 0 remaining hours by baseline cutoff.</>
                    )}
                  </span>
                </div>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                  {activeBurnBurned}/{activeBurnAllocated}h burned
                </span>
              </div>
            </div>

            {/* Chart 2: Sprint Burn Up Chart */}
            <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {activeBurnProject ? `${activeBurnProject.accountName} Burnup` : 'Consolidated Burnup Chart'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Completed work vs. Total Scope line (Scope Creep Identification)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400">Total Scope</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Completed Work</span>
                  </div>
                </div>
              </div>

              {/* SVG Burn Up Chart */}
              <div className="h-60 w-full relative pt-2">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="completedBurnUpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guide Lines */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                    const yVal = 170 - frac * 145;
                    const hoursVal = Math.round(frac * maxBurnScale);
                    return (
                      <g key={idx}>
                        <line x1="40" y1={yVal} x2="480" y2={yVal} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
                        <text x="34" y={yVal + 3} textAnchor="end" className="text-[9px] fill-slate-400 font-mono">
                          {hoursVal}h
                        </text>
                      </g>
                    );
                  })}

                  {/* Burn Up Lines */}
                  {(() => {
                    const totalSteps = Math.max(1, activeBurnChartData.length - 1);
                    const scopePts = activeBurnChartData.map((pt, idx) => {
                      const x = 45 + (idx / totalSteps) * 430;
                      const clampedScope = Math.min(maxBurnScale, Math.max(0, pt.totalScope));
                      const y = 170 - (clampedScope / maxBurnScale) * 145;
                      return { x, y, ...pt };
                    });

                    const completedPts = activeBurnChartData.map((pt, idx) => {
                      const x = 45 + (idx / totalSteps) * 430;
                      const clampedCompleted = Math.min(maxBurnScale, Math.max(0, pt.completedScope));
                      const y = 170 - (clampedCompleted / maxBurnScale) * 145;
                      return { x, y, ...pt };
                    });

                    const scopePath = scopePts.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
                    const completedPath = completedPts.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
                    const lastX = completedPts[completedPts.length - 1]?.x || 475;
                    const firstX = completedPts[0]?.x || 45;
                    const completedArea = `${completedPath} L ${lastX.toFixed(1)} 170 L ${firstX.toFixed(1)} 170 Z`;

                    return (
                      <>
                        <path d={completedArea} fill="url(#completedBurnUpGrad)" />
                        {/* Scope Line (Amber) */}
                        <path d={scopePath} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />
                        {/* Completed Work Line (Emerald) */}
                        <path d={completedPath} fill="none" stroke="#10B981" strokeWidth="2.5" />
                        
                        {completedPts.map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r="3.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5">
                              <title>{`${p.dayLabel}: ${p.completedScope}h completed / ${p.totalScope}h scope`}</title>
                            </circle>
                            <text x={p.x} y="190" textAnchor="middle" className="text-[8px] fill-slate-400 font-mono">
                              {p.dayLabel}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Status Note */}
              <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    {activeBurnProgress === 100 ? (
                      <>Scope Convergence: <strong>100% Done</strong> — all scoped user stories verified.</>
                    ) : (
                      <>Scope Stability: <strong>{activeBurnProgress >= 80 ? '95.2%' : '88.5%'}</strong> — tracking towards go-live convergence.</>
                    )}
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  {activeBurnProgress === 100 ? 'Fully Delivered' : `Target: ${activeBurnTargetDate}`}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Agile Hierarchy Rollup (Epics, Features, User Stories & Story Points) */}
          <div className="bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  {activeBurnProject ? `${activeBurnProject.accountName} Stories & Deliverables` : 'Agile Delivery Hierarchy: Epics > Features > User Stories > Tasks'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Structured breakdown linking high-level strategic epics down to executable tasks and acceptance criteria.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#111C35] text-slate-600 dark:text-slate-300 font-bold">
                {activeBurnTasks.length} Active User Stories / Deliverables
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">WBS / Story</th>
                    <th className="py-2.5 px-3">Epic &amp; Feature</th>
                    <th className="py-2.5 px-3">User Story &amp; Deliverable</th>
                    <th className="py-2.5 px-3">Points</th>
                    <th className="py-2.5 px-3">Assignee</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">DoD / QA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {activeBurnTasks.map((task) => {
                    const isDone = task.status === 'completed';
                    const isBlocked = task.status === 'blocked';
                    const points = task.storyPoints || (task.estimatedHours > 20 ? 8 : task.estimatedHours > 10 ? 5 : 3);
                    return (
                      <tr 
                        key={task.id}
                        className={`hover:bg-slate-50/60 dark:hover:bg-[#111C35]/40 transition-colors ${
                          isBlocked ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {task.id}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              {task.epicName || task.phase.split(':')[0]}
                            </span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[140px]">
                              {task.featureName || task.workPackage}
                            </p>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <p className={`font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                            {task.taskName}
                          </p>
                          {task.userStory && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-0.5 line-clamp-1">
                              "{task.userStory}"
                            </p>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {points} pts
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <img src={task.assignedUser?.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              {task.assignedUser?.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {getPriorityBadge(task.priority)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            task.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : task.status === 'blocked'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : task.status === 'in-progress'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold">
                              {task.progress}%
                            </span>
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Definition of Done (DoD) Quality Gate & Test Case Execution Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Definition of Done Quality Gate Checklist (5 Cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Definition of Done (DoD) Quality Gate
                </h4>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  100% Mandatory
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { id: 'dod-1', title: 'Peer Review & Architectural Sign-Off', desc: 'Code reviewed by minimum 1 Senior Architect / FDE', passed: true },
                  { id: 'dod-2', title: 'Unit & Regression Test Coverage >= 80%', desc: 'Automated CI/CD suite passing with zero critical vulnerabilities', passed: true },
                  { id: 'dod-3', title: 'Identity & Enterprise SSO Compliance', desc: 'Azure AD / SAML 2.0 federation and SCIM sync verified', passed: true },
                  { id: 'dod-4', title: 'UAT Client Sponsor Acceptance', desc: 'Formal verification by client business sponsor in staging', passed: activeBurnProgress > 60 },
                  { id: 'dod-5', title: 'Production Runbook & Rollback Protocol', desc: 'Disaster recovery and zero-downtime cutover plan signed off', passed: activeBurnProgress > 80 },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#111C35] border border-slate-200/80 dark:border-[#22355C] flex items-start gap-3">
                    <div className={`mt-0.5 p-1 rounded-md ${item.passed ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Test Cases & QA Validation Assignments (7 Cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0E162E] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-indigo-500" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {activeBurnProject ? `${activeBurnProject.accountName} Test Matrix` : 'Test Cases & Verification Matrix'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Automated &amp; manual test runs across Unit, Integration, UAT, and Security
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  {activeBurnProgress === 100 ? '100% Pass Rate' : '94.2% Pass Rate'}
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'TC-01', title: 'Azure AD OpenID Connect Discovery & Token Validation', type: 'Security / IAM', assignee: 'Dip Bagchi', status: 'passed', runtime: '34ms', projectIds: ['all', 'proj-shpl', 'proj-arcelor', 'proj-indorama'] },
                  { id: 'TC-02', title: 'Saswane Technical Schematics Embedding Ingestion', type: 'Integration', assignee: 'Shubham', status: 'passed', runtime: '1.2s', projectIds: ['proj-shpl'] },
                  { id: 'TC-03', title: 'QGPT Semantic Query Latency (<400ms SLA)', type: 'Performance', assignee: 'Shubham', status: 'passed', runtime: '280ms', projectIds: ['proj-shpl'] },
                  { id: 'TC-04', title: 'ArcelorMittal H&S Incident Audit Trail Verification', type: 'UAT / Compliance', assignee: 'Trevor', status: 'passed', runtime: 'Manual', projectIds: ['proj-arcelor'] },
                  { id: 'TC-05', title: 'Indorama IRC Finance Gateway Network Handshake', type: 'Infrastructure', assignee: 'Dip Bagchi', status: 'in-progress', runtime: 'Pending', projectIds: ['proj-indorama'] },
                ]
                  .filter(tc => !activeBurnProject || tc.projectIds.includes('all') || tc.projectIds.includes(activeBurnProject.id))
                  .map((tc) => (
                  <div key={tc.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#111C35] border border-slate-200/80 dark:border-[#22355C] flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-[10px] font-bold text-slate-400 shrink-0">
                        {tc.id}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {tc.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>Type: <strong className="text-slate-600 dark:text-slate-300">{tc.type}</strong></span>
                          <span>•</span>
                          <span>Tester: <strong className="text-indigo-600 dark:text-indigo-400">{tc.assignee}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400">
                        {tc.runtime}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        tc.status === 'passed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}>
                        {tc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <CreateWbsTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projects={projects}
        defaultProjectId={selectedProjectId !== 'all' ? selectedProjectId : undefined}
        onSaveTask={onCreateTask}
      />

      {/* Azure DevOps Ingestion Modal */}
      <AdoImportModal
        isOpen={isAdoModalOpen}
        onClose={() => setIsAdoModalOpen(false)}
        targetProjectId={selectedProjectId !== 'all' ? selectedProjectId : (projects[0]?.id || 'proj-1')}
        availableProjects={projects}
        onProjectsSynced={onProjectsSynced}
        onSyncComplete={(result, updatedProject) => {
          if (onSyncAdoTasks) {
            onSyncAdoTasks(result.tasks, updatedProject);
          }
        }}
      />
    </div>
  );
};

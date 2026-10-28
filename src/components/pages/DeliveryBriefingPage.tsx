import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  Users, 
  ShieldAlert, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Download, 
  Filter, 
  Search,
  ArrowRight,
  Flame,
  Award,
  FileSpreadsheet,
  UploadCloud,
  ListChecks
} from 'lucide-react';
import { DeliveryProject, DeliveryHealthStatus, DeliveryPhase } from '../../types';
import { ProjectLogo } from '../common/ProjectLogo';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

interface DeliveryBriefingPageProps {
  projects: DeliveryProject[];
  onSelectProject: (project: DeliveryProject) => void;
  onPredictProject: (id: string) => void;
  onUpdateProject: (id: string, updates: Partial<DeliveryProject>) => void;
  onToggleSidebarCollapse?: () => void;
  sidebarCollapsed?: boolean;
  onOpenImportModal?: () => void;
  onNavigateToWbs?: (projectId?: string) => void;
}

export const DeliveryBriefingPage: React.FC<DeliveryBriefingPageProps> = ({
  projects = [],
  onSelectProject,
  onPredictProject,
  onUpdateProject,
  onToggleSidebarCollapse,
  sidebarCollapsed,
  onOpenImportModal,
  onNavigateToWbs,
}) => {
  // Cadence view: 'daily' | 'weekly' | 'monthly'
  const [cadence, setCadence] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryHealthStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Aggregated Executive Metrics (defensive against NaN and empty lists)
  const totalProjects = projects.length;
  const totalARR = projects.reduce((acc, p) => acc + (Number(p.arr) || 0), 0);
  const arrAtRisk = projects
    .filter(p => p.deliveryHealth === 'at-risk' || p.deliveryHealth === 'critical')
    .reduce((acc, p) => acc + (Number(p.arr) || 0), 0);
  const onTrackCount = projects.filter(p => p.deliveryHealth === 'on-track' || p.deliveryHealth === 'completed').length;
  const onTrackPercent = Math.round((onTrackCount / (totalProjects || 1)) * 100);
  const escalationsCount = projects.filter(p => !!p.csuiteActionNeeded).length;

  // Filtered projects (defensive against missing names, domains, leads, CSMs)
  const filteredProjects = projects.filter(p => {
    const name = p.accountName || '';
    const domain = p.domain || '';
    const leadName = p.deliveryLead?.name || '';
    const csmName = p.accountCsm?.name || '';
    const term = searchTerm.toLowerCase();

    const matchesSearch = name.toLowerCase().includes(term) ||
                          domain.toLowerCase().includes(term) ||
                          leadName.toLowerCase().includes(term) ||
                          csmName.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || p.deliveryHealth === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getHealthBadge = (health: DeliveryHealthStatus) => {
    switch (health) {
      case 'on-track':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">● On Track</span>;
      case 'at-risk':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">▲ At Risk</span>;
      case 'critical':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 animate-pulse">✖ Critical Delay</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">✓ Launched</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">● Active</span>;
    }
  };

  const getVarianceBadge = (days: number) => {
    const d = days ?? 0;
    if (d > 10) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          +{d}d Delay
        </span>
      );
    }
    if (d > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          +{d}d Delay
        </span>
      );
    }
    if (d === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          On Time
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
        {Math.abs(d)}d Ahead
      </span>
    );
  };

  // Generate Executive Summary for Clipboard / C-Suite Memo
  const handleCopySummary = () => {
    const summaryText = `
# 📊 C-Suite Executive Project Delivery Status Briefing (${cadence.toUpperCase()} REVIEW)
Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Presenter: Director of Customer Success

## 🎯 Executive Scorecard:
- Total Delivery Pipeline: ${totalProjects} Projects ($${(totalARR / 1000).toFixed(0)}k Contract ARR)
- On-Time Delivery Velocity: ${onTrackPercent}% (${onTrackCount}/${totalProjects || 1} on schedule)
- Revenue at Risk of Delayed Go-Live: $${(arrAtRisk / 1000).toFixed(0)}k ARR
- Active C-Suite Decisions / Escalations Needed: ${escalationsCount}

## ⚠️ Critical C-Suite Decisions Required This Week:
${projects.filter(p => p.csuiteActionNeeded).map(p => `- [${p.accountName} - $${((Number(p.arr) || 0) / 1000).toFixed(0)}k ARR]: ${p.csuiteActionNeeded} (Blocker: ${p.currentBlocker || 'None'})`).join('\n') || '- None active'}

## 🚀 Client Delivery Breakdown:
${projects.map(p => `### ${p.accountName} (${p.plan} - $${((Number(p.arr) || 0) / 1000).toFixed(0)}k ARR)
- Phase: ${p.deliveryPhase} (${p.phaseProgress || 0}% completed)
- Status: ${(p.deliveryHealth || 'on-track').toUpperCase()}
- Target Go-Live: ${p.baselineTargetDate || 'TBD'} | AI Forecast: ${p.predictedGoLiveDate || 'TBD'} (${(p.varianceDays || 0) > 0 ? `+${p.varianceDays}d delay` : (p.varianceDays || 0) === 0 ? 'On Time' : `${Math.abs(p.varianceDays || 0)}d ahead`})
- Confidence: ${p.confidenceScore ?? 85}%
- Implementation Lead: ${p.deliveryLead?.name || 'Unassigned'} | CSM: ${p.accountCsm?.name || 'Unassigned'}
- Latest Pulse: "${p.dailyStandupNote || 'On schedule'}"
`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
    if (!isPresentationMode && onToggleSidebarCollapse && !sidebarCollapsed) {
      onToggleSidebarCollapse();
    }
  };

  return (
    <div className={`space-y-4 ${isPresentationMode ? 'p-2 sm:p-4 bg-slate-900 text-white rounded-2xl ring-4 ring-indigo-500/30' : ''}`}>
      {/* Executive Header & Meeting Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white dark:bg-[#0B1228] p-4 rounded-xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm">
              <Briefcase className="w-4 h-4" />
            </span>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              C-Suite Project Delivery & Executive Briefing
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Director of CS View
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time delivery status, AI completion forecasting, and C-Suite escalation management for weekly executive reviews.
          </p>
        </div>

        {/* Action Controls & Cadence Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Cadence Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-[#111C35] p-0.5 rounded-lg border border-slate-200 dark:border-[#22355C]">
            <button
              onClick={() => setCadence('daily')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                cadence === 'daily'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Daily Pulse (24h)
            </button>
            <button
              onClick={() => setCadence('weekly')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                cadence === 'weekly'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Weekly C-Suite Review
            </button>
            <button
              onClick={() => setCadence('monthly')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                cadence === 'monthly'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly / Q4 Trajectory
            </button>
          </div>

          {/* Deployment WBS & Checklist Button */}
          {onNavigateToWbs && (
            <button
              onClick={() => onNavigateToWbs()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-2xs cursor-pointer"
              title="Open Granular Deployment WBS & Checklist Matrix"
            >
              <ListChecks className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Deployment WBS & Checklist</span>
            </button>
          )}

          {/* Upload Excel / CSV Bridge */}
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-2xs cursor-pointer"
              title="Import or update delivery projects from Excel or CSV spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Upload Excel / CSV</span>
            </button>
          )}

          {/* Copy Summary */}
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-[#152342] transition-colors shadow-2xs cursor-pointer"
            title="Copy formatted Markdown summary to paste into Slack or Executive Email"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedSummary ? 'Copied to Clipboard!' : 'Copy C-Suite Memo'}</span>
          </button>

          {/* Presentation Mode Toggle */}
          <button
            onClick={togglePresentationMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer ${
              isPresentationMode 
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            title="Maximize for Zoom Screen Share or Meeting Room Projection"
          >
            {isPresentationMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isPresentationMode ? 'Exit Presentation' : 'Present to C-Suite'}</span>
          </button>
        </div>
      </div>

      {/* C-Suite Executive Scorecard Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white dark:bg-[#0B1228] rounded-xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pipeline ARR</span>
          <p className="text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            ${(totalARR / 1000).toFixed(0)}k
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{totalProjects} active client deliveries</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#0B1228] rounded-xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">On-Time Velocity</span>
          <p className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {onTrackPercent}%
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
            {onTrackCount} of {totalProjects || 1} projects on schedule
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#0B1228] rounded-xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delayed ARR Exposure</span>
          <p className="text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1">
            ${(arrAtRisk / 1000).toFixed(0)}k
          </p>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5 block">
            {projects.filter(p => p.deliveryHealth === 'at-risk' || p.deliveryHealth === 'critical').length} projects past variance SLA
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#0B1228] rounded-xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Cycle Time</span>
          <p className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            42 Days
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Kickoff to production go-live</span>
        </div>

        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">C-Suite Decisions</span>
          <p className="text-xl font-extrabold font-mono text-amber-700 dark:text-amber-300 mt-1">
            {escalationsCount} Escalations
          </p>
          <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold mt-0.5 block">
            Executive sponsor action needed
          </span>
        </div>
      </div>

      {/* Critical C-Suite Decisions & Escalations Hub */}
      {escalationsCount > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-50 via-rose-50/40 to-amber-50 dark:from-[#17130A] dark:via-[#1D1016] dark:to-[#17130A] rounded-xl border border-amber-300 dark:border-amber-800/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-950 dark:text-rose-200">
                Critical Decisions & Unblockers Required from C-Suite This Week ({escalationsCount})
              </h2>
            </div>
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
              Protecting ${(arrAtRisk / 1000).toFixed(0)}k ARR
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.filter(p => p.csuiteActionNeeded).map(p => (
              <div 
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="p-3 bg-white dark:bg-[#0E162E] rounded-xl border border-amber-200 dark:border-amber-800/60 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <ProjectLogo logo={p.logo} name={p.accountName} size="sm" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{p.accountName}</span>
                      <span className="text-[10px] font-mono text-slate-400">(${((Number(p.arr) || 0) / 1000).toFixed(0)}k ARR)</span>
                    </div>
                    {getHealthBadge(p.deliveryHealth)}
                  </div>

                  <p className="text-xs text-amber-900 dark:text-amber-200 font-semibold leading-relaxed">
                    👉 {p.csuiteActionNeeded}
                  </p>
                  {p.currentBlocker && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                      ⚠️ Blocker: {p.currentBlocker}
                    </p>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#1E2D52] flex items-center justify-between text-[11px] text-slate-400">
                  <span>Lead: {p.deliveryLead?.name || 'Unassigned'}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5">
                    Inspect Delivery Plan →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cadence Specific Narrative Highlight */}
      <div className="p-3.5 bg-slate-50 dark:bg-[#0E162E] rounded-xl border border-slate-200 dark:border-[#1E2D52] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
            {cadence === 'daily' && '⚡'}
            {cadence === 'weekly' && '📅'}
            {cadence === 'monthly' && '📈'}
          </div>
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {cadence === 'daily' && 'Daily Delivery Standup Pulse (Last 24 Hours)'}
              {cadence === 'weekly' && 'Weekly Executive Project Review & Milestone Trajectory'}
              {cadence === 'monthly' && 'Q4 Quarterly Go-Live Commitments & Revenue Recognition'}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {cadence === 'daily' && 'Inspect real-time daily blockers, engineering handshakes, and developer standup notes.'}
              {cadence === 'weekly' && 'Review baseline target variance (+/- days) computed by predictive machine intelligence.'}
              {cadence === 'monthly' && 'Evaluate quarterly contract ARR conversion and enterprise onboarding SLAs.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-white dark:bg-[#111C35] rounded-lg border border-slate-200 dark:border-[#22355C] p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Card Deck
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'on-track', 'at-risk', 'critical', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white border-transparent'
                  : 'bg-white dark:bg-[#111C35] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#22355C] hover:bg-slate-50'
              }`}
            >
              {st === 'all' ? 'All Deliveries' : st === 'on-track' ? 'On Track' : st === 'at-risk' ? 'At Risk' : st === 'critical' ? 'Critical' : 'Launched'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search client, lead, CSM..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#111C35] rounded-lg border border-slate-200 dark:border-[#22355C] text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Content: Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#111C35] border-b border-slate-200 dark:border-[#1E2D52] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-2.5 px-3.5">Client & Commercials</th>
                  <th className="py-2.5 px-3.5">Current Phase & Progress</th>
                  <th className="py-2.5 px-3.5">Target vs AI Forecast</th>
                  <th className="py-2.5 px-3.5">Variance</th>
                  <th className="py-2.5 px-3.5">Confidence</th>
                  <th className="py-2.5 px-3.5">Delivery Lead & CSM</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E2D52]">
                {filteredProjects.map((p) => {
                  const cleanPhase = (p.deliveryPhase || '').includes(':') 
                    ? (p.deliveryPhase || '').split(':')[1].trim() 
                    : (p.deliveryPhase || 'Phase 1');
                  const safeProgress = Math.min(100, Math.max(0, p.phaseProgress || 0));

                  return (
                    <tr 
                      key={p.id}
                      onClick={() => onSelectProject(p)}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#131F3B] transition-colors cursor-pointer group"
                    >
                      {/* Client & Tier */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <ProjectLogo logo={p.logo} name={p.accountName} size="md" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {p.accountName}
                              </span>
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {p.plan}
                              </span>
                            </div>
                            <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                              ${((Number(p.arr) || 0) / 1000).toFixed(0)}k ARR
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phase & Progress */}
                      <td className="py-3 px-3.5 min-w-[160px]">
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 dark:text-slate-200 mb-1">
                          <span className="truncate max-w-[140px]" title={p.deliveryPhase}>{cleanPhase}</span>
                          <span className="font-mono text-slate-400">{safeProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-[#152342] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.deliveryHealth === 'critical' ? 'bg-rose-500' :
                              p.deliveryHealth === 'at-risk' ? 'bg-amber-500' :
                              p.deliveryHealth === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${safeProgress}%` }}
                          />
                        </div>
                        <div className="mt-1">
                          {getHealthBadge(p.deliveryHealth)}
                        </div>
                      </td>

                      {/* Target vs Forecast */}
                      <td className="py-3 px-3.5">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                            Target: {p.baselineTargetDate || 'TBD'}
                          </span>
                          <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 shrink-0" /> Forecast: {p.predictedGoLiveDate || p.baselineTargetDate || 'TBD'}
                          </span>
                        </div>
                      </td>

                      {/* Variance */}
                      <td className="py-3 px-3.5">
                        {getVarianceBadge(p.varianceDays ?? 0)}
                      </td>

                      {/* Confidence Score */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                            {p.confidenceScore ?? 85}%
                          </span>
                          <div className="w-12 bg-slate-100 dark:bg-[#152342] rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                (p.confidenceScore ?? 85) >= 80 ? 'bg-emerald-500' :
                                (p.confidenceScore ?? 85) >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, p.confidenceScore ?? 85))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Team */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2">
                          <img 
                            src={p.deliveryLead?.avatar || DEFAULT_AVATAR} 
                            alt={p.deliveryLead?.name || 'Lead'} 
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700" 
                            title={`Lead: ${p.deliveryLead?.name || 'Unassigned'}`}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800 dark:text-slate-200 text-[11px] truncate">
                              {p.deliveryLead?.name || 'Unassigned'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              CSM: {p.accountCsm?.name || 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onNavigateToWbs && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToWbs(p.id);
                              }}
                              className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E2D52] rounded-md transition-colors cursor-pointer flex items-center gap-1"
                              title="Open WBS Breakdown for this project"
                            >
                              <ListChecks className="w-3.5 h-3.5 text-indigo-500" />
                              <span>WBS</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProject(p);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-[#131F3B] rounded-lg transition-colors cursor-pointer"
                          >
                            Inspect 360° →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card Deck View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((p) => {
            const safeProgress = Math.min(100, Math.max(0, p.phaseProgress || 0));

            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <ProjectLogo logo={p.logo} name={p.accountName} size="md" />
                      <div>
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {p.accountName}
                        </h3>
                        <span className="text-[10px] text-slate-400">${((Number(p.arr) || 0) / 1000).toFixed(0)}k ARR • {p.plan}</span>
                      </div>
                    </div>
                    {getHealthBadge(p.deliveryHealth)}
                  </div>

                  <div className="space-y-1.5 my-3">
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px]" title={p.deliveryPhase}>{p.deliveryPhase}</span>
                      <span className="font-mono">{safeProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#152342] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${safeProgress}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-[#111C35] rounded-lg border border-slate-100 dark:border-[#1E2D52] text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Date:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{p.baselineTargetDate || 'TBD'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-500" /> AI Forecast:
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{p.predictedGoLiveDate || p.baselineTargetDate || 'TBD'}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-[#1E2D52]">
                      <span className="text-slate-400">Variance:</span>
                      {getVarianceBadge(p.varianceDays ?? 0)}
                    </div>
                  </div>

                  {p.csuiteActionNeeded && (
                    <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50">
                      <span className="font-bold">👉 C-Suite Action: </span>{p.csuiteActionNeeded}
                    </div>
                  )}

                  {p.currentBlocker && (
                    <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
                      <span className="font-bold">Blocker: </span>{p.currentBlocker}
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-[#1E2D52] flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <img src={p.deliveryLead?.avatar || DEFAULT_AVATAR} alt={p.deliveryLead?.name || 'Lead'} className="w-5 h-5 rounded-full object-cover" />
                    <span>{p.deliveryLead?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onNavigateToWbs && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToWbs(p.id);
                        }}
                        className="font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                        title="Open WBS Breakdown for this project"
                      >
                        <ListChecks className="w-3 h-3 text-indigo-500" /> WBS
                      </button>
                    )}
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      Inspect →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="p-8 text-center text-slate-400 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200 dark:border-[#1E2D52]">
          <Briefcase className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-semibold">No delivery projects matching filter.</p>
        </div>
      )}
    </div>
  );
};

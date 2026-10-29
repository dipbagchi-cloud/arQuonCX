import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft,
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
  ListChecks,
  Presentation,
  MonitorPlay,
  Building2,
  ShieldCheck,
  CreditCard,
  Target,
  ArrowUpRight
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
  const [activeSlideIndex, setActiveSlideIndex] = useState(0); // 0 = Executive Overview, 1..N = Projects
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryHealthStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [meetingTimer, setMeetingTimer] = useState(0);

  // Meeting Timer during presentation mode
  useEffect(() => {
    let interval: any;
    if (isPresentationMode) {
      interval = setInterval(() => {
        setMeetingTimer(prev => prev + 1);
      }, 1000);
    } else {
      setMeetingTimer(0);
    }
    return () => clearInterval(interval);
  }, [isPresentationMode]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresentationMode) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setActiveSlideIndex(prev => Math.min(projects.length, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveSlideIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setIsPresentationMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, projects.length]);

  // Aggregated Executive Metrics
  const totalProjects = projects.length;
  const totalARR = projects.reduce((acc, p) => acc + (Number(p.arr) || 0), 0);
  const arrAtRisk = projects
    .filter(p => p.deliveryHealth === 'at-risk' || p.deliveryHealth === 'critical')
    .reduce((acc, p) => acc + (Number(p.arr) || 0), 0);
  const onTrackCount = projects.filter(p => p.deliveryHealth === 'on-track' || p.deliveryHealth === 'completed').length;
  const onTrackPercent = Math.round((onTrackCount / (totalProjects || 1)) * 100);
  const escalationsCount = projects.filter(p => !!p.csuiteActionNeeded).length;
  const totalHoursAllocated = projects.reduce((s, p) => s + (p.hoursAllocated || 200), 0);
  const totalHoursBurned = projects.reduce((s, p) => s + (p.hoursBurned || 0), 0);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const name = p.accountName || '';
      const domain = p.domain || '';
      const leadName = typeof p.deliveryLead === 'object' ? p.deliveryLead?.name : p.deliveryLead || '';
      const csmName = typeof p.accountCsm === 'object' ? p.accountCsm?.name : p.accountCsm || '';
      const term = searchTerm.toLowerCase();

      const matchesSearch = name.toLowerCase().includes(term) ||
                            domain.toLowerCase().includes(term) ||
                            leadName.toLowerCase().includes(term) ||
                            csmName.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'all' || p.deliveryHealth === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const getHealthBadge = (health: DeliveryHealthStatus) => {
    switch (health) {
      case 'on-track':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>On Track</span>
          </span>
        );
      case 'at-risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>At Risk</span>
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 shadow-2xs animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Critical Delay</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Launched</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Active</span>
          </span>
        );
    }
  };

  const getVarianceBadge = (days: number) => {
    const d = days ?? 0;
    if (d > 10) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          +{d}d Delay
        </span>
      );
    }
    if (d > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          +{d}d Delay
        </span>
      );
    }
    if (d === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          On Time
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
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
- Implementation Lead: ${typeof p.deliveryLead === 'object' ? p.deliveryLead?.name : p.deliveryLead || 'Unassigned'} | CSM: ${typeof p.accountCsm === 'object' ? p.accountCsm?.name : p.accountCsm || 'Unassigned'}
- Latest Pulse: "${p.dailyStandupNote || 'On schedule'}"
`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  const togglePresentationMode = () => {
    const nextMode = !isPresentationMode;
    setIsPresentationMode(nextMode);
    setActiveSlideIndex(0);

    if (nextMode) {
      if (onToggleSidebarCollapse && !sidebarCollapsed) {
        onToggleSidebarCollapse();
      }
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const activeProjectSlide = activeSlideIndex > 0 ? projects[activeSlideIndex - 1] : null;

  return (
    <div className={`transition-all duration-300 ${isPresentationMode ? 'fixed inset-0 z-50 bg-[#070B19] text-white overflow-y-auto p-4 sm:p-6 lg:p-8' : 'space-y-4'}`}>
      
      {/* ========================================================================= */}
      {/* PRESENTATION MODE: LUXURY BOARDROOM STAGE DECK                            */}
      {/* ========================================================================= */}
      {isPresentationMode && (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top Presenter Nav Bar */}
          <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-indigo-500/30 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-extrabold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Live C-Suite Briefing
              </span>
              <span className="text-xs text-indigo-200 font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Elapsed: {formatTimer(meetingTimer)}</span>
              </span>
            </div>

            {/* Slide Navigation Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <button
                onClick={() => setActiveSlideIndex(0)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeSlideIndex === 0 
                    ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400' 
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                <span>🌐 Portfolio Rollup</span>
              </button>

              {projects.map((proj, idx) => {
                const isSelected = activeSlideIndex === idx + 1;
                const statusDot = 
                  proj.deliveryHealth === 'on-track' ? 'bg-emerald-400' :
                  proj.deliveryHealth === 'at-risk' ? 'bg-amber-400' : 'bg-rose-400';

                return (
                  <button
                    key={proj.id}
                    onClick={() => setActiveSlideIndex(idx + 1)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400' 
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                    <span>{proj.accountName}</span>
                    <span className="text-[10px] font-mono opacity-80">
                      {proj.phaseProgress}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stage Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                disabled={activeSlideIndex === 0}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 cursor-pointer transition-colors"
                title="Previous Slide (or Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-indigo-200">
                {activeSlideIndex + 1} / {projects.length + 1}
              </span>
              <button
                onClick={() => setActiveSlideIndex(prev => Math.min(projects.length, prev + 1))}
                disabled={activeSlideIndex === projects.length}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 cursor-pointer transition-colors"
                title="Next Slide (or Right Arrow)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={togglePresentationMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-md cursor-pointer ml-2"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Presentation</span>
              </button>
            </div>
          </div>

          {/* SLIDE A: PORTFOLIO EXECUTIVE OVERVIEW */}
          {activeSlideIndex === 0 && (
            <div className="space-y-6">
              {/* Grand Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-[#0E162E] to-indigo-950 p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
                      Strategic Customer Success &amp; Delivery Horizon
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                      C-Suite Enterprise Delivery Command Briefing
                    </h2>
                    <p className="text-sm text-indigo-200/80 mt-2 max-w-2xl leading-relaxed">
                      Executive review of multi-million enterprise customer accounts, Phase A knowledge deployment sign-offs, critical path dependencies, and revenue recognition milestones.
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 block font-mono">Presenting Lead:</span>
                    <span className="text-base font-bold text-white">Director of Customer Success</span>
                    <span className="text-xs text-indigo-300 block font-mono mt-0.5">Q4 Execution Cadence</span>
                  </div>
                </div>
              </div>

              {/* 4 Luxury KPI Stat Tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#0B1228]/80 border border-indigo-500/30 backdrop-blur-md shadow-lg">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Pipeline ARR</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold font-mono text-white">
                      ${(totalARR / 1000).toLocaleString()}k
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      +18.4%
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-2 block">
                    {totalProjects} Active Enterprise Accounts
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0B1228]/80 border border-emerald-500/30 backdrop-blur-md shadow-lg">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">On-Time Velocity</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold font-mono text-emerald-400">
                      {onTrackPercent}%
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      Target: &gt;90%
                    </span>
                  </div>
                  <span className="text-xs text-emerald-300/80 mt-2 block">
                    {onTrackCount} of {totalProjects} Projects On Schedule
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0B1228]/80 border border-amber-500/30 backdrop-blur-md shadow-lg">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Engineering Hours Burn</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold font-mono text-amber-300">
                      {totalHoursBurned}h / {totalHoursAllocated}h
                    </span>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                      152% Burn
                    </span>
                  </div>
                  <span className="text-xs text-amber-300/80 mt-2 block">
                    Overrun in Indorama (IRC Technical Spike)
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0B1228]/80 border border-rose-500/30 backdrop-blur-md shadow-lg">
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wider block">Delayed ARR Exposure</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold font-mono text-rose-400">
                      ${(arrAtRisk / 1000).toLocaleString()}k
                    </span>
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full">
                      1 Escalation
                    </span>
                  </div>
                  <span className="text-xs text-rose-300/80 mt-2 block">
                    Requires C-Suite Priority Direction
                  </span>
                </div>
              </div>

              {/* Commercial Payment Milestones Schedule */}
              <div className="bg-[#0B1228]/90 p-6 rounded-3xl border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-base font-bold text-white">Commercial Payment Tranches &amp; Invoicing Schedule</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Contractual billing gates tied to technical phase delivery verification.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    $460k Active Invoicing
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">SHPL (Saswane Habitats)</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Ready To Bill</span>
                    </div>
                    <div className="text-2xl font-extrabold font-mono text-emerald-400">$450,000</div>
                    <p className="text-xs text-slate-300 font-medium">Phase A: Knowledge Layer 100% Sign-Off Received from Sarv</p>
                    <div className="text-[11px] text-indigo-300 pt-2 border-t border-white/10">Next Gate: Phase B Autonomous Agents ($1.05M ARR)</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">Arcelor Mittal H&amp;S</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Invoiced</span>
                    </div>
                    <div className="text-2xl font-extrabold font-mono text-indigo-400">$10,000</div>
                    <p className="text-xs text-slate-300 font-medium">Phase 1: Health &amp; Safety Audit Live POC Cutover (95%)</p>
                    <div className="text-[11px] text-indigo-300 pt-2 border-t border-white/10">Next Gate: European Multi-Plant Rollout ($180k ARR)</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-rose-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">Indorama Corp</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">Payment Blocked</span>
                    </div>
                    <div className="text-2xl font-extrabold font-mono text-rose-400">$250,000</div>
                    <p className="text-xs text-slate-300 font-medium">Phase 1: Finance Ops Annual License Conversion</p>
                    <div className="text-[11px] text-rose-300 pt-2 border-t border-white/10">Blocker: IRC Instance Outage (Needs C-Suite Priority)</div>
                  </div>
                </div>
              </div>

              {/* Critical Escalation Hub */}
              <div className="bg-rose-950/40 p-5 rounded-3xl border border-rose-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Critical C-Suite Decisions Required Today
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    1 Escalation Active
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Indorama Corp — IRC Finance Gateway Infrastructure</span>
                    <span className="text-rose-400 font-bold">$250k ARR At Stake</span>
                  </div>
                  <p className="text-slate-300">
                    <strong>Issue: </strong> The IRC instance is not rendering due to which arQuon testing team is unable to test it. Amartya is checking the infra for IRC.
                  </p>
                  <p className="text-amber-300">
                    <strong>Required C-Suite Decision: </strong> Direction needed for the product engineering team to ascertain priority of this initiative to unblock testing and lock in Q4 ARR conversion.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE B: INDIVIDUAL CLIENT SPOTLIGHT */}
          {activeSlideIndex > 0 && activeProjectSlide && (
            <div className="space-y-6">
              {/* Client Spotlight Hero Card */}
              <div className="bg-gradient-to-r from-slate-900 via-[#0B1228] to-indigo-950 p-6 sm:p-8 rounded-3xl border border-indigo-500/40 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center font-extrabold text-indigo-300 text-xl shadow-inner">
                      {activeProjectSlide.accountName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-extrabold text-white">
                          {activeProjectSlide.accountName}
                        </h2>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/15">
                          {activeProjectSlide.domain}
                        </span>
                        <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {activeProjectSlide.plan}
                        </span>
                        {getHealthBadge(activeProjectSlide.deliveryHealth)}
                      </div>
                      <p className="text-sm text-indigo-200/80 mt-1">
                        Active Phase: <strong className="text-white">{activeProjectSlide.deliveryPhase}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-mono">Contract Value</span>
                      <span className="text-2xl font-extrabold font-mono text-emerald-400">
                        ${((Number(activeProjectSlide.arr) || 0) / 1000).toLocaleString()}k ARR
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-Column Split Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 5 Cols: Progress, AI Forecasting & Engineering Hours */}
                <div className="lg:col-span-5 bg-[#0B1228]/80 p-6 rounded-3xl border border-indigo-500/30 backdrop-blur-md space-y-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Delivery Velocity &amp; Completion Target
                  </h3>

                  {/* Giant Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-4xl font-extrabold font-mono text-white">
                        {activeProjectSlide.phaseProgress}%
                      </span>
                      <span className="text-xs text-indigo-300 font-semibold">
                        Phase Completion
                      </span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          activeProjectSlide.phaseProgress === 100 ? 'bg-emerald-500' :
                          activeProjectSlide.deliveryHealth === 'at-risk' ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${activeProjectSlide.phaseProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestone Dates & AI Forecast */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Baseline Target Date:</span>
                      <span className="font-mono font-bold text-white">{activeProjectSlide.baselineTargetDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>AI Forecast Go-Live:</span>
                      </span>
                      <span className="font-mono font-bold text-indigo-300">{activeProjectSlide.predictedGoLiveDate || activeProjectSlide.baselineTargetDate}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-slate-400">Schedule Variance:</span>
                      {getVarianceBadge(activeProjectSlide.varianceDays ?? 0)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Delivery Confidence:</span>
                      <span className="font-mono font-bold text-emerald-400">{activeProjectSlide.confidenceScore ?? 85}%</span>
                    </div>
                  </div>

                  {/* Hours Burned vs Allocated */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">FDE Hours (Burned / Budget):</span>
                      <span className={`font-mono font-bold ${
                        (activeProjectSlide.hoursBurned || 0) > (activeProjectSlide.hoursAllocated || 200) ? 'text-amber-400' : 'text-white'
                      }`}>
                        {activeProjectSlide.hoursBurned || 0}h / {activeProjectSlide.hoursAllocated || 200}h
                      </span>
                    </div>
                    {(activeProjectSlide.hoursBurned || 0) > (activeProjectSlide.hoursAllocated || 200) && (
                      <p className="text-[11px] text-amber-300 font-medium">
                        ⚠️ +{(activeProjectSlide.hoursBurned || 0) - (activeProjectSlide.hoursAllocated || 200)}h budget overrun due to infrastructure spike.
                      </p>
                    )}
                  </div>

                  {/* Team Alignment */}
                  <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Forward Deployed Lead</span>
                      <div className="flex items-center gap-2 mt-1">
                        <img src={activeProjectSlide.deliveryLead?.avatar || DEFAULT_AVATAR} alt="" className="w-6 h-6 rounded-full object-cover ring-1 ring-indigo-400" />
                        <span className="font-bold text-white truncate">{typeof activeProjectSlide.deliveryLead === 'object' ? activeProjectSlide.deliveryLead?.name : activeProjectSlide.deliveryLead}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Client Sponsor</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-300 font-bold flex items-center justify-center text-xs">
                          {activeProjectSlide.clientSponsor?.name?.slice(0, 1) || 'S'}
                        </span>
                        <span className="font-bold text-white truncate">{activeProjectSlide.clientSponsor?.name || 'Sarv'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 7 Cols: Milestones, Highlights & Escalation */}
                <div className="lg:col-span-7 bg-[#0B1228]/80 p-6 rounded-3xl border border-indigo-500/30 backdrop-blur-md space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Blocker Callout if any */}
                    {activeProjectSlide.csuiteActionNeeded ? (
                      <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-rose-300 font-bold uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Critical C-Suite Decision Needed</span>
                        </div>
                        <p className="text-white text-sm font-semibold">
                          👉 {activeProjectSlide.csuiteActionNeeded}
                        </p>
                        {activeProjectSlide.currentBlocker && (
                          <p className="text-slate-300 text-xs">
                            <strong>Technical Blocker: </strong>{activeProjectSlide.currentBlocker}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs flex items-center gap-2 text-emerald-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Zero Delivery Blockers — Implementation proceeding on-track according to baseline SLA.</span>
                      </div>
                    )}

                    {/* Milestones Checklist */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                        Technical Milestone Gates
                      </h4>
                      <div className="space-y-2 text-xs">
                        {(activeProjectSlide.milestones || [
                          { id: 'm1', name: 'Knowledge Intake & Data Schema', status: 'completed' },
                          { id: 'm2', name: 'Semantic Ingestion & Vector Embeddings', status: 'completed' },
                          { id: 'm3', name: 'Azure AD / Entra ID Integration', status: 'completed' },
                          { id: 'm4', name: 'Client Acceptance UAT', status: activeProjectSlide.phaseProgress === 100 ? 'completed' : 'in-progress' },
                          { id: 'm5', name: 'Production Cutover & Signoff', status: activeProjectSlide.phaseProgress === 100 ? 'completed' : 'pending' }
                        ]).map((m, idx) => {
                          const isDone = m.status === 'completed';
                          const isInProg = m.status === 'in-progress';

                          return (
                            <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                                  isDone ? 'bg-emerald-500/20 text-emerald-400' :
                                  isInProg ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' :
                                  'bg-white/10 text-slate-500'
                                }`}>
                                  {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                                </div>
                                <span className={`font-medium ${isDone ? 'text-slate-300' : isInProg ? 'text-white font-bold' : 'text-slate-400'}`}>
                                  {m.name}
                                </span>
                              </div>
                              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                                isDone ? 'bg-emerald-500/10 text-emerald-300' :
                                isInProg ? 'bg-indigo-500/20 text-indigo-300' :
                                'bg-white/5 text-slate-500'
                              }`}>
                                {m.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Weekly Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          Completed This Week
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {(activeProjectSlide.weeklyHighlights?.completedThisWeek || [
                            'Corpus indexing validation verified',
                            'Client UAT test passes executed'
                          ]).map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px]">
                              <span className="text-emerald-400">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                          Planned Next Week
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {(activeProjectSlide.weeklyHighlights?.plannedNextWeek || [
                            'Complete sign-off documentation',
                            'Schedule production deployment cutover'
                          ]).map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px]">
                              <span className="text-indigo-400">&rarr;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400 italic">
                      Latest Standup Pulse: "{activeProjectSlide.dailyStandupNote || 'On schedule'}"
                    </span>
                    <button
                      onClick={() => onSelectProject(activeProjectSlide)}
                      className="text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Open Full Project 360°</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STANDARD VIEW: MODERN EXECUTIVE BRIEFING DASHBOARD                        */}
      {/* ========================================================================= */}
      {!isPresentationMode && (
        <>
          {/* Executive Header & Meeting Controls */}
          <div className="bg-gradient-to-r from-slate-900 via-[#0B1228] to-indigo-950 p-4 sm:p-5 rounded-2xl border border-indigo-900/50 shadow-md text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                    C-Suite Project Delivery &amp; Executive Briefing
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Director of CS View
                  </span>
                </div>
                <p className="text-xs text-indigo-200/80 mt-1 max-w-2xl leading-relaxed">
                  Real-time delivery status, AI completion forecasting, and C-Suite escalation management for weekly executive reviews.
                </p>
              </div>

              {/* Action Controls & Cadence Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Cadence Pills */}
                <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setCadence('daily')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      cadence === 'daily'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-indigo-200 hover:text-white'
                    }`}
                  >
                    Daily Pulse
                  </button>
                  <button
                    onClick={() => setCadence('weekly')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      cadence === 'weekly'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-indigo-200 hover:text-white'
                    }`}
                  >
                    Weekly Review
                  </button>
                  <button
                    onClick={() => setCadence('monthly')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      cadence === 'monthly'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-indigo-200 hover:text-white'
                    }`}
                  >
                    Q4 Trajectory
                  </button>
                </div>

                {/* Upload Excel / CSV Bridge */}
                {onOpenImportModal && (
                  <button
                    onClick={onOpenImportModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
                    title="Import or update delivery projects from Excel or CSV spreadsheet"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Upload Excel</span>
                  </button>
                )}

                {/* Deployment WBS & Checklist Button */}
                {onNavigateToWbs && (
                  <button
                    onClick={() => onNavigateToWbs()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
                    title="Open Granular Deployment WBS & Checklist Matrix"
                  >
                    <ListChecks className="w-3.5 h-3.5 text-indigo-400" />
                    <span>WBS &amp; Checklist</span>
                  </button>
                )}

                {/* Copy Summary */}
                <button
                  onClick={handleCopySummary}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
                  title="Copy formatted Markdown summary to paste into Slack or Executive Email"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedSummary ? 'Copied!' : 'Copy Memo'}</span>
                </button>

                {/* PRESENT TO C-SUITE BUTTON (High Impact Glow) */}
                <button
                  onClick={togglePresentationMode}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 cursor-pointer ring-2 ring-indigo-400/40"
                  title="Launch Interactive Boardroom Presentation Deck"
                >
                  <Presentation className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Present to C-Suite</span>
                </button>
              </div>
            </div>
          </div>

          {/* C-Suite Executive Scorecard Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-3.5 bg-white dark:bg-[#0B1228] rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pipeline ARR</span>
              <p className="text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                ${(totalARR / 1000).toFixed(0)}k
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">{totalProjects} active deliveries</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#0B1228] rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">On-Time Velocity</span>
              <p className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {onTrackPercent}%
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                {onTrackCount} of {totalProjects || 1} on schedule
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#0B1228] rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delayed ARR Exposure</span>
              <p className="text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1">
                ${(arrAtRisk / 1000).toFixed(0)}k
              </p>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5 block">
                {projects.filter(p => p.deliveryHealth === 'at-risk' || p.deliveryHealth === 'critical').length} projects past SLA
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#0B1228] rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Engineering Hours</span>
              <p className="text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {totalHoursBurned}h / {totalHoursAllocated}h
              </p>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5 block">
                152% Burn Velocity
              </span>
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-2xs col-span-2 lg:col-span-1">
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
            <div className="p-4 bg-gradient-to-r from-amber-50 via-rose-50/40 to-amber-50 dark:from-[#17130A] dark:via-[#1D1016] dark:to-[#17130A] rounded-2xl border border-amber-300 dark:border-amber-800/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-rose-950 dark:text-rose-200">
                    Critical Decisions &amp; Unblockers Required from C-Suite This Week ({escalationsCount})
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                  Protecting ${(arrAtRisk / 1000).toFixed(0)}k ARR
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects.filter(p => p.csuiteActionNeeded).map(p => (
                  <div 
                    key={p.id}
                    onClick={() => onSelectProject(p)}
                    className="p-3.5 bg-white dark:bg-[#0E162E] rounded-xl border border-amber-200 dark:border-amber-800/60 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex flex-col justify-between"
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
                      <span>Lead: {typeof p.deliveryLead === 'object' ? p.deliveryLead?.name : p.deliveryLead}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5">
                        Inspect Delivery Plan &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter, View Switcher & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'on-track', 'at-risk', 'critical', 'completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-900 dark:bg-indigo-600 text-white border-transparent shadow-xs'
                      : 'bg-white dark:bg-[#111C35] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#22355C] hover:bg-slate-50'
                  }`}
                >
                  {st === 'all' ? 'All Deliveries' : st === 'on-track' ? 'On Track' : st === 'at-risk' ? 'At Risk' : st === 'critical' ? 'Critical' : 'Launched'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white dark:bg-[#111C35] rounded-xl border border-slate-200 dark:border-[#22355C] p-0.5">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    viewMode === 'cards' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Card Deck
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search client, lead, CSM..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#111C35] rounded-xl border border-slate-200 dark:border-[#22355C] text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Main Content: Table View */}
          {viewMode === 'table' && (
            <div className="bg-white dark:bg-[#0E162E] rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-[#111C35] border-b border-slate-200 dark:border-[#1E2D52] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <th className="py-3 px-4">Client &amp; Commercials</th>
                      <th className="py-3 px-4">Current Phase &amp; Progress</th>
                      <th className="py-3 px-4">Target vs AI Forecast</th>
                      <th className="py-3 px-4">Variance</th>
                      <th className="py-3 px-4">Confidence</th>
                      <th className="py-3 px-4">FDE Lead &amp; Sponsor</th>
                      <th className="py-3 px-4 text-right">Action</th>
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
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
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
                          <td className="py-3 px-4 min-w-[170px]">
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
                          <td className="py-3 px-4">
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
                          <td className="py-3 px-4">
                            {getVarianceBadge(p.varianceDays ?? 0)}
                          </td>

                          {/* Confidence Score */}
                          <td className="py-3 px-4">
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
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img 
                                src={p.deliveryLead?.avatar || DEFAULT_AVATAR} 
                                alt={typeof p.deliveryLead === 'object' ? p.deliveryLead?.name : 'Lead'} 
                                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700" 
                                title={`Lead: ${typeof p.deliveryLead === 'object' ? p.deliveryLead?.name : p.deliveryLead}`}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-800 dark:text-slate-200 text-[11px] truncate">
                                  {typeof p.deliveryLead === 'object' ? p.deliveryLead?.name : p.deliveryLead}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Sponsor: {p.clientSponsor?.name || 'Sarv'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {onNavigateToWbs && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigateToWbs(p.id);
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E2D52] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
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
                                Inspect 360&deg; &rarr;
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
                    className="p-4 bg-white dark:bg-[#0E162E] rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <ProjectLogo logo={p.logo} name={p.accountName} size="md" />
                          <div>
                            <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {p.accountName}
                            </h3>
                            <span className="text-[10px] text-slate-400">${((Number(p.arr) || 0) / 1000).toFixed(0)}k ARR &bull; {p.plan}</span>
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

                      <div className="p-3 bg-slate-50 dark:bg-[#111C35] rounded-xl border border-slate-100 dark:border-[#1E2D52] text-[11px] space-y-1.5">
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
                        <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-xl border border-amber-200 dark:border-amber-900/50">
                          <span className="font-bold">&bull; C-Suite Action: </span>{p.csuiteActionNeeded}
                        </div>
                      )}

                      {p.currentBlocker && (
                        <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-xl border border-rose-200 dark:border-rose-900/50">
                          <span className="font-bold">Blocker: </span>{p.currentBlocker}
                        </div>
                      )}
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-[#1E2D52] flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <img src={p.deliveryLead?.avatar || DEFAULT_AVATAR} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <span>{typeof p.deliveryLead === 'object' ? p.deliveryLead?.name : p.deliveryLead}</span>
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
                          Inspect &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredProjects.length === 0 && (
            <div className="p-8 text-center text-slate-400 bg-white dark:bg-[#0E162E] rounded-2xl border border-slate-200 dark:border-[#1E2D52]">
              <Briefcase className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-semibold">No delivery projects matching filter.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

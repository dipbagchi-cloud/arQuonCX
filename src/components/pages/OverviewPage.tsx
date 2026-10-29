import React, { useState, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  HeartHandshake, 
  MessageSquareHeart, 
  DollarSign, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  ExternalLink,
  Briefcase,
  Calendar,
  Building2,
  Target,
  Flame,
  CreditCard,
  ChevronRight,
  CheckSquare,
  Layers,
  AlertCircle,
  FileText,
  Check,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { MetricCard } from '../common/MetricCard';
import { HealthBadge, PlanBadge } from '../common/Badge';
import { Account, NavigationTab, DeliveryProject, WbsTask } from '../../types';
import { MOCK_DELIVERY_PROJECTS } from '../../data/mockData';

interface OverviewPageProps {
  accounts: Account[];
  deliveryProjects?: DeliveryProject[];
  tasks?: WbsTask[];
  onSelectAccount: (account: Account) => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenFlowSimulator: () => void;
  onSelectDeliveryProject?: (project: DeliveryProject) => void;
}

const USER_TREND_DATA = [
  { name: 'May', dau: 2200, mau: 18500, adoption: 64 },
  { name: 'Jun', dau: 2600, mau: 22400, adoption: 69 },
  { name: 'Jul', dau: 3100, mau: 27100, adoption: 71 },
  { name: 'Aug', dau: 3800, mau: 32000, adoption: 74 },
  { name: 'Sep', dau: 4400, mau: 36200, adoption: 76 },
  { name: 'Oct', dau: 4820, mau: 38420, adoption: 78.4 },
];

const HEALTH_DISTRIBUTION = [
  { name: 'Healthy (75-100)', count: 28, fill: '#10b981' },
  { name: 'Moderate (50-74)', count: 9, fill: '#f59e0b' },
  { name: 'At Risk (< 50)', count: 4, fill: '#f43f5e' },
];

const RECENT_ACTIVITY_STREAM = [
  { id: 1, user: 'Marcus Chen', account: 'Acme Cloud Dynamics', event: 'Completed "New AI Features" Tour', time: '8m ago', type: 'flow' },
  { id: 2, user: 'Dr. Aris Vance', account: 'NovaScale BioTech', event: 'Submitted NPS rating: 10/10 ("Promoter")', time: '34m ago', type: 'nps' },
  { id: 3, user: 'Hans Gruber', account: 'Vortex Logistics', event: 'Dropped off step 2 of Funnel', time: '1h ago', type: 'alert' },
  { id: 4, user: 'Maya Lin', account: 'Luminary Media Tech', event: 'Maxed out seat license limit (25/25)', time: '2h ago', type: 'expansion' },
  { id: 5, user: "Keith O'Connor", account: 'SentryPay Global', event: 'Exported Executive CSV Summary', time: '3h ago', type: 'feature' }
];

export const OverviewPage: React.FC<OverviewPageProps> = ({
  accounts = [],
  deliveryProjects: propProjects,
  tasks = [],
  onSelectAccount,
  onNavigateTab,
  onOpenFlowSimulator,
  onSelectDeliveryProject,
}) => {
  const projects = propProjects && propProjects.length > 0 ? propProjects : MOCK_DELIVERY_PROJECTS;
  const atRiskAccounts = accounts.filter(a => a.healthTier === 'at-risk');

  // Executive Metric Calculations
  const totalDeliveryArr = useMemo(() => {
    return projects.reduce((s, p) => s + (p.arr || 0), 0);
  }, [projects]);

  const totalSaasArr = useMemo(() => {
    return accounts.reduce((s, a) => s + (a.arr || 0), 0);
  }, [accounts]);

  const totalPortfolioArr = totalDeliveryArr + (totalSaasArr || 1420000);

  const avgDeliveryProgress = useMemo(() => {
    if (projects.length === 0) return 0;
    const sum = projects.reduce((s, p) => s + (p.phaseProgress !== undefined ? p.phaseProgress : 0), 0);
    return Math.round(sum / projects.length);
  }, [projects]);

  const totalHoursAllocated = useMemo(() => {
    return projects.reduce((s, p) => s + (p.hoursAllocated || 200), 0);
  }, [projects]);

  const totalHoursBurned = useMemo(() => {
    return projects.reduce((s, p) => s + (p.hoursBurned !== undefined ? p.hoursBurned : 0), 0);
  }, [projects]);

  // Critical Blockers
  const blockedProjects = useMemo(() => {
    return projects.filter(p => p.currentBlocker || p.csuiteActionNeeded);
  }, [projects]);

  // Payment Milestones & Commercial Tranche Schedule
  const paymentMilestones = useMemo(() => {
    return [
      {
        id: 'pm-shpl-1',
        projectId: 'proj-shpl',
        client: 'SHPL (Saswane Habitats)',
        domain: 'qgpt.saswanehabitats.com',
        planTier: 'Enterprise',
        contractArr: 1500000,
        trancheName: 'Phase A: Knowledge Layer Sign-off (100% Deployed)',
        trancheAmount: 450000,
        tranchePercentage: 30,
        status: 'ready-to-invoice' as const,
        dueDate: '2026-11-20',
        sponsor: 'Sarv (Executive Sponsor)',
        lead: 'Shubham (Forward Deployed Engineer)',
        nextExpansion: 'Phase B: Autonomous Maintenance Agents ($1,050,000 ARR)',
        note: 'Knowledge layer validation signed off by Sarv. Invoice approved for submission.'
      },
      {
        id: 'pm-arcelor-1',
        projectId: 'proj-arcelor',
        client: 'Arcelor Mittal H&S',
        domain: 'hsqgptpoc.arcelormittal.com',
        planTier: 'Enterprise',
        contractArr: 10000,
        trancheName: 'Phase 1: Health & Safety Audit Cutover POC (95%)',
        trancheAmount: 10000,
        tranchePercentage: 100,
        status: 'invoiced' as const,
        dueDate: '2026-12-05',
        sponsor: 'Gustavo (VP Safety Compliance)',
        lead: 'Trevor (Forward Deployed Engineer)',
        nextExpansion: 'Multi-Plant European Rollout Option ($180,000 ARR)',
        note: 'POC fees invoiced. Awaiting final audit trail validation on Dec 5.'
      },
      {
        id: 'pm-indorama-1',
        projectId: 'proj-indorama',
        client: 'Indorama Corp',
        domain: 'qgpt.indorama.com',
        planTier: 'Scale',
        contractArr: 0,
        trancheName: 'Phase 1: Finance Ops Annual License Conversion',
        trancheAmount: 250000,
        tranchePercentage: 100,
        status: 'blocked' as const,
        dueDate: '2026-11-12',
        sponsor: 'Rohit (Finance Controller)',
        lead: 'Dip Bagchi (Director CS / FDE)',
        nextExpansion: 'APAC Finance Automation Expansion ($400,000 ARR)',
        note: 'Payment blocked by IRC instance rendering failure. Amartya checking infra.'
      }
    ];
  }, []);

  return (
    <div className="space-y-4">
      {/* 1. Executive Pulse Command Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B1228] to-indigo-950 text-white p-4 sm:p-5 rounded-2xl border border-indigo-900/50 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Executive Portfolio Overview &amp; Delivery Command
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Q4 Live Portfolio
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-1 max-w-3xl leading-relaxed">
              Consolidated executive intelligence tracking commercial contract ARR, delivery milestones, payment tranches, and operational engineering burn across Forward Deployed Engineering (FDE) accounts.
            </p>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => onNavigateTab('delivery-briefing')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>C-Suite Briefing</span>
            </button>
            <button
              onClick={() => onNavigateTab('deployment-wbs')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-all cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>WBS &amp; Burndown</span>
            </button>
            <button
              onClick={() => onNavigateTab('accounts')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Accounts 360</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top 5 Executive KPI Metric Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard
          title="Total Portfolio ARR"
          value={`$${(totalPortfolioArr / 1000000).toFixed(2)}M`}
          change={+18.4}
          changeText="vs Q3 baseline"
          icon={<DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          subtitle={`$${(totalDeliveryArr / 1000000).toFixed(2)}M Delivery + $${(totalSaasArr / 1000000).toFixed(2)}M SaaS`}
          onClick={() => onNavigateTab('accounts')}
        />

        <MetricCard
          title="Payment Tranches Due"
          value="$450,000"
          change={+30.0}
          changeText="Phase A Milestone"
          icon={<CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          subtitle="Next Horizon: $1.05M Phase B Contract"
          variant="highlight"
        />

        <MetricCard
          title="Enterprise Delivery Pace"
          value={`${avgDeliveryProgress}%`}
          change={+8.2}
          changeText="3 Live Deployments"
          icon={<Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          subtitle="SHPL 100% • Arcelor 95% • Indorama 80%"
          onClick={() => onNavigateTab('deployment-wbs')}
        />

        <MetricCard
          title="Engineering Hours Burn"
          value={`${totalHoursBurned}h / ${totalHoursAllocated}h`}
          change={-335}
          changeText="152% Budget Ratio"
          icon={<Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          subtitle="Overrun in Indorama (IRC Technical Spike)"
          variant="warning"
          onClick={() => onNavigateTab('deployment-wbs')}
        />

        <MetricCard
          title="Commercial ARR At-Risk"
          value="$250,000"
          change={-1}
          changeText="1 Active Escalation"
          icon={<AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
          subtitle="Indorama IRC infra needs product direction"
          variant="danger"
          onClick={() => onNavigateTab('delivery-briefing')}
        />
      </div>

      {/* 3. C-Suite Blocker & Escalation Alert Box (High Visibility) */}
      {blockedProjects.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/40 via-[#1E1128] to-slate-900 border border-rose-500/40 rounded-2xl p-4 text-slate-200 shadow-sm space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                    C-Suite Critical Action Required
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    Escalation #IND-01
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  Indorama Corp ($250,000 ARR Conversion Blocked by IRC Rendering Outage)
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigateTab('delivery-briefing')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-xs cursor-pointer"
              >
                Open Briefing &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-black/20 p-3 rounded-xl border border-white/5">
            <div>
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">Technical Blocker:</span>
              <p className="text-slate-300 text-xs mt-0.5">
                The IRC instance is not rendering due to which arQuon testing team is unable to test it. Amartya is checking the infra for IRC.
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Required C-Suite Direction:</span>
              <p className="text-slate-300 text-xs mt-0.5">
                Needed Direction for the product team to ascertain the priority of the initiative to unblock testing and lock in $250k ARR conversion.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Payment Milestones & Commercial Horizon Table / Cards */}
      <div className="bg-white dark:bg-[#0E162E] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Contract Payment Milestones &amp; Revenue Invoicing Horizon
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Contractual payment tranches linked directly to technical delivery verification and client executive sign-off.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
              $460,000 Active Tranches
            </span>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
              $1.23M Expansion Horizon
            </span>
          </div>
        </div>

        {/* Milestone Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {paymentMilestones.map((pm) => {
            const isReady = pm.status === 'ready-to-invoice';
            const isInvoiced = pm.status === 'invoiced';
            const isBlocked = pm.status === 'blocked';

            return (
              <div 
                key={pm.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  isReady 
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                    : isBlocked
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                    : 'bg-slate-50/60 dark:bg-[#111C35] border-slate-200 dark:border-[#1E2D52]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[160px]">
                      {pm.client}
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      isReady 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300'
                        : isBlocked
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 border-indigo-300'
                    }`}>
                      {isReady ? '✓ Ready To Invoice' : isBlocked ? '⚠️ Blocked' : 'Invoiced'}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                      ${pm.trancheAmount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {pm.tranchePercentage}% of Contract
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 leading-snug">
                    {pm.trancheName}
                  </p>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                    {pm.note}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800 text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Target Date: <strong className="text-slate-700 dark:text-slate-300">{pm.dueDate}</strong></span>
                    <span>Sponsor: <strong className="text-slate-700 dark:text-slate-300">{pm.sponsor.split(' ')[0]}</strong></span>
                  </div>
                  <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
                    Horizon: {pm.nextExpansion}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Enterprise Delivery Plan & Milestone Roadmap */}
      <div className="bg-white dark:bg-[#0E162E] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1E2D52] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1E2D52]">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Enterprise Delivery Plans &amp; Go-Live Horizons
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Live execution tracking across Forward Deployed Engineering (FDE) pods, milestone velocity, and cutover targets.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('deployment-wbs')}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <span>Open Sprint WBS Board &rarr;</span>
          </button>
        </div>

        {/* Project Delivery Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {projects.map((proj) => {
            const isCompleted = proj.phaseProgress === 100;
            const isAtRisk = proj.deliveryHealth === 'at-risk' || proj.deliveryHealth === 'critical';
            const overrun = (proj.hoursBurned || 0) - (proj.hoursAllocated || 200);

            return (
              <div 
                key={proj.id}
                className="bg-slate-50/70 dark:bg-[#111C35] p-4 rounded-xl border border-slate-200/80 dark:border-[#22355C] shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xs shrink-0">
                        {proj.accountName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {proj.accountName}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{proj.domain}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                      proj.deliveryHealth === 'on-track' 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}>
                      {proj.deliveryHealth}
                    </span>
                  </div>

                  {/* Phase & Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                        {proj.deliveryPhase}
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {proj.phaseProgress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : isAtRisk ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${proj.phaseProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Target Dates & Hours */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block">Go-Live Target</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {proj.baselineTargetDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Hours (Burn/Budget)</span>
                      <span className={`font-semibold font-mono ${overrun > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {proj.hoursBurned || 0}h / {proj.hoursAllocated || 200}h {overrun > 0 && `(+${overrun}h)`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer details & Action */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px]">
                  <div className="truncate text-slate-500 dark:text-slate-400">
                    Lead: <strong className="text-indigo-600 dark:text-indigo-400">{typeof proj.deliveryLead === 'object' ? proj.deliveryLead?.name : proj.deliveryLead}</strong>
                  </div>
                  <button
                    onClick={() => onNavigateTab('delivery-briefing')}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer shrink-0"
                  >
                    Briefing &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Charts Section: User Adoption Trends & Health Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Activity & Product Adoption Curve */}
        <div className="lg:col-span-2 p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                User Adoption &amp; Active User Trends
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">DAU growth vs Product Adoption % across active deployments</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Active Sessions (DAU)
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Adoption %
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={USER_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A1024', border: '1px solid #1E2D52', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="dau" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorDau)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Account Health Distribution */}
        <div className="p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Portfolio Health Distribution
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">41 Total Accounts</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Composite telemetry breakdown across usage, support, and executive champions.
            </p>

            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HEALTH_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A1024', border: '1px solid #1E2D52', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-[#1E2D52] flex items-center justify-between text-xs">
            <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 text-[11px]">
              <AlertTriangle className="w-3 h-3" /> 4 Critical Accounts Flagged
            </span>
            <button 
              onClick={() => onNavigateTab('accounts')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline text-[11px] cursor-pointer"
            >
              Triage Risks &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 7. Bottom Section: Accounts Requiring Immediate Action & Real-time Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* At-Risk Accounts Requiring Immediate Outreach */}
        <div className="lg:col-span-2 p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Accounts Requiring Immediate Attention
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Low health score, drop in login velocity, or pending renewal</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/40">
              {atRiskAccounts.length} High Risk
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1E2D52]">
            {atRiskAccounts.map((account) => (
              <div 
                key={account.id}
                onClick={() => onSelectAccount(account)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-[#131F3B] px-2 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#152342] border border-slate-200 dark:border-[#22355C] flex items-center justify-center text-base shrink-0">
                    {account.logo}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {account.name}
                      </span>
                      <PlanBadge plan={account.plan} />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>CSM: {account.csmName}</span>
                      <span>•</span>
                      <span className="text-rose-600 dark:text-rose-400 font-medium">Inactive {account.lastActiveDaysAgo}d</span>
                      <span>•</span>
                      <span>Renewal in {account.daysToRenewal}d</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <HealthBadge score={account.healthScore} tier={account.healthTier} size="sm" />
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">${(account.arr / 1000).toFixed(0)}k ARR</span>
                    <span className="text-[10px] text-slate-400 block">{account.seatsUsed}/{account.seatsTotal} seats</span>
                  </div>
                  <button className="p-1 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1E2D52] flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Recommended: Trigger automatic re-engagement flow or schedule QBR.</span>
            <button 
              onClick={() => onNavigateTab('flows')}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Configure Flow &rarr;
            </button>
          </div>
        </div>

        {/* Real-time Telemetry & In-App Activity Feed */}
        <div className="p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Event Stream
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">WebSocket Live</span>
            </div>

            <div className="space-y-2 mt-3">
              {RECENT_ACTIVITY_STREAM.map((act) => (
                <div key={act.id} className="p-2 rounded-lg border border-slate-100 dark:border-[#1B294A] bg-slate-50/60 dark:bg-[#111C35] text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-0.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{act.account}</span>
                    <span>{act.time}</span>
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200 text-xs leading-snug">{act.event}</p>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 block">
                    By {act.user}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-[#1E2D52] mt-3 text-center">
            <button 
              onClick={() => onNavigateTab('analytics')}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Explore Full Product Telemetry &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

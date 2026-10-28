import React from 'react';
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
  ExternalLink
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
import { Account, NavigationTab } from '../../types';

interface OverviewPageProps {
  accounts: Account[];
  onSelectAccount: (account: Account) => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenFlowSimulator: () => void;
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
  { id: 5, user: 'Keith O\'Connor', account: 'SentryPay Global', event: 'Exported Executive CSV Summary', time: '3h ago', type: 'feature' }
];

export const OverviewPage: React.FC<OverviewPageProps> = ({
  accounts,
  onSelectAccount,
  onNavigateTab,
  onOpenFlowSimulator,
}) => {
  const atRiskAccounts = accounts.filter(a => a.healthTier === 'at-risk');

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Customer Success & Product Adoption Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time telemetry, adoption health scores, and predictive churn indicators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('accounts')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg hover:bg-slate-50 dark:hover:bg-[#152342] transition-colors shadow-2xs cursor-pointer"
          >
            View All Accounts →
          </button>
          <button
            onClick={onOpenFlowSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch In-App Tour</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard
          title="Product Adoption Score"
          value="78.4%"
          change={+4.2}
          changeText="vs last 30d"
          icon={<TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          subtitle="Top: 92% (Acme Cloud)"
        />

        <MetricCard
          title="Monthly Active Users"
          value="38,420"
          change={+12.8}
          changeText="MAU (+4.8k DAU)"
          icon={<Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          subtitle="Stickiness: 34.2%"
        />

        <MetricCard
          title="Average Health Index"
          value="84 / 100"
          change={-1.5}
          changeText="14 flagged at risk"
          icon={<HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          subtitle="Enterprise avg: 89/100"
          variant="highlight"
        />

        <MetricCard
          title="NPS Sentiment"
          value="+48 NPS"
          change={+6.0}
          changeText="62% Promoters"
          icon={<MessageSquareHeart className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
          subtitle="842 verified ratings"
        />

        <MetricCard
          title="Total Managed ARR"
          value="$1.42M"
          change={+8.4}
          changeText="$124k in pipeline"
          icon={<DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          subtitle="Net Retention: 118%"
        />
      </div>

      {/* Charts Section: Adoption & Health Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Activity & Product Adoption Curve */}
        <div className="lg:col-span-2 p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                User Adoption & Active User Trends
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">DAU growth vs Product Adoption % (Last 6 Months)</p>
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
                Health Tier Distribution
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">41 Total</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Breakdown based on composite telemetry.
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
              <AlertTriangle className="w-3 h-3" /> 4 Critical Accounts
            </span>
            <button 
              onClick={() => onNavigateTab('accounts')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline text-[11px] cursor-pointer"
            >
              Triage Risks →
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Section: At-Risk Churn Alerts & Real-time Live Event Ticker */}
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
                  Accounts Requiring Immediate Action
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
              Configure Flow →
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
              Explore Full Product Telemetry →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

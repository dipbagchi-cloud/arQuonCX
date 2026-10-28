import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Play, 
  Pause, 
  Eye, 
  Target, 
  TrendingUp, 
  Layers, 
  Search, 
  SlidersHorizontal,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { Flow, FlowStatus, FlowType } from '../../types';
import { FlowStatusBadge } from '../common/Badge';
import { PermissionGate } from '../common/PermissionGate';

interface FlowsPageProps {
  flows: Flow[];
  onOpenFlowSimulator: () => void;
  onToggleFlowStatus: (flowId: string) => void;
}

export const FlowsPage: React.FC<FlowsPageProps> = ({
  flows,
  onOpenFlowSimulator,
  onToggleFlowStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FlowStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | FlowType>('all');

  const filteredFlows = flows.filter(flow => {
    const matchesSearch = flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          flow.targetAudience.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || flow.status === statusFilter;
    const matchesType = typeFilter === 'all' || flow.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalImpressions = flows.reduce((acc, f) => acc + f.impressions, 0);
  const liveCount = flows.filter(f => f.status === 'live').length;
  const avgCompletion = Math.round(flows.reduce((acc, f) => acc + f.completionRate, 0) / flows.length);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Adoption Experiences & In-App Flows
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deliver contextual modals, tooltips, checklists, and announcements to accelerate user onboarding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PermissionGate permission="flow:write" showDisabledTooltip>
            <button
              onClick={onOpenFlowSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create In-App Flow</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Live In-App Flows</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">{liveCount} active</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">100% targeting uptime</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Impressions</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">{totalImpressions.toLocaleString()}</p>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">+18.4% this month</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Completion Rate</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">{avgCompletion}%</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Top quartile benchmark</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Goal Conversion</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">61.2%</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Core action activation rate</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-2.5 sm:p-3 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-72 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search flows, triggers, audiences..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#111C35] rounded-lg border border-slate-200 dark:border-[#22355C] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#131F3B] focus:border-indigo-500 outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-[#111C35] p-0.5 rounded-lg text-xs font-semibold">
            {(['all', 'live', 'paused', 'draft'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md capitalize transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-white dark:bg-[#182647] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-700 dark:text-slate-200 outline-hidden capitalize cursor-pointer"
          >
            <option value="all">All Formats</option>
            <option value="modal">Modals</option>
            <option value="slideout">Slideouts</option>
            <option value="tooltip">Tooltips</option>
            <option value="checklist">Checklists</option>
            <option value="banner">Banners</option>
          </select>
        </div>
      </div>

      {/* Flows Cards Directory */}
      <div className="space-y-2.5">
        {filteredFlows.map((flow) => (
          <div 
            key={flow.id} 
            className="p-3.5 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            {/* Flow Info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold shrink-0">
                {flow.type === 'modal' && '🪟'}
                {flow.type === 'slideout' && '📑'}
                {flow.type === 'tooltip' && '🎯'}
                {flow.type === 'checklist' && '📋'}
                {flow.type === 'banner' && '📢'}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer truncate">
                    {flow.name}
                  </h3>
                  <FlowStatusBadge status={flow.status} />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {flow.type}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                    <Target className="w-3 h-3 text-slate-400" />
                    Target: {flow.targetAudience}
                  </span>
                  <span>•</span>
                  <span>Trigger: {flow.triggerEvent}</span>
                  <span>•</span>
                  <span>Updated {flow.lastEdited}</span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="flex items-center gap-4 border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100 dark:border-[#1E2D52] shrink-0">
              <div className="text-center min-w-[60px]">
                <span className="text-[9px] text-slate-400 uppercase font-semibold">Views</span>
                <p className="text-xs font-bold font-mono text-slate-900 dark:text-white mt-0.5">{flow.impressions.toLocaleString()}</p>
              </div>

              <div className="text-center min-w-[70px]">
                <span className="text-[9px] text-slate-400 uppercase font-semibold">Completion</span>
                <p className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{flow.completionRate}%</p>
                <div className="w-14 bg-slate-100 dark:bg-[#152342] rounded-full h-1 mt-1 mx-auto overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${flow.completionRate}%` }} />
                </div>
              </div>

              <div className="text-center min-w-[70px]">
                <span className="text-[9px] text-slate-400 uppercase font-semibold">Goal Conv</span>
                <p className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">{flow.goalConversion}%</p>
                <span className="text-[9px] text-slate-400 block truncate max-w-[70px]">{flow.goalName}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pl-1">
                <PermissionGate permission="flow:publish" showDisabledTooltip>
                  <button
                    onClick={() => onToggleFlowStatus(flow.id)}
                    className={`p-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      flow.status === 'live' 
                        ? 'border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40' 
                        : 'border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    }`}
                    title={flow.status === 'live' ? 'Pause experience' : 'Publish experience live'}
                  >
                    {flow.status === 'live' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </PermissionGate>

                <button
                  onClick={onOpenFlowSimulator}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
                  title="Open in interactive simulator"
                >
                  <Eye className="w-3 h-3 text-indigo-300" />
                  <span>Simulator</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  BarChart3, 
  Filter, 
  ArrowRight, 
  TrendingUp, 
  Calendar, 
  MousePointerClick, 
  Users, 
  Plus, 
  Layers, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { FeatureTag, FunnelStep, CohortRow } from '../../types';
import { PermissionGate } from '../common/PermissionGate';

interface AnalyticsPageProps {
  featureTags: FeatureTag[];
  funnelSteps: FunnelStep[];
  cohorts: CohortRow[];
  onOpenTagModal?: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  featureTags,
  funnelSteps,
  cohorts,
  onOpenTagModal,
}) => {
  const [activeTab, setActiveTab] = useState<'funnels' | 'cohorts' | 'tags'>('funnels');
  const [funnelFilter, setFunnelFilter] = useState('All Signups (Q3)');

  const getHeatmapColor = (pct: number) => {
    if (pct === 0) return 'bg-slate-50 text-slate-300';
    if (pct >= 85) return 'bg-emerald-600 text-white font-bold';
    if (pct >= 70) return 'bg-emerald-500 text-white font-bold';
    if (pct >= 60) return 'bg-emerald-400 text-slate-900 font-semibold';
    if (pct >= 50) return 'bg-emerald-200 text-slate-800 font-medium';
    if (pct >= 40) return 'bg-emerald-100 text-slate-700';
    return 'bg-amber-100 text-amber-800';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Product Analytics, Funnels & Retention
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identify onboarding friction bottlenecks, track feature tag clicks, and inspect cohort retention heatmaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PermissionGate permission="analytics:tag" showDisabledTooltip>
            <button
              onClick={() => alert('Feature Tagging element picker activated. Click any UI element on your site to tag.')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>Tag New Feature</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#1E2D52]">
        <button
          onClick={() => setActiveTab('funnels')}
          className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'funnels' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Conversion Funnels (Onboarding → Activation)</span>
        </button>
        <button
          onClick={() => setActiveTab('cohorts')}
          className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'cohorts' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Retention Cohorts</span>
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'tags' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          <span>Feature Tag Tracker ({featureTags.length})</span>
        </button>
      </div>

      {/* Tab 1: Conversion Funnels */}
      {activeTab === 'funnels' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  End-to-End Onboarding & Activation Funnel
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tracks conversion from first user account creation to active recurring usage at 30 days.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="text-[11px]">Overall Conversion:</span>
                <span className="text-indigo-600 dark:text-indigo-300 font-bold font-mono bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900 text-xs">
                  29.2% (3,620 users)
                </span>
              </div>
            </div>

            {/* Funnel Steps Visualizer */}
            <div className="space-y-3">
              {funnelSteps.map((step, idx) => {
                const isFirst = idx === 0;
                const widthPercent = Math.max(15, (step.visitors / funnelSteps[0].visitors) * 100);

                return (
                  <div key={step.stepNumber} className="relative">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold">
                          {step.stepNumber}
                        </span>
                        <span className="text-slate-900 dark:text-white text-xs">{step.name}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold font-mono text-slate-900 dark:text-white text-xs">{step.visitors.toLocaleString()} users</span>
                        {!isFirst && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded text-[10px] border border-emerald-200 dark:border-emerald-800/60 font-mono">
                            {step.conversionRate}% step
                          </span>
                        )}
                        {!isFirst && (
                          <span className="text-rose-500 text-[10px] font-mono">
                            -{step.dropOffCount.toLocaleString()} dropped
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Funnel Bar */}
                    <div className="w-full bg-slate-100 dark:bg-[#152342] rounded-lg h-6 p-0.5 flex items-center">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-md transition-all duration-500 flex items-center px-2 text-[10px] font-bold font-mono text-white shadow-xs justify-between"
                        style={{ width: `${widthPercent}%` }}
                      >
                        <span>{step.overallRate}% overall</span>
                        <span>{step.visitors.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E2D52] flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Friction: Step 2 to Step 3 (3,300 users dropped before tagging first feature).
              </span>
              <button 
                onClick={() => alert('Deploying targeted in-app tooltip on Step 2')}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] cursor-pointer"
              >
                Deploy Guidance on Step 2 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Retention Cohorts Heatmap */}
      {activeTab === 'cohorts' && (
        <div className="p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Weekly User Retention Matrix
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Percentage of active users returning week after week after signup.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 font-mono">
              Avg Week-4: 65%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#111C35] text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] border-b border-slate-200 dark:border-[#1E2D52]">
                  <th className="py-2 px-2.5 text-left">Cohort Period</th>
                  <th className="py-2 px-2.5">Users</th>
                  <th className="py-2 px-1.5">W0</th>
                  <th className="py-2 px-1.5">W1</th>
                  <th className="py-2 px-1.5">W2</th>
                  <th className="py-2 px-1.5">W3</th>
                  <th className="py-2 px-1.5">W4</th>
                  <th className="py-2 px-1.5">W5</th>
                  <th className="py-2 px-1.5">W6</th>
                  <th className="py-2 px-1.5">W7</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E2D52]">
                {cohorts.map((cohort, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#131F3B]">
                    <td className="py-2 px-2.5 text-left font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap text-xs">
                      {cohort.cohortName}
                    </td>
                    <td className="py-2 px-2.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs">
                      {cohort.userCount.toLocaleString()}
                    </td>
                    {cohort.weeks.map((val, wIdx) => (
                      <td key={wIdx} className="p-0.5">
                        <div className={`py-1 px-1.5 rounded text-[10px] font-mono transition-all ${getHeatmapColor(val)}`}>
                          {val > 0 ? `${val}%` : '—'}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Feature Tagging Tracker */}
      {activeTab === 'tags' && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#111C35] border-b border-slate-200/80 dark:border-[#1E2D52] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3.5">Feature & Selector</th>
                    <th className="py-2.5 px-3.5">Section</th>
                    <th className="py-2.5 px-3.5">Monthly Clicks</th>
                    <th className="py-2.5 px-3.5">Unique Users</th>
                    <th className="py-2.5 px-3.5">Adoption %</th>
                    <th className="py-2.5 px-3.5">Velocity</th>
                    <th className="py-2.5 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E2D52] text-slate-700 dark:text-slate-200">
                  {featureTags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-slate-50/70 dark:hover:bg-[#131F3B] transition-colors">
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2">
                          <MousePointerClick className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs">{tag.name}</p>
                            <p className="text-[10px] font-mono text-slate-400">{tag.selector}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <span className="font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                          {tag.section}
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 font-bold font-mono text-slate-900 dark:text-white">
                        {tag.monthlyClicks.toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3.5 font-medium text-slate-800 dark:text-slate-200">
                        {tag.uniqueUsers.toLocaleString()} <span className="text-[10px] text-slate-400">users</span>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 bg-slate-100 dark:bg-[#152342] rounded-full h-1 overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${tag.adoptionPercentage}%` }} />
                          </div>
                          <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400 text-xs">{tag.adoptionPercentage}%</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <span className="inline-flex items-center gap-0.5 font-bold font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                          +{tag.trend}%
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          onClick={() => alert(`Creating adoption flow to drive clicks on ${tag.name}`)}
                          className="px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-[#131F3B] rounded-md transition-colors cursor-pointer"
                        >
                          Promote →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

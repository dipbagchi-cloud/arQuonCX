import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Send, 
  ExternalLink,
  Briefcase,
  Flame,
  ArrowRight,
  Layers
} from 'lucide-react';
import { DeliveryProject, DeliveryMilestoneItem } from '../../types';
import { ProjectLogo } from '../common/ProjectLogo';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

interface DeliveryDetailDrawerProps {
  project: DeliveryProject | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (id: string, updates: Partial<DeliveryProject>) => void;
  onPredict: (id: string) => void;
}

export const DeliveryDetailDrawer: React.FC<DeliveryDetailDrawerProps> = ({
  project,
  isOpen,
  onClose,
  onUpdateProject,
  onPredict,
}) => {
  if (!isOpen || !project) return null;

  const [newStandupNote, setNewStandupNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'on-track':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">● On Track</span>;
      case 'at-risk':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">▲ At Risk</span>;
      case 'critical':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 animate-pulse">✖ Critical Delay</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">✓ Launched</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">● Active</span>;
    }
  };

  const milestones = project.milestones || [];

  const handleToggleMilestone = (mId: string) => {
    const updatedMilestones = milestones.map(m => {
      if (m.id === mId) {
        const nextStatus = m.status === 'completed' ? 'in-progress' : 'completed';
        return {
          ...m,
          status: nextStatus as any,
          actualDate: nextStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return m;
    });

    const completedCount = updatedMilestones.filter(m => m.status === 'completed').length;
    const progress = Math.round((completedCount / (updatedMilestones.length || 1)) * 100);

    onUpdateProject(project.id, {
      milestones: updatedMilestones,
      phaseProgress: progress
    });
  };

  const handlePostStandupNote = () => {
    if (!newStandupNote.trim()) return;
    setIsSubmitting(true);
    onUpdateProject(project.id, {
      dailyStandupNote: newStandupNote.trim(),
      lastDailyUpdateDate: 'Just now by Director of CS'
    });
    setNewStandupNote('');
    setIsSubmitting(false);
  };

  const hoursAllocated = project.hoursAllocated || 200;
  const hoursBurned = project.hoursBurned || 0;
  const hoursPercent = Math.round((hoursBurned / (hoursAllocated || 1)) * 100);
  const barPercent = Math.min(100, Math.max(0, hoursPercent));

  const cleanPhase = (project.deliveryPhase || '').includes(':')
    ? (project.deliveryPhase || '').split(':')[1].trim()
    : (project.deliveryPhase || 'Phase 1');

  const safeProgress = Math.min(100, Math.max(0, project.phaseProgress || 0));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0A1024] h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-[#1E2C4F] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1E2C4F] flex items-center justify-between bg-slate-50/80 dark:bg-[#0E162E]/80">
          <div className="flex items-center gap-3">
            <ProjectLogo logo={project.logo} name={project.accountName} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {project.accountName}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {project.plan || 'Enterprise'}
                </span>
                {getHealthBadge(project.deliveryHealth || 'on-track')}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Contract ARR: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">${((Number(project.arr) || 0)).toLocaleString()}</span> • Domain: {project.domain}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPredict(project.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
              title="Recalculate Predictive Forecast"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>AI Re-Forecast</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          
          {/* Executive Delivery Scorecard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-50 dark:bg-[#111C35] rounded-xl border border-slate-200 dark:border-[#22355C]">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Phase</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate" title={project.deliveryPhase}>{cleanPhase}</p>
              <div className="w-full bg-slate-200 dark:bg-[#1E2C4F] rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${safeProgress}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">{safeProgress}% complete</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#111C35] rounded-xl border border-slate-200 dark:border-[#22355C]">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Baseline Target</span>
              <p className="text-xs font-bold font-mono text-slate-900 dark:text-white mt-1">{project.baselineTargetDate || 'TBD'}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Contractual commitment</span>
            </div>

            <div className={`p-3 rounded-xl border ${
              (project.varianceDays || 0) > 0 
                ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50' 
                : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
            }`}>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Data Forecast Go-Live</span>
              <p className={`text-xs font-bold font-mono mt-1 ${(project.varianceDays || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {project.predictedGoLiveDate || project.baselineTargetDate || 'TBD'}
              </p>
              <span className={`text-[10px] font-semibold mt-1 block ${(project.varianceDays || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {(project.varianceDays || 0) > 0 ? `+${project.varianceDays}d delay projected` : (project.varianceDays || 0) === 0 ? 'Exact on-time' : `${Math.abs(project.varianceDays || 0)}d ahead of schedule`}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#111C35] rounded-xl border border-slate-200 dark:border-[#22355C]">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Confidence Score</span>
              <p className="text-sm font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                {project.confidenceScore ?? 85}%
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {(project.confidenceScore ?? 85) >= 85 ? 'High probability' : (project.confidenceScore ?? 85) >= 60 ? 'Moderate variance' : 'Critical watch'}
              </span>
            </div>
          </div>

          {/* C-Suite Escalation Callout if Active */}
          {project.csuiteActionNeeded && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-200 space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-bold text-xs uppercase tracking-wider">Executive Decision Required from C-Suite</span>
              </div>
              <p className="text-xs leading-relaxed font-semibold">
                👉 {project.csuiteActionNeeded}
              </p>
              {project.currentBlocker && (
                <div className="mt-2 pt-2 border-t border-amber-200/60 dark:border-amber-800/40 text-[11px] text-rose-700 dark:text-rose-300">
                  <span className="font-bold">Root Cause Blocker: </span>{project.currentBlocker}
                </div>
              )}
            </div>
          )}

          {/* Delivery Team & Stakeholders */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#111C35] rounded-xl border border-slate-200 dark:border-[#22355C] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Project Delivery Team & Client Champions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5">
                <img 
                  src={project.deliveryLead?.avatar || DEFAULT_AVATAR} 
                  alt={project.deliveryLead?.name || 'Lead'} 
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700" 
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                    {project.deliveryLead?.name || 'Unassigned'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate block">
                    {project.deliveryLead?.title || 'Forward Deployed Engineer'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <img 
                  src={project.accountCsm?.avatar || DEFAULT_AVATAR} 
                  alt={project.accountCsm?.name || 'CSM'} 
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700" 
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                    {project.accountCsm?.name || 'Unassigned'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate block">
                    Customer Success Lead
                  </span>
                </div>
              </div>

              <div className="min-w-0 border-l sm:border-l border-slate-200 dark:border-[#22355C] pl-3">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                  {project.clientSponsor?.name || 'Client Sponsor'}
                </span>
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 truncate block">
                  {project.clientSponsor?.role || 'Executive Sponsor'}
                </span>
                <span className="text-[9px] text-slate-400 truncate block font-mono">
                  {project.clientSponsor?.email || (project.domain ? `sponsor@${project.domain}` : 'No email')}
                </span>
              </div>
            </div>

            {/* Hours Burned Gauge */}
            <div className="pt-2 border-t border-slate-200 dark:border-[#1E2C4F]">
              <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                <span>Implementation Hours: {hoursBurned}h / {hoursAllocated}h burned</span>
                <span className={hoursPercent >= 100 ? 'text-rose-500 font-bold' : hoursPercent >= 90 ? 'text-amber-500 font-bold' : 'text-slate-400'}>
                  {hoursPercent}% budget used {hoursBurned > hoursAllocated ? `(+${hoursBurned - hoursAllocated}h over budget)` : ''}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-[#1E2C4F] rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${hoursPercent >= 100 ? 'bg-rose-500' : hoursPercent >= 90 ? 'bg-amber-500' : 'bg-indigo-600'}`} 
                  style={{ width: `${barPercent}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Milestone Timeline Checklist */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Delivery Milestones Checklist ({milestones.filter(m => m.status === 'completed').length} / {milestones.length})
              </h3>
              <span className="text-[10px] text-slate-400">Click to toggle status</span>
            </div>

            <div className="space-y-1.5">
              {milestones.length === 0 ? (
                <div className="p-3 text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-[#111C35] rounded-lg border border-slate-200 dark:border-[#22355C]">
                  No milestones configured yet for this project.
                </div>
              ) : (
                milestones.map((m) => {
                  const isDone = m.status === 'completed';
                  const isBlocked = m.status === 'blocked';
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleToggleMilestone(m.id)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isDone 
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-slate-800 dark:text-slate-200' 
                          : isBlocked
                            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200'
                            : 'bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#22355C] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isDone ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <span className={`text-xs font-semibold block truncate ${isDone ? 'line-through text-slate-400' : ''}`}>
                            {m.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {m.phase} • Owner: {m.owner || project.deliveryLead?.name || 'Lead'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono block text-slate-500 dark:text-slate-400">
                          Target: {m.targetDate || project.baselineTargetDate || 'TBD'}
                        </span>
                        {m.actualDate && (
                          <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 block">
                            Completed: {m.actualDate}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Daily Standup Pulse Note */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#111C35] rounded-xl border border-slate-200 dark:border-[#22355C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Latest Daily Standup Pulse</span>
              <span className="text-[10px] text-slate-400 font-mono">{project.lastDailyUpdateDate || 'Today'}</span>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed italic bg-white dark:bg-[#0A1024] p-2.5 rounded-lg border border-slate-200 dark:border-[#1E2D52]">
              "{project.dailyStandupNote || 'Project execution progressing on schedule.'}"
            </p>
          </div>

          {/* Post New Update */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Log Real-Time Executive Standup Update
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newStandupNote}
                onChange={(e) => setNewStandupNote(e.target.value)}
                placeholder="Add daily standup note or C-Suite briefing point..."
                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handlePostStandupNote()}
              />
              <button
                onClick={handlePostStandupNote}
                disabled={!newStandupNote.trim() || isSubmitting}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Log Note</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#1E2C4F] flex items-center justify-between bg-slate-50 dark:bg-[#0E162E]">
          <span className="text-[11px] text-slate-400 font-mono">
            Project ID: {project.id}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};

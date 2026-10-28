import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Star, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles,
  PhoneCall,
  FileText,
  UserCheck
} from 'lucide-react';
import { Account } from '../../types';
import { HealthBadge, PlanBadge } from '../common/Badge';

interface AccountDetailDrawerProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onTriggerFlow?: (accountId: string) => void;
}

export const AccountDetailDrawer: React.FC<AccountDetailDrawerProps> = ({
  account,
  isOpen,
  onClose,
  onTriggerFlow,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'milestones' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');
  const [notesList, setNotesList] = useState<string[]>([]);

  if (!isOpen || !account) return null;

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotesList([newNote, ...notesList]);
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#070B19] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 border-l border-slate-200 dark:border-[#1E2D52]">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-slate-900 dark:bg-[#0A1024] text-white flex flex-col gap-3.5 border-b border-slate-800 dark:border-[#1E2D52]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-[#131F3B] border border-slate-700 dark:border-[#1E2D52] flex items-center justify-center text-xl shadow-inner">
                {account.logo}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight text-white">{account.name}</h2>
                  <PlanBadge plan={account.plan} />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>{account.domain}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-indigo-400">
                    <UserCheck className="w-3 h-3" /> CSM: {account.csmName}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-[#131F3B] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 dark:border-[#1E2D52] text-center">
            <div className="p-1.5 sm:p-2 rounded-lg bg-slate-800/50 dark:bg-[#0E162E] border border-slate-700/40 dark:border-[#1E2D52]">
              <span className="text-[9px] text-slate-400 uppercase font-semibold">ARR Value</span>
              <p className="text-xs font-mono font-bold text-white mt-0.5">${(account.arr / 1000).toFixed(0)}k</p>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-slate-800/50 dark:bg-[#0E162E] border border-slate-700/40 dark:border-[#1E2D52]">
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Health Score</span>
              <div className="mt-0.5 flex justify-center">
                <HealthBadge score={account.healthScore} tier={account.healthTier} size="sm" showLabel={false} />
              </div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-slate-800/50 dark:bg-[#0E162E] border border-slate-700/40 dark:border-[#1E2D52]">
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Seats Used</span>
              <p className="text-xs font-mono font-bold text-white mt-0.5">{account.seatsUsed} / {account.seatsTotal}</p>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-slate-800/50 dark:bg-[#0E162E] border border-slate-700/40 dark:border-[#1E2D52]">
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Renewal In</span>
              <p className={`text-xs font-mono font-bold mt-0.5 ${account.daysToRenewal < 30 ? 'text-rose-400' : 'text-slate-200'}`}>
                {account.daysToRenewal}d
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-[#1E2D52] bg-slate-50 dark:bg-[#0A1024] px-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview' ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Health & Telemetry
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'contacts' ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Stakeholders ({account.contacts.length})
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'milestones' ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Milestones ({account.milestones.filter(m => m.completed).length}/{account.milestones.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'notes' ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            CSM Touchpoints
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Health Factor Breakdown */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-[#1E2D52] bg-white dark:bg-[#0E162E]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Health Factor Dimensions</h4>
                  <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">Score: {account.healthScore}/100</span>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <span>Product Feature Adoption</span>
                      <span className="font-mono font-bold">{account.healthFactors.usage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#131F3B] rounded-full h-1.5">
                      <div 
                        className={`h-full rounded-full ${account.healthFactors.usage >= 70 ? 'bg-emerald-500' : account.healthFactors.usage >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                        style={{ width: `${account.healthFactors.usage}%` }} 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <span>Support Ticket Health</span>
                      <span className="font-mono font-bold">{account.healthFactors.support}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#131F3B] rounded-full h-1.5">
                      <div 
                        className={`h-full rounded-full ${account.healthFactors.support >= 70 ? 'bg-emerald-500' : account.healthFactors.support >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                        style={{ width: `${account.healthFactors.support}%` }} 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <span>NPS Sentiment Rating</span>
                      <span className="font-mono font-bold">{account.healthFactors.nps}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#131F3B] rounded-full h-1.5">
                      <div 
                        className={`h-full rounded-full ${account.healthFactors.nps >= 70 ? 'bg-emerald-500' : account.healthFactors.nps >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                        style={{ width: `${account.healthFactors.nps}%` }} 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <span>Executive Sponsor Engagement</span>
                      <span className="font-mono font-bold">{account.healthFactors.champion}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#131F3B] rounded-full h-1.5">
                      <div 
                        className={`h-full rounded-full ${account.healthFactors.champion >= 70 ? 'bg-emerald-500' : account.healthFactors.champion >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                        style={{ width: `${account.healthFactors.champion}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags & Account Properties */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">Account Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {account.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-[#131F3B] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D52]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Onboarding progress */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1E2D52] bg-slate-50/50 dark:bg-[#0A1024]">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-800 dark:text-slate-200">Product Onboarding Completion</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{account.onboardingProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#1E2D52] rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${account.onboardingProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-2.5">
              {account.contacts.map((contact, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-[#1E2D52] bg-white dark:bg-[#0E162E] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{contact.name}</p>
                        {contact.isChampion && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" /> Key Champion
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{contact.role}</p>
                    </div>
                  </div>
                  <a
                    href={`mailto:${contact.email}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-[#131F3B] transition-colors"
                    title={`Email ${contact.name}`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-2">
              {account.milestones.map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-[#1E2D52] bg-white dark:bg-[#0E162E] flex items-center gap-2.5">
                  {m.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${m.completed ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                      {m.title}
                    </p>
                    {m.date && <span className="text-[10px] text-slate-400">{m.date}</span>}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${m.completed ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-[#131F3B] text-slate-600 dark:text-slate-400'}`}>
                    {m.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-[#131F3B]/50 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1">CSM Summary & Handover Note:</span>
                <p className="leading-relaxed">{account.notes}</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Log New Customer Touchpoint
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="E.g., Held 30-min check-in with VP of Product. Addressed license limits..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-[#1E2D52] dark:bg-[#0E162E] dark:text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-hidden"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Add Log
                  </button>
                </div>
              </div>

              {notesList.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Recent Activity Logs</span>
                  {notesList.map((n, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-slate-200 dark:border-[#1E2D52] bg-white dark:bg-[#0E162E] text-xs text-slate-800 dark:text-slate-200">
                      <p>{n}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Logged by Elena Rostova • Just now</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="p-3.5 sm:p-4 px-5 border-t border-slate-200 dark:border-[#1E2D52] bg-slate-50 dark:bg-[#0A1024] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert(`Triggering re-engagement email sequence to ${account.name}`);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-[#1E2D52] bg-white dark:bg-[#0E162E] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#131F3B] transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3 h-3 text-slate-500" />
              Schedule QBR
            </button>
            <button
              onClick={() => {
                if (onTriggerFlow) onTriggerFlow(account.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              Deploy In-App Flow
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

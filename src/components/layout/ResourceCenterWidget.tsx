import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  Search, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Sparkles, 
  MessageSquare, 
  ChevronRight,
  ExternalLink,
  Play
} from 'lucide-react';
import { MOCK_CHECKLIST_ITEMS } from '../../data/mockData';

interface ResourceCenterWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  onLaunchTour?: () => void;
}

export const ResourceCenterWidget: React.FC<ResourceCenterWidgetProps> = ({
  isOpen,
  onToggle,
  onLaunchTour
}) => {
  const [checklist, setChecklist] = useState(MOCK_CHECKLIST_ITEMS);
  const [searchWord, setSearchWord] = useState('');
  const [activeTab, setActiveTab] = useState<'checklist' | 'guides' | 'releases'>('checklist');

  const toggleTask = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  const guides = [
    { id: 'g1', title: 'How to calculate Customer Health Scores', time: '3 min read', type: 'Doc' },
    { id: 'g2', title: 'Targeting In-App Flows by User Segment', time: '5 min read', type: 'Doc' },
    { id: 'g3', title: 'Closing the loop on Detractor NPS feedback', time: '4 min read', type: 'Guide' },
    { id: 'g4', title: 'Integrating Salesforce bi-directional sync', time: '6 min read', type: 'Integration' }
  ];

  const releases = [
    { version: 'v3.4.1', title: 'AI Sentiment Auto-Tagging for NPS', date: 'Oct 2026', tag: 'New' },
    { version: 'v3.3.0', title: 'Retention Cohorts Heatmap Visualizer', date: 'Sep 2026', tag: 'Feature' },
    { version: 'v3.2.4', title: 'Multi-step Funnel Drop-off Telemetry', date: 'Aug 2026', tag: 'Improvement' }
  ];

  const filteredGuides = guides.filter(g => 
    g.title.toLowerCase().includes(searchWord.toLowerCase())
  );

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-indigo-400/30 group text-xs"
          title="Open in-app Resource Center"
        >
          {isOpen ? (
            <X className="w-4 h-4 text-white" />
          ) : (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span className="text-xs font-semibold tracking-wide">Help & Guides</span>
              <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
                {completedCount}/{checklist.length}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Floating Resource Center Panel */}
      {isOpen && (
        <div className="fixed bottom-18 right-5 w-88 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#0E162E] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E2D52] flex flex-col overflow-hidden z-40 max-h-[580px] animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-[#070B19] dark:to-[#0E162E] text-white border-b border-slate-800 dark:border-[#1E2D52]">
            <div className="flex items-center justify-between pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold border border-indigo-400/20">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-tight">Resource Center</h4>
                  <p className="text-[10px] text-slate-300">Self-serve assistance & guides</p>
                </div>
              </div>
              <button 
                onClick={onToggle}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mt-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="Search articles and guides..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-white/10 hover:bg-white/15 focus:bg-white text-xs text-white focus:text-slate-900 placeholder-slate-300 focus:placeholder-slate-400 rounded-lg border border-white/10 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex border-b border-slate-200 dark:border-[#1E2D52] bg-slate-50/80 dark:bg-[#0A1024] px-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer text-[11px] ${
                activeTab === 'checklist' 
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Checklist ({completedCount}/{checklist.length})
            </button>
            <button
              onClick={() => setActiveTab('guides')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer text-[11px] ${
                activeTab === 'guides' 
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Guides & Docs
            </button>
            <button
              onClick={() => setActiveTab('releases')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer text-[11px] ${
                activeTab === 'releases' 
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              What's New
            </button>
          </div>

          {/* Body Content */}
          <div className="p-3.5 overflow-y-auto flex-1 space-y-2.5">
            {activeTab === 'checklist' && (
              <div>
                {/* Progress Meter */}
                <div className="p-2.5 bg-indigo-50/50 dark:bg-[#131F3B]/50 rounded-xl border border-indigo-100 dark:border-indigo-900/40 mb-2.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Onboarding Milestones</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-[#1E2D52] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Complete all steps to unlock automatic churn risk prediction.
                  </p>
                </div>

                {/* Checklist items */}
                <div className="space-y-1.5">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleTask(item.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                        item.completed 
                          ? 'bg-slate-50/70 dark:bg-[#0A1024]/60 border-slate-200/80 dark:border-[#1E2D52] text-slate-400 opacity-90' 
                          : 'bg-white dark:bg-[#0A1024] border-slate-200 dark:border-[#1E2D52] hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-2xs'
                      }`}
                    >
                      <button className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400">
                        {item.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950/60" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-semibold truncate ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-white'}`}>
                            {item.title}
                          </p>
                          <span className="text-[9px] text-slate-400 shrink-0 font-mono">{item.duration}</span>
                        </div>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                          {item.actionText} →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {onLaunchTour && (
                  <button
                    onClick={onLaunchTour}
                    className="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 text-indigo-400 dark:text-white" />
                    <span>Launch Product Walkthrough</span>
                  </button>
                )}
              </div>
            )}

            {activeTab === 'guides' && (
              <div className="space-y-1.5">
                {filteredGuides.map(g => (
                  <div key={g.id} className="p-2.5 rounded-xl border border-slate-200 dark:border-[#1E2D52] bg-white dark:bg-[#0A1024] hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50/20 dark:hover:bg-[#131F3B] transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded">
                        {g.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{g.time}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mt-1 leading-snug">
                      {g.title}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'releases' && (
              <div className="space-y-2">
                {releases.map((rel, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-slate-200 dark:border-[#1E2D52] bg-white dark:bg-[#0A1024]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">{rel.version}</span>
                      <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                        {rel.tag}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">{rel.title}</p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{rel.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Support Link */}
          <div className="p-2.5 px-3.5 bg-slate-50 dark:bg-[#0A1024] border-t border-slate-200 dark:border-[#1E2D52] flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-[11px]">
              <MessageSquare className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              Need dedicated CSM help?
            </span>
            <button className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline text-[11px] cursor-pointer">
              Contact CSM →
            </button>
          </div>
        </div>
      )}
    </>
  );
};

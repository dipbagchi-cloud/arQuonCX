import React, { useState } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  CheckSquare, 
  Search, 
  BookOpen, 
  MessageSquare, 
  Eye, 
  Sliders, 
  Layers, 
  Settings2,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { ResourceModule, ResourceChecklistItem } from '../../types';
import { MOCK_CHECKLIST_ITEMS } from '../../data/mockData';

interface ResourceCenterPageProps {
  modules: ResourceModule[];
  onToggleModule: (id: string) => void;
  onOpenWidget: () => void;
}

export const ResourceCenterPage: React.FC<ResourceCenterPageProps> = ({
  modules,
  onToggleModule,
  onOpenWidget,
}) => {
  const [themeColor, setThemeColor] = useState('#5B4CFD');
  const [widgetPosition, setWidgetPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [checklist, setChecklist] = useState<ResourceChecklistItem[]>(MOCK_CHECKLIST_ITEMS);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Resource Center (In-App Self-Service Hub)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure the embedded in-app help widget, gamified checklists, knowledge base integrations, and live support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWidget}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Widget Preview</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Modules on Left, Styling & Checklist on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Module Configurator */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Resource Center Content Modules
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Toggle and organize modules exposed to your customers inside the floating widget.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 font-mono">
                {modules.filter(m => m.enabled).length} Enabled
              </span>
            </div>

            <div className="space-y-2.5">
              {modules.map((mod) => (
                <div 
                  key={mod.id}
                  className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                    mod.enabled 
                      ? 'bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#1E2D52] hover:border-indigo-300 dark:hover:border-indigo-700' 
                      : 'bg-slate-50 dark:bg-[#0B1123] border-slate-200/60 dark:border-[#162340] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                      {mod.type === 'checklist' && <CheckSquare className="w-4 h-4" />}
                      {mod.type === 'articles' && <Search className="w-4 h-4" />}
                      {mod.type === 'announcements' && <Sparkles className="w-4 h-4" />}
                      {mod.type === 'guides' && <BookOpen className="w-4 h-4" />}
                      {mod.type === 'chat' && <MessageSquare className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{mod.title}</h4>
                        {mod.badge && (
                          <span className="text-[9px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900 shrink-0">
                            {mod.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{mod.description}</p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={mod.enabled}
                      onChange={() => onToggleModule(mod.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Gamified Checklist Item Customizer */}
          <div className="p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Onboarding Checklist Tasks
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tasks displayed in the user's setup progress widget.
                </p>
              </div>
              <button
                onClick={() => {
                  const newTask: ResourceChecklistItem = {
                    id: `chk-${Date.now()}`,
                    title: 'Verify Slack Alert Webhook',
                    duration: '2 min',
                    completed: false,
                    actionText: 'Connect'
                  };
                  setChecklist([...checklist, newTask]);
                }}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>

            <div className="space-y-1.5">
              {checklist.map((task) => (
                <div key={task.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-[#1E2D52] bg-slate-50/50 dark:bg-[#111C35] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${task.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-slate-400 font-mono">{task.duration}</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs cursor-pointer">{task.actionText} →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Styling, Launcher & Theme Controls */}
        <div className="space-y-3">
          <div className="p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Widget Branding & Placement
            </h3>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Brand Accent Color
              </label>
              <div className="flex items-center gap-2">
                {['#5B4CFD', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setThemeColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      themeColor === c ? 'scale-110 border-slate-900 dark:border-white shadow-md' : 'border-white dark:border-[#1E2D52] hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Screen Anchor
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  onClick={() => setWidgetPosition('bottom-right')}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    widgetPosition === 'bottom-right' 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' 
                      : 'border-slate-200 dark:border-[#22355C] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152342]'
                  }`}
                >
                  Bottom Right
                </button>
                <button
                  onClick={() => setWidgetPosition('bottom-left')}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    widgetPosition === 'bottom-left' 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' 
                      : 'border-slate-200 dark:border-[#22355C] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152342]'
                  }`}
                >
                  Bottom Left
                </button>
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Launcher Badge Text
              </label>
              <input
                type="text"
                defaultValue="Help & Guides"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-[#22355C] rounded-lg bg-slate-50 dark:bg-[#111C35] text-slate-700 dark:text-slate-200 outline-hidden"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-[#1E2D52]">
              <button
                onClick={onOpenWidget}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-300" />
                <span>Test Live Floating Widget</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Eye, 
  Layers, 
  Target, 
  Settings2, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Play, 
  Layout, 
  Sliders, 
  ArrowRight
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { FlowType } from '../../types';

interface FlowSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFlow?: (newFlow: any) => void;
}

export const FlowSimulatorModal: React.FC<FlowSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSaveFlow,
}) => {
  const [activeTab, setActiveTab] = useState<'build' | 'audience' | 'preview'>('preview');
  const [flowType, setFlowType] = useState<FlowType>('modal');
  const [flowTitle, setFlowTitle] = useState('Explore AI Health Predictive Scoring');
  const [flowBody, setFlowBody] = useState('Detect customer churn risks up to 60 days ahead using automated telemetry and NPS sentiment analysis.');
  const [buttonText, setButtonText] = useState('Get Started');
  const [targetAudience, setTargetAudience] = useState('Enterprise Tier · At-Risk Health (< 50)');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    {
      title: flowTitle,
      body: flowBody,
      btn: buttonText,
      type: flowType,
      target: 'Dashboard Overview'
    },
    {
      title: 'Target At-Risk Accounts',
      body: 'Filter accounts by health score below 50 to prioritize proactive customer success outreach.',
      btn: 'Next: Set Triggers',
      type: 'tooltip' as FlowType,
      target: 'Accounts Table'
    },
    {
      title: 'Automate QBR Check-in Task',
      body: 'Set up an automated action to trigger Slack notifications to the assigned CSM.',
      btn: 'Finish Tour',
      type: 'slideout' as FlowType,
      target: 'Action Center'
    }
  ];

  const handleSave = () => {
    if (onSaveFlow) {
      onSaveFlow({
        id: `flow-${Date.now()}`,
        name: flowTitle,
        type: flowType,
        status: 'live',
        targetAudience,
        triggerEvent: 'First Login',
        impressions: 1,
        completedCount: 1,
        completionRate: 100,
        dropOffRate: 0,
        goalName: 'Complete Walkthrough',
        goalConversion: 80,
        lastEdited: 'Just now',
        steps: steps.map((s, idx) => ({
          stepNumber: idx + 1,
          title: s.title,
          content: s.body,
          buttonText: s.btn,
          type: s.type
        }))
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title="In-App Experience Builder & Live Simulator"
      description="Design no-code modals, tooltips, and driven actions and test them in real-time."
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500">Live Simulator Engine Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Publish Flow Live
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Top Mode Bar */}
        <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-[#0A1024] rounded-xl border border-slate-200/60 dark:border-[#1E2D52]">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'preview' ? 'bg-white dark:bg-[#0E162E] text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Live Simulator
            </button>
            <button
              onClick={() => setActiveTab('build')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'build' ? 'bg-white dark:bg-[#0E162E] text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Content & Formatting
            </button>
            <button
              onClick={() => setActiveTab('audience')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'audience' ? 'bg-white dark:bg-[#0E162E] text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Audience & Triggers
            </button>
          </div>

          <div className="flex items-center gap-2 pr-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-[11px]">Pattern:</span>
            <span className="font-bold text-slate-800 dark:text-white capitalize bg-white dark:bg-[#0E162E] px-2 py-0.5 rounded border border-slate-200 dark:border-[#1E2D52] text-[11px]">{flowType}</span>
          </div>
        </div>

        {/* Tab 1: Live Interactive In-App Simulator */}
        {activeTab === 'preview' && (
          <div className="space-y-3">
            {/* Step navigation dots */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-[#0A1024] p-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-[#1E2D52]">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-[11px]">Step {currentStepIndex + 1} of {steps.length}:</span>
                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">{steps[currentStepIndex].title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => setCurrentStepIndex(c => Math.max(0, c - 1))}
                  className="p-1 rounded-lg border border-slate-200 dark:border-[#1E2D52] bg-white dark:bg-[#0E162E] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#131F3B] disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <span 
                      key={i} 
                      onClick={() => setCurrentStepIndex(i)}
                      className={`w-2 h-2 rounded-full cursor-pointer transition-all ${i === currentStepIndex ? 'bg-indigo-600 scale-125' : 'bg-slate-300 dark:bg-slate-700'}`} 
                    />
                  ))}
                </div>
                <button
                  disabled={currentStepIndex === steps.length - 1}
                  onClick={() => setCurrentStepIndex(c => Math.min(steps.length - 1, c + 1))}
                  className="p-1 rounded-lg border border-slate-200 dark:border-[#1E2D52] bg-white dark:bg-[#0E162E] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#131F3B] disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated App Canvas */}
            <div className="relative h-[360px] bg-slate-100 dark:bg-[#070B19] rounded-2xl border-2 border-slate-300/80 dark:border-[#1E2D52] overflow-hidden shadow-inner flex flex-col select-none">
              {/* Fake App Browser Header */}
              <div className="h-8 bg-slate-200/90 dark:bg-[#0A1024] border-b border-slate-300 dark:border-[#1E2D52] px-3.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-[#0E162E] px-2.5 py-0.5 rounded-md border border-slate-300/60 dark:border-[#1E2D52]">
                  https://app.clientdomain.com/dashboard
                </span>
                <span className="text-[9px] font-semibold text-slate-400">arQuonCX SDK v3.4 Active</span>
              </div>

              {/* Simulated App Body */}
              <div className="flex-1 p-5 relative overflow-hidden bg-slate-50/60 dark:bg-[#070B19]/80">
                {/* Background dummy app mockup */}
                <div className="space-y-3 opacity-30 blur-[0.5px]">
                  <div className="flex gap-3">
                    <div className="h-14 w-1/3 bg-slate-300 dark:bg-slate-800 rounded-xl" />
                    <div className="h-14 w-1/3 bg-slate-300 dark:bg-slate-800 rounded-xl" />
                    <div className="h-14 w-1/3 bg-slate-300 dark:bg-slate-800 rounded-xl" />
                  </div>
                  <div className="h-40 bg-slate-300 dark:bg-slate-800 rounded-xl" />
                </div>

                {/* Simulated In-App Step Experience Layer */}
                <div className="absolute inset-0 flex items-center justify-center p-5 bg-slate-900/35">
                  {currentStepIndex === 0 && (
                    /* Modal Step */
                    <div className="w-full max-w-sm bg-white dark:bg-[#0E162E] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E2D52] p-5 animate-in zoom-in-95 duration-200">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2.5 shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{steps[0].title}</h4>
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{steps[0].body}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Step 1 of 3</span>
                        <button
                          onClick={() => setCurrentStepIndex(1)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <span>{steps[0].btn}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStepIndex === 1 && (
                    /* Tooltip Step Attached to Target */
                    <div className="absolute top-12 left-20 w-72 bg-slate-900 dark:bg-[#0A1024] text-white rounded-xl shadow-2xl p-3.5 border border-slate-700 dark:border-[#1E2D52] animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 dark:border-[#1E2D52] text-indigo-400 font-bold text-[11px]">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" /> Highlighted Element
                        </span>
                        <span className="text-slate-400 text-[10px]">Step 2 of 3</span>
                      </div>
                      <h5 className="text-xs font-bold text-white mt-2">{steps[1].title}</h5>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{steps[1].body}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={() => setCurrentStepIndex(0)}
                          className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setCurrentStepIndex(2)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-lg cursor-pointer"
                        >
                          {steps[1].btn}
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStepIndex === 2 && (
                    /* Slideout Step in Bottom Corner */
                    <div className="absolute bottom-5 right-5 w-80 bg-white dark:bg-[#0E162E] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E2D52] p-4 animate-in slide-in-from-right duration-200">
                      <div className="flex items-center justify-between pb-1.5">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Step 3 of 3</span>
                        <span className="text-slate-400 text-[10px]">Final Step</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">{steps[2].title}</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{steps[2].body}</p>
                      <div className="mt-3.5 flex items-center justify-between">
                        <button
                          onClick={() => setCurrentStepIndex(1)}
                          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setCurrentStepIndex(0)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Complete Tour
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Content & Formatting */}
        {activeTab === 'build' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Experience Format
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['modal', 'slideout', 'tooltip', 'checklist', 'banner'] as FlowType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFlowType(t)}
                      className={`p-2 rounded-lg border text-xs font-semibold capitalize text-center transition-all cursor-pointer ${
                        flowType === t 
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-800' 
                          : 'border-slate-200 dark:border-[#1E2D52] bg-white dark:bg-[#0A1024] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#131F3B]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Flow Name / Title
                </label>
                <input
                  type="text"
                  value={flowTitle}
                  onChange={(e) => setFlowTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-[#1E2D52] dark:bg-[#0A1024] dark:text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Body Copy
              </label>
              <textarea
                rows={2}
                value={flowBody}
                onChange={(e) => setFlowBody(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-[#1E2D52] dark:bg-[#0A1024] dark:text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-[#1E2D52] dark:bg-[#0A1024] dark:text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  CSS Element Selector
                </label>
                <input
                  type="text"
                  defaultValue="#btn-export-report"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 dark:border-[#1E2D52] rounded-xl bg-slate-50 dark:bg-[#0A1024] text-slate-700 dark:text-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Audience & Triggers */}
        {activeTab === 'audience' && (
          <div className="space-y-3.5">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1E2D52] bg-slate-50/50 dark:bg-[#0A1024] space-y-2.5">
              <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Target Audience Segment</h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200 dark:border-[#1E2D52]">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Plan Tier matches</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">Enterprise OR Scale</p>
                </div>
                <div className="p-2.5 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200 dark:border-[#1E2D52]">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Customer Health Score</span>
                  <p className="text-xs font-mono font-bold text-rose-500 mt-0.5">&lt; 50 (At-Risk)</p>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-300">
                <span>Estimated Target Audience:</span>
                <span className="font-mono font-bold">2,410 active users across 14 accounts</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1E2D52] bg-white dark:bg-[#0E162E] space-y-2">
              <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Trigger Conditions</h4>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="trigger" defaultChecked className="text-indigo-600" />
                  <span>Trigger immediately when user navigates to targeted URL</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="trigger" className="text-indigo-600" />
                  <span>Delay 3 seconds after page load</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="trigger" className="text-indigo-600" />
                  <span>Trigger when user clicks specific element</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

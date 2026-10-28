import React, { useState } from 'react';
import { 
  X, 
  MessageSquareHeart, 
  Sparkles, 
  CheckCircle2, 
  Smile, 
  Star, 
  HelpCircle,
  ThumbsUp
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { SurveyType } from '../../types';

interface CreateSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSurvey?: (survey: any) => void;
}

export const CreateSurveyModal: React.FC<CreateSurveyModalProps> = ({
  isOpen,
  onClose,
  onSaveSurvey,
}) => {
  const [surveyType, setSurveyType] = useState<SurveyType>('nps');
  const [surveyTitle, setSurveyTitle] = useState('Enterprise Product NPS & Satisfaction');
  const [surveyQuestion, setSurveyQuestion] = useState('How likely are you to recommend arQuonCX to a colleague or peer?');
  const [targetAudience, setTargetAudience] = useState('All active users with > 3 logins');

  const handleSave = () => {
    if (onSaveSurvey) {
      onSaveSurvey({
        id: `srv-${Date.now()}`,
        title: surveyTitle,
        type: surveyType,
        responsesCount: 0,
        score: surveyType === 'nps' ? '+50 NPS' : '4.8 / 5',
        scoreNumeric: 50,
        status: 'active',
        dateCreated: 'Today',
        targetSegment: targetAudience
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title="Create In-App Survey / Sentiment Collector"
      description="Deploy targeted NPS, CSAT, or CES feedback widgets without code."
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Launch In-App Survey
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Survey Type Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Select Survey Metric Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { type: 'nps' as SurveyType, title: 'NPS', sub: '0-10 Loyalty scale', icon: MessageSquareHeart },
              { type: 'csat' as SurveyType, title: 'CSAT', sub: '1-5 Satisfaction', icon: Star },
              { type: 'ces' as SurveyType, title: 'CES', sub: 'Effort evaluation', icon: ThumbsUp },
              { type: 'micro' as SurveyType, title: 'Micro-Poll', sub: 'Multi-choice answer', icon: HelpCircle },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    setSurveyType(item.type);
                    if (item.type === 'nps') {
                      setSurveyQuestion('How likely are you to recommend arQuonCX to a colleague or peer?');
                    } else if (item.type === 'csat') {
                      setSurveyQuestion('How satisfied are you with our latest platform update?');
                    } else if (item.type === 'ces') {
                      setSurveyQuestion('arQuonCX made it easy for me to monitor customer adoption.');
                    } else {
                      setSurveyQuestion('Which upcoming feature would benefit your team most?');
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    surveyType === item.type 
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-200 dark:ring-indigo-800' 
                      : 'border-slate-200 dark:border-[#1E2D52] bg-white dark:bg-[#0A1024] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#131F3B]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mb-1" />
                  <p className="text-xs font-bold">{item.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Survey Settings */}
        <div className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Internal Campaign Name
            </label>
            <input
              type="text"
              value={surveyTitle}
              onChange={(e) => setSurveyTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-[#1E2D52] dark:bg-[#0A1024] dark:text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Primary User Question
            </label>
            <input
              type="text"
              value={surveyQuestion}
              onChange={(e) => setSurveyQuestion(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-[#1E2D52] dark:bg-[#0A1024] dark:text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Target Audience Segment
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-[#1E2D52] rounded-xl bg-white dark:bg-[#0A1024] dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden"
            >
              <option value="All active users with > 3 logins">All active users with &gt; 3 logins</option>
              <option value="Enterprise Tier Only">Enterprise Tier Only</option>
              <option value="New Users (First 14 Days)">New Users (First 14 Days)</option>
              <option value="At-Risk Churn Accounts">At-Risk Churn Accounts</option>
            </select>
          </div>
        </div>

        {/* Live Survey Widget Preview Card */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1E2D52] bg-slate-50/70 dark:bg-[#0A1024]">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            In-App Widget Preview
          </span>
          <div className="p-3.5 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200 dark:border-[#1E2D52] shadow-sm">
            <h5 className="text-xs font-bold text-slate-800 dark:text-white text-center">{surveyQuestion}</h5>

            {surveyType === 'nps' && (
              <div className="mt-3">
                <div className="grid grid-cols-11 gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <button
                      key={num}
                      type="button"
                      className="py-1 text-xs font-semibold rounded border border-slate-200 dark:border-[#1E2D52] text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>Not likely at all</span>
                  <span>Extremely likely</span>
                </div>
              </div>
            )}

            {surveyType === 'csat' && (
              <div className="mt-3 flex justify-center gap-3 text-xl">
                {['😡', '🙁', '😐', '🙂', '😍'].map((emoji, i) => (
                  <button key={i} className="hover:scale-125 transition-transform cursor-pointer">{emoji}</button>
                ))}
              </div>
            )}

            {surveyType === 'ces' && (
              <div className="mt-3 flex justify-center gap-1.5">
                {['Strongly Disagree', 'Neutral', 'Strongly Agree'].map((opt, i) => (
                  <button key={i} className="px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-[#1E2D52] text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-[#131F3B] font-medium cursor-pointer">
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {surveyType === 'micro' && (
              <div className="mt-2.5 space-y-1">
                {['AI Automated Insights', 'Custom Retention Cohorts', 'Salesforce Two-Way Sync'].map((opt, i) => (
                  <button key={i} className="w-full text-left px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-[#1E2D52] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#131F3B] cursor-pointer">
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

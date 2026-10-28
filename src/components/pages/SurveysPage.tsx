import React, { useState } from 'react';
import { 
  MessageSquareHeart, 
  Plus, 
  Smile, 
  Meh, 
  Frown, 
  Filter, 
  CheckCircle2, 
  MessageSquare, 
  Star, 
  ExternalLink,
  Tag,
  Search,
  ThumbsUp,
  UserCheck
} from 'lucide-react';
import { FeedbackItem, Survey, FeedbackCategory } from '../../types';
import { SentimentBadge } from '../common/Badge';
import { PermissionGate } from '../common/PermissionGate';

interface SurveysPageProps {
  surveys: Survey[];
  feedback: FeedbackItem[];
  onOpenCreateSurvey: () => void;
  onCloseTheLoop: (feedbackId: string) => void;
}

export const SurveysPage: React.FC<SurveysPageProps> = ({
  surveys,
  feedback,
  onOpenCreateSurvey,
  onCloseTheLoop,
}) => {
  const [activeTab, setActiveTab] = useState<'feedback' | 'campaigns'>('feedback');
  const [categoryFilter, setCategoryFilter] = useState<'all' | FeedbackCategory>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchWord, setSearchWord] = useState('');

  const availableTags = ['all', 'Adoption Boost', 'UI Friction', 'Great Support', 'Pricing Tier', 'Resource Center', 'Onboarding Stall'];

  const filteredFeedback = feedback.filter(item => {
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesTag = selectedTag === 'all' || item.tags.includes(selectedTag);
    const matchesSearch = item.userName.toLowerCase().includes(searchWord.toLowerCase()) ||
                          item.accountName.toLowerCase().includes(searchWord.toLowerCase()) ||
                          item.comment.toLowerCase().includes(searchWord.toLowerCase());
    return matchesCat && matchesTag && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Surveys & Voice of Customer (NPS / CSAT)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Capture contextual customer sentiment, analyze automated AI tags, and close the loop with detractors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PermissionGate permission="survey:write" showDisabledTooltip>
            <button
              onClick={onOpenCreateSurvey}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Survey</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* NPS Scoreboard Card */}
      <div className="p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Main Net Promoter Score */}
          <div className="md:border-r border-slate-200 dark:border-[#1E2D52] pr-3">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Promoter Score (NPS)</span>
            <div className="mt-1.5 flex items-baseline gap-2.5">
              <span className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 tracking-tight">+48</span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                +6 vs Q2
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              842 verified responses across 41 accounts.
            </p>
          </div>

          {/* Breakdown bars */}
          <div className="md:col-span-3 space-y-2">
            {/* Promoters */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[11px]">
                  <Smile className="w-3.5 h-3.5 text-emerald-500" /> Promoters (Score 9-10)
                </span>
                <span className="text-slate-800 dark:text-slate-200 text-[11px]">62% (522 responses)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#152342] rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '62%' }} />
              </div>
            </div>

            {/* Passives */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-[11px]">
                  <Meh className="w-3.5 h-3.5 text-amber-500" /> Passives (Score 7-8)
                </span>
                <span className="text-slate-800 dark:text-slate-200 text-[11px]">24% (202 responses)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#152342] rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '24%' }} />
              </div>
            </div>

            {/* Detractors */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 text-[11px]">
                  <Frown className="w-3.5 h-3.5 text-rose-500" /> Detractors (Score 0-6)
                </span>
                <span className="text-slate-800 dark:text-slate-200 text-[11px]">14% (118 responses)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#152342] rounded-full h-1.5 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '14%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#1E2D52]">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'feedback' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Feedback & Sentiment ({feedback.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'campaigns' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Active Campaigns ({surveys.length})</span>
        </button>
      </div>

      {activeTab === 'feedback' && (
        <div className="space-y-3">
          {/* Category Filters, Tag Filters & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-[#111C35] p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${categoryFilter === 'all' ? 'bg-white dark:bg-[#182647] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  All Sentiment
                </button>
                <button
                  onClick={() => setCategoryFilter('promoter')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${categoryFilter === 'promoter' ? 'bg-white dark:bg-[#182647] text-emerald-700 dark:text-emerald-300 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  Promoters
                </button>
                <button
                  onClick={() => setCategoryFilter('passive')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${categoryFilter === 'passive' ? 'bg-white dark:bg-[#182647] text-amber-700 dark:text-amber-300 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  Passives
                </button>
                <button
                  onClick={() => setCategoryFilter('detractor')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${categoryFilter === 'detractor' ? 'bg-white dark:bg-[#182647] text-rose-700 dark:text-rose-300 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  Detractors
                </button>
              </div>

              {/* Tag selector */}
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer"
              >
                {availableTags.map(t => (
                  <option key={t} value={t}>Tag: {t === 'all' ? 'All Tags' : t}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-64 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="Search feedback or user..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#111C35] rounded-lg border border-slate-200 dark:border-[#22355C] text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-hidden"
              />
            </div>
          </div>

          {/* Feedback Cards */}
          <div className="space-y-2.5">
            {filteredFeedback.map((item) => (
              <div 
                key={item.id}
                className="p-3.5 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.userAvatar}
                      alt={item.userName}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{item.userName}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{item.accountName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className={`px-2 py-0.5 rounded-lg font-bold font-mono text-[11px] flex items-center gap-1 ${
                      item.score >= 9 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60' :
                      item.score >= 7 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60' :
                      'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                    }`}>
                      <span>Score: {item.score}/10</span>
                    </div>
                    <SentimentBadge sentiment={item.sentiment} />
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50/70 dark:bg-[#111C35] p-2.5 rounded-lg border border-slate-100 dark:border-[#1B294A]">
                  "{item.comment}"
                </p>

                {/* Footer tags & close the loop action */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-[#1E2D52] text-xs">
                  <div className="flex flex-wrap items-center gap-1">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="text-[9px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900 flex items-center gap-1">
                        <Tag className="w-2 h-2 text-indigo-400" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-slate-400" /> CSM: {item.csmAssigned}
                    </span>
                    <PermissionGate permission="survey:triage" showDisabledTooltip>
                      <button
                        onClick={() => onCloseTheLoop(item.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                          item.status === 'addressed' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{item.status === 'addressed' ? 'Loop Closed' : 'Close Loop'}</span>
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {surveys.map((survey) => (
            <div key={survey.id} className="p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">
                    {survey.type.toUpperCase()} Survey
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                    ● Active
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{survey.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Target: {survey.targetSegment}</p>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Aggregate Score</span>
                    <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">{survey.score}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Responses</span>
                    <p className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">{survey.responsesCount}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-[#1E2D52] flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">Created {survey.dateCreated}</span>
                <button 
                  onClick={() => setActiveTab('feedback')}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer text-xs"
                >
                  View Verbatims →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

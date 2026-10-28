import React from 'react';
import { HealthTier, PlanTier, FlowStatus, SentimentType } from '../../types';

interface HealthBadgeProps {
  score: number;
  tier?: HealthTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const HealthBadge: React.FC<HealthBadgeProps> = ({ 
  score, 
  tier, 
  size = 'md',
  showLabel = true 
}) => {
  const calculatedTier: HealthTier = tier || (score >= 75 ? 'healthy' : score >= 50 ? 'neutral' : 'at-risk');

  const configs = {
    healthy: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
      label: 'Healthy'
    },
    neutral: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
      label: 'Moderate'
    },
    'at-risk': {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
      label: 'At Risk'
    }
  };

  const config = configs[calculatedTier];
  const sizeClasses = size === 'sm' 
    ? 'px-1.5 py-0.5 text-[10px]' 
    : size === 'lg' 
      ? 'px-2.5 py-1 text-xs font-semibold' 
      : 'px-2 py-0.5 text-[11px] font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses} tracking-tight`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse shrink-0`} />
      <span className="font-bold font-mono">{score}</span>
      {showLabel && <span className="opacity-80">· {config.label}</span>}
    </span>
  );
};

export const PlanBadge: React.FC<{ plan: PlanTier }> = ({ plan }) => {
  const configs = {
    Enterprise: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-semibold',
    Scale: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 font-medium',
    Starter: 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium'
  };

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] tracking-wide border ${configs[plan]}`}>
      {plan}
    </span>
  );
};

export const FlowStatusBadge: React.FC<{ status: FlowStatus }> = ({ status }) => {
  const configs = {
    live: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
      label: 'Live'
    },
    paused: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      dot: 'bg-amber-500',
      label: 'Paused'
    },
    draft: {
      bg: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      dot: 'bg-slate-400',
      label: 'Draft'
    }
  };

  const config = configs[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export const SentimentBadge: React.FC<{ sentiment: SentimentType; score?: number }> = ({ sentiment, score }) => {
  const configs = {
    positive: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    neutral: 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    negative: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border capitalize ${configs[sentiment]}`}>
      {sentiment === 'positive' && '👍 '}
      {sentiment === 'neutral' && '⚖️ '}
      {sentiment === 'negative' && '⚠️ '}
      {sentiment}
      {score !== undefined && ` (${score}/10)`}
    </span>
  );
};

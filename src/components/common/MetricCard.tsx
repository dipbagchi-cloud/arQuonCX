import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number; // e.g. +4.2 or -2.1
  changeText?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'highlight' | 'warning';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeText = 'vs last month',
  icon,
  subtitle,
  badge,
  onClick,
  variant = 'default'
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const variantStyles = {
    default: 'bg-white dark:bg-[#0E162E] border-slate-200/80 dark:border-[#1E2D52] hover:border-slate-300 dark:hover:border-[#2C4175]',
    highlight: 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60 hover:border-indigo-300 dark:hover:border-indigo-700',
    warning: 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 hover:border-amber-300 dark:hover:border-amber-700'
  };

  return (
    <div 
      onClick={onClick}
      className={`p-3.5 sm:p-4 rounded-xl border shadow-2xs transition-all duration-200 ${variantStyles[variant]} ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase truncate">{title}</span>
        {icon && (
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#152342] text-slate-600 dark:text-indigo-400 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">{value}</span>
        {badge}
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[11px]">
        {change !== undefined && (
          <span className={`inline-flex items-center font-bold gap-0.5 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {isPositive && <ArrowUpRight className="w-3 h-3" />}
            {isNegative && <ArrowDownRight className="w-3 h-3" />}
            {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
        {changeText && (
          <span className="text-slate-500 dark:text-slate-400 truncate">{changeText}</span>
        )}
      </div>

      {subtitle && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#1E2D52] text-[10px] text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
};

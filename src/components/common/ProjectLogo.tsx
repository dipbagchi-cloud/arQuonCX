import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface ProjectLogoProps {
  logo?: string;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ProjectLogo: React.FC<ProjectLogoProps> = ({
  logo,
  name,
  className = '',
  size = 'md'
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg'
  };

  const isUrl = logo && (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/'));

  // Extract up to 2 initials from name (e.g. "Arcelor Mittal H&S" -> "AM", "SHPL" -> "SH")
  const getInitials = (str: string): string => {
    if (!str) return 'CX';
    const words = str.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  // Deterministic color palette based on name hash
  const getBgColor = (str: string): string => {
    const colors = [
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
    ];
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // 1. If it's a valid URL and not errored, render img
  if (isUrl && !imageError) {
    return (
      <div className={`relative shrink-0 ${sizeClasses[size]} rounded-lg overflow-hidden border border-slate-200 dark:border-[#22355C] bg-white dark:bg-[#111C35] flex items-center justify-center p-0.5 ${className}`}>
        <img
          src={logo}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-contain rounded-md"
        />
      </div>
    );
  }

  // 2. If it's an emoji (1 or 2 characters and not alphanumeric)
  const isEmoji = logo && logo.length <= 4 && !/^[a-zA-Z0-9]+$/.test(logo);
  if (isEmoji) {
    return (
      <span className={`shrink-0 ${sizeClasses[size]} rounded-lg border border-slate-200 dark:border-[#22355C] bg-slate-50 dark:bg-[#111C35] flex items-center justify-center shadow-2xs ${className}`}>
        {logo}
      </span>
    );
  }

  // 3. Fallback: Initials Badge or Icon
  const initials = getInitials(name);
  const colorClass = getBgColor(name);

  return (
    <div className={`shrink-0 ${sizeClasses[size]} rounded-lg border font-bold flex items-center justify-center font-mono tracking-tight shadow-2xs ${colorClass} ${className}`} title={name}>
      {initials ? initials : <Building2 className="w-4 h-4" />}
    </div>
  );
};

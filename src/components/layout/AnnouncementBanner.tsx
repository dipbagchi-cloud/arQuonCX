import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, ExternalLink } from 'lucide-react';
import { useFrontendMeta } from '../../context/FrontendMetaContext';

export const AnnouncementBanner: React.FC = () => {
  const { meta, isBannerDismissed, dismissBanner } = useFrontendMeta();
  const banner = meta.announcementBanner;

  if (!banner || !banner.enabled || isBannerDismissed) {
    return null;
  }

  const getBannerStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-rose-600 text-white shadow-xs',
          icon: <AlertTriangle className="w-4 h-4 text-white shrink-0" />,
          button: 'text-white/80 hover:text-white',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500 text-slate-950 shadow-xs font-semibold',
          icon: <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />,
          button: 'text-slate-950/70 hover:text-slate-950',
        };
      case 'success':
        return {
          bg: 'bg-emerald-600 text-white shadow-xs',
          icon: <CheckCircle2 className="w-4 h-4 text-white shrink-0" />,
          button: 'text-white/80 hover:text-white',
        };
      case 'info':
      default:
        return {
          bg: 'bg-indigo-600 text-white shadow-xs',
          icon: <Info className="w-4 h-4 text-white shrink-0" />,
          button: 'text-white/80 hover:text-white',
        };
    }
  };

  const style = getBannerStyles(banner.type);

  return (
    <div className={`w-full py-2 px-4 transition-all duration-200 z-50 flex items-center justify-between gap-3 text-xs ${style.bg}`}>
      <div className="flex items-center gap-2.5 mx-auto truncate">
        {style.icon}
        <span className="font-medium truncate">{banner.message}</span>
        {banner.linkText && banner.linkUrl && (
          <a
            href={banner.linkUrl}
            className="underline font-bold hover:opacity-80 transition-opacity ml-1.5 shrink-0"
          >
            {banner.linkText} →
          </a>
        )}
      </div>

      {banner.dismissible && (
        <button
          onClick={dismissBanner}
          title="Dismiss announcement"
          className={`p-1 rounded-md transition-colors cursor-pointer ${style.button}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

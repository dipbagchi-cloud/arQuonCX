import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Sparkles, 
  MessageSquareHeart, 
  BarChart3, 
  HelpCircle, 
  Plug, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Radio,
  LogOut,
  Lock,
  Briefcase
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onGoToHome?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  onGoToHome,
  onLogout,
}) => {
  const { user, role, can } = useAuth();

  const navItems = [
    {
      tab: 'overview' as NavigationTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: undefined
    },
    {
      tab: 'delivery-briefing' as NavigationTab,
      label: 'C-Suite Delivery Briefing',
      icon: Briefcase,
      badge: 'Weekly'
    },
    {
      tab: 'accounts' as NavigationTab,
      label: 'Accounts 360°',
      icon: Building2,
      badge: '6'
    },
    {
      tab: 'users' as NavigationTab,
      label: 'Users & Segments',
      icon: Users,
      badge: undefined
    },
    {
      tab: 'flows' as NavigationTab,
      label: 'Adoption Flows',
      icon: Sparkles,
      badge: can('flow:write') ? 'Live' : 'View Only'
    },
    {
      tab: 'surveys' as NavigationTab,
      label: 'Surveys & NPS',
      icon: MessageSquareHeart,
      badge: can('survey:write') ? '+48' : 'View Only'
    },
    {
      tab: 'analytics' as NavigationTab,
      label: 'Product Analytics',
      icon: BarChart3,
      badge: undefined
    },
    {
      tab: 'resource-center' as NavigationTab,
      label: 'Resource Center',
      icon: HelpCircle,
      badge: 'Widget'
    },
    {
      tab: 'integrations' as NavigationTab,
      label: 'Integrations & SDK',
      icon: Plug,
      badge: can('integrations:manage') ? undefined : '🔒 Admin'
    }
  ];

  return (
    <aside className={`relative flex flex-col bg-white dark:bg-[#0A1024] text-slate-700 dark:text-slate-300 border-r border-slate-200/80 dark:border-[#1B294A] transition-all duration-300 ease-in-out shrink-0 select-none z-30 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Brand & Workspace Switcher */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-200/80 dark:border-[#1B294A]">
        <div 
          onClick={onGoToHome}
          className="flex items-center overflow-hidden cursor-pointer group"
          title="Click to view Public Homepage"
        >
          <BrandLogo
            size="sm"
            showWordmark={!collapsed}
            badgeText="PROD"
            subtitle="Customer Success Suite"
          />
        </div>

        <button 
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* App Space Pill */}
      {!collapsed && (
        <div className="px-3 py-2.5 border-b border-slate-200/80 dark:border-[#1B294A]/70">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping shrink-0" />
              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">Acme Web Platform</span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white shrink-0" />
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <div className="px-2.5 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Platform Modules
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group relative ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:scale-105'}`} />
              
              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : item.badge === 'Live' 
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}

              {collapsed && isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 dark:bg-white rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      <div className="p-2.5 border-t border-slate-200/80 dark:border-[#1B294A] bg-slate-50/80 dark:bg-[#070B19]/80">
        <div className="flex items-center justify-between p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full ring-1.5 ring-indigo-500/60 object-cover shrink-0"
              title={`${user.name} (${role})`}
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="truncate">{user.title}</span>
                </span>
                <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-300/80 truncate">
                  {role.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>

          {!collapsed && onLogout && (
            <button
              onClick={onLogout}
              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sign Out to Login Screen"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

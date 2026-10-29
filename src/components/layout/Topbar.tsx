import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Bell, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown,
  Sparkles,
  Command,
  ExternalLink,
  Globe,
  LogOut,
  Sliders
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { NavigationTab } from '../../types';
import { useAuth, RoleName, ROLE_PERSONAS } from '../../context/AuthContext';
import { PermissionGate } from '../common/PermissionGate';

interface TopbarProps {
  currentTab: NavigationTab;
  onOpenFlowSimulator: () => void;
  onOpenSurveyCreator: () => void;
  onOpenResourceCenter: () => void;
  onGoToHome?: () => void;
  onLogout?: () => void;
  onNavigateTab?: (tab: NavigationTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDateRange: string;
  onDateRangeChange: (range: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onOpenFlowSimulator,
  onOpenSurveyCreator,
  onOpenResourceCenter,
  onGoToHome,
  onLogout,
  onNavigateTab,
  searchQuery,
  onSearchChange,
  selectedDateRange,
  onDateRangeChange,
}) => {
  const { user, role, switchRole, isLiveApi } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'alert',
      title: 'FinPulse Systems: Health score dropped to 44',
      time: '12m ago',
      desc: 'Seat utilization fell by 45%. CSM Liam Vance tagged for urgent review.'
    },
    {
      id: 2,
      type: 'feedback',
      title: 'New Detractor NPS from Vortex Logistics',
      time: '1h ago',
      desc: 'Hans Gruber gave score 3: "Need onboarding assistance with funnels".'
    },
    {
      id: 3,
      type: 'success',
      title: 'Acme Cloud Dynamics reached 100% adoption',
      time: '3h ago',
      desc: 'All 142 provisioned seats have completed the AI features onboarding.'
    }
  ];

  const dateOptions = [
    'Last 7 Days',
    'Last 30 Days',
    'Last 90 Days (Q3)',
    'Year to Date (2026)'
  ];

  const roleConfig: Record<RoleName, { label: string; icon: string; badgeClass: string; desc: string }> = {
    SUPER_ADMIN: {
      label: 'Super Admin',
      icon: '👑',
      badgeClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
      desc: 'Full system & governance access'
    },
    CS_OPS: {
      label: 'CS Operations',
      icon: '⚙️',
      badgeClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
      desc: 'Integrations, scores & audit logs'
    },
    CSM: {
      label: 'Customer Success',
      icon: '💼',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      desc: 'Account health & touchpoints'
    },
    PRODUCT_GROWTH: {
      label: 'Product / Growth',
      icon: '🚀',
      badgeClass: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
      desc: 'Flows, surveys & funnels'
    },
    VIEWER: {
      label: 'Read-Only Viewer',
      icon: '👁️',
      badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      desc: 'Dashboard analytics & telemetry'
    },
  };

  const currentRoleInfo = roleConfig[role] || roleConfig.VIEWER;

  return (
    <header className="h-14 bg-white dark:bg-[#0A1024] border-b border-slate-200/80 dark:border-[#1E2C4F] px-4 sm:px-5 flex items-center justify-between gap-3 sticky top-0 z-20 transition-colors">
      {/* Search Input */}
      <div className="flex-1 max-w-xs sm:max-w-sm relative">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search accounts, users, flows, NPS feedback..."
            className="w-full pl-8 pr-11 py-1.5 bg-slate-50 dark:bg-[#111C35] hover:bg-slate-100/80 dark:hover:bg-[#152342] focus:bg-white dark:focus:bg-[#131F3B] text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-lg border border-slate-200 dark:border-[#22355C] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all outline-hidden"
          />
          <div className="absolute right-2 flex items-center gap-0.5 px-1 py-0.5 bg-white dark:bg-[#0A1024] border border-slate-200 dark:border-[#22355C] rounded text-[9px] font-medium text-slate-400 shadow-2xs pointer-events-none">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Live DB / Backend API Indicator */}
        <div 
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] text-[10px] font-medium text-slate-600 dark:text-slate-300"
          title={isLiveApi ? "Connected to live Backend & Database at http://localhost:3001" : "Running in fallback mode"}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isLiveApi ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-mono">{isLiveApi ? 'Live API (SQLite/PostgreSQL)' : 'Offline Mock'}</span>
        </div>

        {/* RBAC Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs hover:scale-[1.02] ${currentRoleInfo.badgeClass}`}
            title="Switch User Persona & Role-Based Access Control"
          >
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-4 h-4 rounded-full object-cover ring-1 ring-indigo-400 shrink-0" 
            />
            <span className="font-bold">{user.name.split(' ')[0]}</span>
            <span className="text-[10px] opacity-75 font-normal hidden sm:inline">({currentRoleInfo.label})</span>
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-[#0E162E] rounded-xl shadow-2xl border border-slate-200 dark:border-[#1E2D52] py-1.5 z-40 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-[#1E2D52]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Active User Persona</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Select a team persona to test live RBAC gating</p>
              </div>

              <div className="py-1">
                {(Object.keys(roleConfig) as RoleName[]).map((rKey) => {
                  const rData = roleConfig[rKey];
                  const pUser = ROLE_PERSONAS[rKey];
                  const isCurrent = role === rKey;
                  return (
                    <button
                      key={rKey}
                      onClick={() => {
                        switchRole(rKey);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-[#131F3B] transition-colors flex items-center gap-2.5 cursor-pointer ${
                        isCurrent ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img 
                          src={pUser.avatar} 
                          alt={pUser.name} 
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-400"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 text-[9px] bg-white dark:bg-slate-900 rounded-full px-0.5">
                          {rData.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold truncate">{pUser.name}</p>
                          {isCurrent && <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-bold">Active</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{pUser.title}</p>
                        <p className="text-[9px] text-indigo-500 dark:text-indigo-400 font-semibold">{rData.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Switch to Marketing Site */}
        {onGoToHome && (
          <button
            onClick={onGoToHome}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131F3B] rounded-lg border border-slate-200 dark:border-[#22355C] transition-colors cursor-pointer"
            title="View Public Marketing Homepage"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Homepage</span>
          </button>
        )}

        {/* Admin Console Shortcut */}
        {(role === 'SUPER_ADMIN' || role === 'CS_OPS') && onNavigateTab && (
          <button
            onClick={() => onNavigateTab('admin-portal')}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              currentTab === 'admin-portal'
                ? 'bg-purple-600 text-white border-transparent shadow-xs'
                : 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/50'
            }`}
            title="Open Admin Console & Meta Management"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </button>
        )}

        {/* Date Range Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg hover:bg-slate-50 dark:hover:bg-[#152342] transition-colors shadow-2xs cursor-pointer"
          >
            <Calendar className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span>{selectedDateRange}</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>

          {showDateDropdown && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#111C35] rounded-xl shadow-xl border border-slate-200 dark:border-[#22355C] py-1 z-30 animate-in fade-in zoom-in-95">
              {dateOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onDateRangeChange(opt);
                    setShowDateDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-indigo-50 dark:hover:bg-[#182647] transition-colors flex items-center justify-between cursor-pointer ${
                    selectedDateRange === opt ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/40' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {opt}
                  {selectedDateRange === opt && <CheckCircle2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle (Dark & White Mode) */}
        <ThemeToggle />

        {/* Live SDK status */}
        <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Tracking Active</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131F3B] rounded-lg transition-colors cursor-pointer"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0A1024]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-80 md:w-96 bg-white dark:bg-[#0E162E] rounded-xl shadow-2xl border border-slate-200 dark:border-[#1E2D52] overflow-hidden z-30 animate-in fade-in zoom-in-95">
              <div className="p-3 bg-slate-50 dark:bg-[#111C35] border-b border-slate-100 dark:border-[#1E2D52] flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">CS Health Alerts</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">3 unread notifications requiring action</p>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Mark all read</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-[#1E2D52] max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-[#131F3B] transition-colors cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      {n.type === 'alert' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />}
                      {n.type === 'feedback' && <span className="text-xs shrink-0">💬</span>}
                      {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Resource Center preview trigger */}
        <button
          onClick={onOpenResourceCenter}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131F3B] rounded-lg border border-slate-200 dark:border-[#22355C] transition-colors cursor-pointer"
          title="Open in-app Resource Center widget preview"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Help Widget</span>
        </button>

        {/* Action Button: Create Experience (RBAC Gated) */}
        <PermissionGate permission="flow:write">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenFlowSimulator}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Flow</span>
            </button>
          </div>
        </PermissionGate>

        {/* Logout button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-[#131F3B] rounded-lg transition-colors cursor-pointer"
            title="Log Out to Login Screen"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};

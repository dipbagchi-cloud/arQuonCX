import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sliders
} from 'lucide-react';
import { useAuth, RoleName, Permission } from '../../context/AuthContext';

export const RBACBanner: React.FC = () => {
  const { user, role, switchRole, permissions } = useAuth();
  const [showMatrix, setShowMatrix] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastSwitchedTime, setLastSwitchedTime] = useState<string | null>(null);

  const personasList: { role: RoleName; label: string; icon: string; shortRole: string; color: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Dr. Aris Vance', icon: '👑', shortRole: 'Super Admin', color: 'from-purple-600 to-indigo-600' },
    { role: 'CS_OPS', label: 'David Kim', icon: '⚙️', shortRole: 'CS Operations', color: 'from-indigo-600 to-blue-600' },
    { role: 'CSM', label: 'Elena Rostova', icon: '💼', shortRole: 'Lead CSM', color: 'from-emerald-600 to-teal-600' },
    { role: 'PRODUCT_GROWTH', label: 'Sophia Lindqvist', icon: '🚀', shortRole: 'Product Growth', color: 'from-sky-500 to-cyan-600' },
    { role: 'VIEWER', label: 'Alex Wright', icon: '👁️', shortRole: 'Read-Only Viewer', color: 'from-slate-600 to-slate-700' },
  ];

  const handleQuickSwitch = async (targetRole: RoleName) => {
    if (targetRole === role) return;
    await switchRole(targetRole);
    setLastSwitchedTime(new Date().toLocaleTimeString());
  };

  // Detailed capabilities for permission matrix
  const allPermissions: { key: Permission; label: string; category: string }[] = [
    { key: 'account:read', label: 'View Customer 360 & Health Scores', category: 'Accounts' },
    { key: 'account:write', label: 'Edit Account Profiles & Sync Data', category: 'Accounts' },
    { key: 'account:delete', label: 'Delete or Archive Accounts', category: 'Accounts' },
    { key: 'account:touchpoint', label: 'Log Touchpoints & QBR Meetings', category: 'Accounts' },
    { key: 'flow:read', label: 'View In-App Adoption Flows', category: 'Flows' },
    { key: 'flow:write', label: 'Create & Edit In-App Experiences', category: 'Flows' },
    { key: 'flow:publish', label: 'Publish / Pause Live In-App Flows', category: 'Flows' },
    { key: 'flow:delete', label: 'Delete Flow Sequences', category: 'Flows' },
    { key: 'survey:read', label: 'View NPS, CSAT & Detractor Feeds', category: 'Surveys' },
    { key: 'survey:write', label: 'Design New In-App Surveys', category: 'Surveys' },
    { key: 'survey:publish', label: 'Launch Survey Targeting Campaigns', category: 'Surveys' },
    { key: 'survey:triage', label: 'Close the Loop with Detractors', category: 'Surveys' },
    { key: 'analytics:read', label: 'View Funnels & Cohort Retention', category: 'Analytics' },
    { key: 'analytics:export', label: 'Export Telemetry & CSV Reports', category: 'Analytics' },
    { key: 'analytics:tag', label: 'Tag New UI Elements & Events', category: 'Analytics' },
    { key: 'resource_center:read', label: 'View Resource Center Widget', category: 'Resource Center' },
    { key: 'resource_center:manage', label: 'Manage Help Modules & Guides', category: 'Resource Center' },
    { key: 'integrations:manage', label: 'Configure CRM & SDK Integrations', category: 'Governance' },
    { key: 'api_keys:manage', label: 'Generate & Revoke API Keys', category: 'Governance' },
    { key: 'team:manage', label: 'Invite & Manage Workspace Staff', category: 'Governance' },
    { key: 'audit:read', label: 'Inspect Governance Audit Logs', category: 'Governance' },
  ];

  const roleDescriptions: Record<RoleName, { headline: string; description: string; badgeColor: string }> = {
    SUPER_ADMIN: {
      headline: 'Full System Authority & Governance',
      description: 'You have unrestricted access to all 21 permissions, including staff management, integrations, and raw audit logs.',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    },
    CS_OPS: {
      headline: 'CS Operations & Technical Administration',
      description: 'You manage CRM syncs, telemetry integrations, health scoring models, and enterprise security settings.',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
    },
    CSM: {
      headline: 'Customer Success & Account Retention',
      description: 'Focused on account health 360°, customer touchpoints, and closing the loop on NPS detractor feedback. Flow editing and admin settings are restricted.',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    },
    PRODUCT_GROWTH: {
      headline: 'Product Growth & In-App Adoption',
      description: 'Full authoring access to in-app flows, checklists, NPS surveys, funnels, and feature tagging. Account administrative controls are restricted.',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-300 dark:border-sky-700',
    },
    VIEWER: {
      headline: 'Executive & Read-Only Stakeholder',
      description: 'Safe view-only telemetry mode. All creation, editing, publishing, deleting, and data exporting actions are locked and disabled.',
      badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    },
  };

  const currentDesc = roleDescriptions[role] || roleDescriptions.VIEWER;
  const grantedCount = permissions.length;
  const totalCount = allPermissions.length;

  return (
    <div className="mb-4 rounded-xl border border-indigo-200 dark:border-[#22355C] bg-white dark:bg-[#0B1228] shadow-sm transition-all overflow-hidden">
      {/* Top Bar / Persona Switcher Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 dark:from-[#0E162E] dark:via-[#131F3F] dark:to-[#0E162E] border-b border-slate-200/80 dark:border-[#1E2D52] flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active User Persona Identification */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500 shadow-sm shrink-0" 
            />
            <span 
              className="absolute -bottom-1 -right-1 text-xs bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-xs"
              title={`Role: ${role}`}
            >
              {personasList.find(p => p.role === role)?.icon || '👤'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {user.name}
              </span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border shadow-2xs ${currentDesc.badgeColor}`}>
                {role.replace('_', ' ')}
              </span>
              {lastSwitchedTime && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Switched
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.title} • <span className="font-mono text-[11px] text-slate-400">{user.email}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick 1-Click Role Switcher Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1 hidden lg:inline">
            Switch Persona:
          </span>
          {personasList.map((p) => {
            const isActive = p.role === role;
            return (
              <button
                key={p.role}
                onClick={() => handleQuickSwitch(p.role)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400 ring-offset-1 dark:ring-offset-[#0B1228] scale-[1.02]'
                    : 'bg-white dark:bg-[#111C35] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#22355C] hover:bg-slate-100 dark:hover:bg-[#172545]'
                }`}
                title={`Switch to ${p.label} (${p.shortRole})`}
              >
                <span>{p.icon}</span>
                <span className="hidden md:inline">{p.label.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75 font-normal hidden xl:inline">({p.shortRole})</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            title={isMinimized ? "Expand role details" : "Minimize banner"}
          >
            {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Role Scope & Permissions Summary (Collapsible) */}
      {!isMinimized && (
        <div className="px-4 py-3 bg-white dark:bg-[#0B1228]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  {currentDesc.headline}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                  ({grantedCount} of {totalCount} permissions enabled)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                {currentDesc.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowMatrix(!showMatrix)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showMatrix ? 'Hide Permissions Matrix' : 'View Permissions Matrix (21)'}</span>
                {showMatrix ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Expandable Permissions Matrix */}
          {showMatrix && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1E2D52] animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Granular Capability Breakdown for {user.name} ({role}):
                </p>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Enabled ({grantedCount})
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 font-semibold">
                    <Lock className="w-3 h-3 text-rose-500" /> Locked ({totalCount - grantedCount})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {allPermissions.map((perm) => {
                  const isGranted = permissions.includes(perm.key);
                  return (
                    <div
                      key={perm.key}
                      className={`flex items-start gap-2 p-2 rounded-lg text-xs border transition-colors ${
                        isGranted
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-slate-800 dark:text-slate-200'
                          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      {isGranted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-rose-400 dark:text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold truncate">{perm.label}</span>
                        </div>
                        <span className="font-mono text-[9px] text-slate-400 block truncate">
                          {perm.key}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

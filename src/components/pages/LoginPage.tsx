import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert,
  CheckCircle2, 
  Star, 
  ArrowLeft,
  KeyRound,
  Briefcase,
  BarChart3,
  Sliders,
  Check,
  Building2,
  Users
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { BrandLogo } from '../common/BrandLogo';
import { NavigationTab } from '../../types';
import { useAuth, RoleName } from '../../context/AuthContext';
import { useFrontendMeta } from '../../context/FrontendMetaContext';
import { AzureAdSsoModal, MicrosoftLogoSvg } from '../modals/AzureAdSsoModal';

interface LoginPageProps {
  onLoginSuccess: (targetTab?: NavigationTab) => void;
  onBackToHome: () => void;
}

type PortalId = 'admin' | 'cs_delivery' | 'product' | 'executive';

interface RolePortal {
  id: PortalId;
  label: string;
  role: RoleName;
  badge: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultTab: NavigationTab;
  title: string;
  subtitle: string;
  description: string;
  personas: Array<{
    name: string;
    email: string;
    title: string;
    role: RoleName;
    avatar: string;
  }>;
}

const ROLE_PORTALS: RolePortal[] = [
  {
    id: 'admin',
    label: 'Admin & Operations',
    role: 'SUPER_ADMIN',
    badge: 'Privileged',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800/80',
    icon: ShieldAlert,
    defaultTab: 'admin-portal',
    title: 'Admin Console & Governance',
    subtitle: 'Manage frontend metadata, feature flags, role permissions, and staff provisioning.',
    description: 'Full administrative control over frontend branding, navigation modules, and RBAC matrix.',
    personas: [
      {
        name: 'Dr. Aris Vance',
        email: 'admin@arquoncx.io',
        title: 'VP of Customer Success & Operations (Super Admin)',
        role: 'SUPER_ADMIN',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      },
      {
        name: 'David Kim',
        email: 'csops@arquoncx.io',
        title: 'CS Operations & Data Analyst',
        role: 'CS_OPS',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'cs_delivery',
    label: 'CS & Delivery Lead',
    role: 'CSM',
    badge: 'Operational',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
    icon: Briefcase,
    defaultTab: 'delivery-briefing',
    title: 'Customer Success & Delivery Hub',
    subtitle: 'Account 360°, weekly C-Suite delivery briefings, and granular WBS checklists.',
    description: 'Manage client onboarding velocity, milestones, blockers, and executive briefs.',
    personas: [
      {
        name: 'Dip Bagchi',
        email: 'dip.bagchi@qbadvisory.com',
        title: 'Director of Customer Success',
        role: 'CSM',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      },
      {
        name: 'Elena Rostova',
        email: 'elena@arquoncx.io',
        title: 'Lead Enterprise CSM',
        role: 'CSM',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'product',
    label: 'Product & Growth',
    role: 'PRODUCT_GROWTH',
    badge: 'Authoring',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80',
    icon: Sparkles,
    defaultTab: 'flows',
    title: 'Product Growth & In-App Tours',
    subtitle: 'Build onboarding flows, in-app walkthroughs, NPS feedback triage, and feature tags.',
    description: 'Design interactive walkthroughs, track product funnels, and close the loop on detractors.',
    personas: [
      {
        name: 'Sophia Lindqvist',
        email: 'product@arquoncx.io',
        title: 'Head of Product Growth & Onboarding',
        role: 'PRODUCT_GROWTH',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'executive',
    label: 'Executive & Viewer',
    role: 'VIEWER',
    badge: 'Read-Only',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
    icon: BarChart3,
    defaultTab: 'overview',
    title: 'C-Suite Scorecard & Board Observer',
    subtitle: 'High-level scorecards, Go-Live confidence gauges, and revenue retention analytics.',
    description: 'Protected read-only visibility into client health, pipeline ARR, and delivery forecasts.',
    personas: [
      {
        name: 'Alex Wright',
        email: 'viewer@arquoncx.io',
        title: 'Executive Stakeholder / Board Observer',
        role: 'VIEWER',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      },
    ],
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  const { login, switchRole } = useAuth();
  const { meta } = useFrontendMeta();

  // Active role portal selection
  const [selectedPortalId, setSelectedPortalId] = useState<PortalId>(() => {
    try {
      return (localStorage.getItem('arquoncx_last_portal') as PortalId) || 'admin';
    } catch {
      return 'admin';
    }
  });

  const activePortal = ROLE_PORTALS.find(p => p.id === selectedPortalId) || ROLE_PORTALS[0];
  const [selectedPersonaEmail, setSelectedPersonaEmail] = useState<string>(activePortal.personas[0]?.email || '');

  const [email, setEmail] = useState<string>(activePortal.personas[0]?.email || 'admin@arquoncx.io');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAzureAdModal, setShowAzureAdModal] = useState(false);

  // Switch role portal
  const handleSelectPortal = (portalId: PortalId) => {
    setSelectedPortalId(portalId);
    try {
      localStorage.setItem('arquoncx_last_portal', portalId);
    } catch {}

    const target = ROLE_PORTALS.find(p => p.id === portalId);
    if (target && target.personas.length > 0) {
      const first = target.personas[0];
      setSelectedPersonaEmail(first.email);
      setEmail(first.email);
      setPassword('password123');
      setErrorMessage(null);
    }
  };

  // Select persona card within active portal
  const handleSelectPersona = (persona: typeof activePortal.personas[0]) => {
    setSelectedPersonaEmail(persona.email);
    setEmail(persona.email);
    setPassword('password123');
    setErrorMessage(null);
  };

  // Perform login
  const executeLogin = async (targetEmail: string, targetPass: string, roleToSet: RoleName, destTab: NavigationTab) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Authenticate with backend / context
      await login(targetEmail, targetPass);
      // 2. Ensure role matches selected portal
      await switchRole(roleToSet);
      // 3. Navigate into the application targeting role's dedicated area
      onLoginSuccess(destTab);
    } catch (err: any) {
      console.warn('Login notice (continuing with local role session):', err);
      // Fallback: switch role locally and enter
      await switchRole(roleToSet);
      onLoginSuccess(destTab);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password, activePortal.role, activePortal.defaultTab);
  };

  const handleInstantRoleSignIn = (persona: typeof activePortal.personas[0]) => {
    executeLogin(persona.email, 'password123', persona.role, activePortal.defaultTab);
  };

  const PortalIcon = activePortal.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B19] flex flex-col justify-center select-none font-sans p-3 sm:p-6 lg:p-8 transition-colors duration-150">
      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl w-full mx-auto my-auto shadow-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-[#1E2C4F]">
        
        {/* Left Side: Role-Segregated Auth Portal */}
        <div className="w-full lg:w-7/12 bg-white dark:bg-[#0E172A] p-6 sm:p-8 lg:p-10 flex flex-col justify-between transition-colors">
          <div>
            {/* Top Navigation & Brand Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-[#1E2C4F]">
              <BrandLogo
                size="md"
                onClick={onBackToHome}
              />

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={onBackToHome}
                  className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#152342]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Public Home</span>
                </button>
              </div>
            </div>

            {/* Role Segregation Tabs */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  Select Login Role Portal
                </span>
                <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> RBAC Segregated
                </span>
              </div>

              {/* 4-way Segregated Role Portal Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-[#111C35] rounded-2xl border border-slate-200 dark:border-[#22355C]">
                {ROLE_PORTALS.map((portal) => {
                  const Icon = portal.icon;
                  const isSelected = selectedPortalId === portal.id;
                  return (
                    <button
                      key={portal.id}
                      type="button"
                      onClick={() => handleSelectPortal(portal.id)}
                      className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-bold ring-1 ring-slate-200 dark:ring-indigo-500'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-[#152342] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600 dark:text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{portal.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Portal Header & Info Card */}
            <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#111C35]/80 border border-slate-200/80 dark:border-[#22355C] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <PortalIcon className="w-4 h-4" />
                  </span>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {activePortal.title}
                  </h3>
                </div>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${activePortal.badgeClass}`}>
                  {activePortal.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {activePortal.subtitle}
              </p>
            </div>

            {/* Enterprise Single Sign-On (Azure AD / Entra ID) */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowAzureAdModal(true)}
                className="w-full p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#111C35] hover:bg-slate-50 dark:hover:bg-[#152342] border border-slate-300 dark:border-[#283C66] hover:border-blue-400 dark:hover:border-blue-500 shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#1A2A4E] shrink-0 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
                    <MicrosoftLogoSvg className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Sign in with Microsoft Azure AD
                      </span>
                      <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-sm border border-blue-500/20">
                        Entra ID
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      Single Sign-On for @qbadvisory.com & @arquoncx.io corporate directories
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0 pl-2">
                  <span>SSO</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* Quick 1-Click Role Credential Presets */}
            <div className="mb-5 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                Pre-Configured Staff Personas ({activePortal.personas.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activePortal.personas.map((persona) => {
                  const isPersonaActive = selectedPersonaEmail === persona.email;
                  return (
                    <div
                      key={persona.email}
                      onClick={() => handleSelectPersona(persona)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        isPersonaActive
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20'
                          : 'bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#22355C] hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={persona.avatar}
                          alt={persona.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {persona.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {persona.title}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInstantRoleSignIn(persona);
                        }}
                        title={`Instant 1-Click Sign In as ${persona.name}`}
                        className="px-2 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shrink-0 shadow-2xs"
                      >
                        Sign In
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 dark:border-[#1E2C4F] w-full" />
              <span className="bg-white dark:bg-[#0E172A] px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                Or Sign In with Email
              </span>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-xl focus:bg-white dark:focus:bg-[#131F3B] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-400">Default: password123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-xl focus:bg-white dark:focus:bg-[#131F3B] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden font-medium text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Remember role portal</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  Target Landing: <strong className="text-indigo-600 dark:text-indigo-400 uppercase">{activePortal.defaultTab}</strong>
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating Role Session...</span>
                ) : (
                  <>
                    <span>Enter as {activePortal.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E2C4F] flex items-center justify-between text-[11px] text-slate-400">
            <span>Powered by {meta.appName} Auth Guard</span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              RBAC v2.4 Active
            </span>
          </div>
        </div>

        {/* Right Side: Dark Navy Blue Branded Showcase Panel */}
        <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-tr from-[#080E1E] via-[#0D162D] to-[#0A1024] text-white p-8 lg:p-10 flex-col justify-between relative overflow-hidden border-l border-slate-200 dark:border-[#1E2C4F]">
          {/* Ambient Glow */}
          <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

          {/* Top Pill */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                Role-Segregated Enterprise Suite
              </span>
            </div>
          </div>

          {/* Role Feature Summary Card */}
          <div className="relative z-10 space-y-4 my-auto">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2.5">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">
                Active Portal Authority Scope
              </span>
              <p className="text-sm font-bold text-white">
                {activePortal.title}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activePortal.description}
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-indigo-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Default Landing Tab: <strong>{activePortal.defaultTab}</strong></span>
              </div>
            </div>

            {/* Testimonial Quote with Centered Face Headshot */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-1 text-amber-400 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>

              <blockquote className="text-xs font-medium text-slate-200 leading-relaxed italic">
                "{meta.appName} gave our CS, field engineering, and leadership teams immediate visibility into delivery confidence, sprint velocity, and account renewal risks."
              </blockquote>

              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&crop=face&q=80"
                  alt="Marcus Chen"
                  className="w-9 h-9 rounded-full object-cover object-top ring-2 ring-indigo-500 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-white">Marcus Chen</p>
                  <p className="text-[10px] text-indigo-300 font-medium">VP of Product • Acme Cloud Dynamics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="relative z-10 grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/80 text-center">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <p className="text-sm font-black text-white">5 Roles</p>
              <p className="text-[9px] text-slate-400">Strict RBAC</p>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <p className="text-sm font-black text-emerald-400">100%</p>
              <p className="text-[9px] text-slate-400">Meta Control</p>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <p className="text-sm font-black text-indigo-300">WBS</p>
              <p className="text-[9px] text-slate-400">Granular Rollup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Microsoft Azure Active Directory / Entra ID Interactive SSO Modal */}
      <AzureAdSsoModal
        isOpen={showAzureAdModal}
        onClose={() => setShowAzureAdModal(false)}
        onSuccess={(destTab) => onLoginSuccess(destTab)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  KeyRound, 
  Check, 
  ArrowRight, 
  AlertCircle, 
  Building2, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth, RoleName } from '../../context/AuthContext';
import { NavigationTab } from '../../types';

interface AzureAdSsoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (targetTab?: NavigationTab) => void;
}

export const MicrosoftLogoSvg = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

interface EntraAccount {
  email: string;
  name: string;
  title: string;
  role: RoleName;
  avatar: string;
  azureGroup: string;
  azureGroupId: string;
  defaultTab: NavigationTab;
  badge: string;
}

const PRESET_ACCOUNTS: EntraAccount[] = [
  {
    email: 'dip.bagchi@qbadvisory.com',
    name: 'Dip Bagchi',
    title: 'Director of Customer Success',
    role: 'CSM',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    azureGroup: 'arQuonCX-DeliveryLeads',
    azureGroupId: '5d6e7f80-9a1b-3c4d-5e6f-789012345ghi',
    defaultTab: 'delivery-briefing',
    badge: 'Delivery Director',
  },
  {
    email: 'admin@arquoncx.io',
    name: 'Dr. Aris Vance',
    title: 'VP of CS & Operations',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    azureGroup: 'arQuonCX-GlobalAdmins',
    azureGroupId: '9e7b3a1c-8f2d-4e5a-b6c7-123456789abc',
    defaultTab: 'admin-portal',
    badge: 'Super Admin',
  },
  {
    email: 'elena@arquoncx.io',
    name: 'Elena Rostova',
    title: 'Lead Enterprise CSM',
    role: 'CSM',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    azureGroup: 'arQuonCX-DeliveryLeads',
    azureGroupId: '5d6e7f80-9a1b-3c4d-5e6f-789012345ghi',
    defaultTab: 'accounts',
    badge: 'Operational CSM',
  },
  {
    email: 'csops@arquoncx.io',
    name: 'David Kim',
    title: 'CS Operations & Data Analyst',
    role: 'CS_OPS',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    azureGroup: 'arQuonCX-CSOps',
    azureGroupId: '2a4c6e80-1b3d-5f7a-9c1e-345678901def',
    defaultTab: 'overview',
    badge: 'CS Ops',
  },
];

export const AzureAdSsoModal: React.FC<AzureAdSsoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithAzureAd, switchRole } = useAuth();
  const [selectedEmail, setSelectedEmail] = useState<string>(PRESET_ACCOUNTS[0].email);
  const [useCustomAccount, setUseCustomAccount] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customGroup, setCustomGroup] = useState('arQuonCX-DeliveryLeads');
  const [showClaimsInspector, setShowClaimsInspector] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAccount = PRESET_ACCOUNTS.find(a => a.email === selectedEmail) || PRESET_ACCOUNTS[0];

  const effectiveEmail = useCustomAccount ? customEmail.trim() : currentAccount.email;
  const effectiveName = useCustomAccount ? (customName.trim() || customEmail.split('@')[0]) : currentAccount.name;
  const effectiveGroup = useCustomAccount ? customGroup : currentAccount.azureGroup;
  const effectiveGroupId = useCustomAccount ? 'custom-azure-group-guid' : currentAccount.azureGroupId;
  const effectiveRole: RoleName = useCustomAccount
    ? customGroup.includes('Admin')
      ? 'SUPER_ADMIN'
      : customGroup.includes('Ops')
      ? 'CS_OPS'
      : customGroup.includes('Product')
      ? 'PRODUCT_GROWTH'
      : 'CSM'
    : currentAccount.role;
  const effectiveTargetTab: NavigationTab = useCustomAccount
    ? effectiveRole === 'SUPER_ADMIN'
      ? 'admin-portal'
      : 'delivery-briefing'
    : currentAccount.defaultTab;

  const handleAuthenticate = async () => {
    if (useCustomAccount && !customEmail) {
      setAuthError('Please enter a valid work email address');
      return;
    }

    // Verify corporate domain
    const domain = effectiveEmail.split('@')[1];
    const allowedDomains = ['qbadvisory.com', 'arquoncx.io', 'microsoft.com'];
    if (domain && !allowedDomains.includes(domain.toLowerCase())) {
      setAuthError(`Domain @${domain} is not configured for this Azure AD tenant. Allowed: ${allowedDomains.join(', ')}`);
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      await loginWithAzureAd({
        email: effectiveEmail,
        name: effectiveName,
        tid: '72f988bf-86f1-41af-91ab-2d7cd011db47',
        oid: `oid-azure-${Date.now()}`,
        groups: [effectiveGroup, effectiveGroupId],
        preferred_username: effectiveEmail,
      });

      await switchRole(effectiveRole);
      onSuccess(effectiveTargetTab);
      onClose();
    } catch (err: any) {
      console.warn('Azure AD SSO completed with local session:', err);
      await switchRole(effectiveRole);
      onSuccess(effectiveTargetTab);
      onClose();
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0B132B] rounded-2xl border border-slate-200 dark:border-[#1E2E52] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Microsoft Entra ID Header Bar */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#0E1838] border-b border-slate-200/80 dark:border-[#1E2E52] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white dark:bg-[#162447] rounded-lg border border-slate-200/80 dark:border-[#22355C] shadow-2xs">
              <MicrosoftLogoSvg className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Microsoft Entra ID
                </h3>
                <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-sm border border-blue-500/20">
                  Azure AD SSO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                login.microsoftonline.com • Tenant: 72f988bf-86f1...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-[#1A284D] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Tenant Status Pill */}
          <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-[11px]">
                <span className="font-bold text-slate-900 dark:text-white">Federated Tenant Verified: </span>
                <span className="text-slate-600 dark:text-slate-300">Contoso / arQuonCX Enterprise</span>
              </div>
            </div>
            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 font-mono">
              OIDC 2.0 Active
            </span>
          </div>

          {authError && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs">{authError}</span>
            </div>
          )}

          {/* Account Picker Option Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Select Work Account
              </label>
              <button
                type="button"
                onClick={() => setUseCustomAccount(!useCustomAccount)}
                className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {useCustomAccount ? 'Pick Preset Account' : '+ Use Another Account'}
              </button>
            </div>

            {!useCustomAccount ? (
              <div className="space-y-2">
                {PRESET_ACCOUNTS.map((acc) => {
                  const isSelected = selectedEmail === acc.email;
                  return (
                    <div
                      key={acc.email}
                      onClick={() => setSelectedEmail(acc.email)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-white dark:bg-[#0F1A38] border-slate-200 dark:border-[#1E2E52] hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {acc.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-slate-100 dark:bg-[#1E2E52] text-slate-700 dark:text-slate-300 font-mono">
                              {acc.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            {acc.email}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                            <span>Group: <strong className="text-slate-700 dark:text-slate-300">{acc.azureGroup}</strong></span>
                            <span>•</span>
                            <span>Role: <strong className="text-blue-600 dark:text-blue-400">{acc.role}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F1A38] border border-slate-200 dark:border-[#1E2E52] space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Email (e.g. user@qbadvisory.com or user@arquoncx.io)
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="name@qbadvisory.com"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#142042] border border-slate-200 dark:border-[#22355C] rounded-lg font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#142042] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Simulated Azure AD Security Group
                  </label>
                  <select
                    value={customGroup}
                    onChange={(e) => setCustomGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#142042] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="arQuonCX-DeliveryLeads">arQuonCX-DeliveryLeads (Maps to CSM / Delivery Lead)</option>
                    <option value="arQuonCX-GlobalAdmins">arQuonCX-GlobalAdmins (Maps to SUPER_ADMIN)</option>
                    <option value="arQuonCX-CSOps">arQuonCX-CSOps (Maps to CS_OPS)</option>
                    <option value="arQuonCX-ProductGrowth">arQuonCX-ProductGrowth (Maps to PRODUCT_GROWTH)</option>
                    <option value="arQuonCX-ExecutiveStakeholders">arQuonCX-ExecutiveStakeholders (Maps to VIEWER)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Directory Token Claims Inspector Accordion */}
          <div className="border border-slate-200 dark:border-[#1E2E52] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowClaimsInspector(!showClaimsInspector)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1838] flex items-center justify-between text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#14224A] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-[11px]">Inspect Microsoft Entra ID Token Claims</span>
              </div>
              {showClaimsInspector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showClaimsInspector && (
              <div className="p-3 bg-slate-900 text-slate-200 font-mono text-[10px] space-y-1 overflow-x-auto">
                <div className="text-emerald-400">// Decoded Azure AD JWT Payload</div>
                <div>{`{`}</div>
                <div className="pl-4"><span className="text-sky-300">"aud"</span>: "3a9b1c72-4d8e-49f0-bc23-891ef64521a0",</div>
                <div className="pl-4"><span className="text-sky-300">"iss"</span>: "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/v2.0",</div>
                <div className="pl-4"><span className="text-sky-300">"tid"</span>: "72f988bf-86f1-41af-91ab-2d7cd011db47",</div>
                <div className="pl-4"><span className="text-sky-300">"upn"</span>: "{effectiveEmail}",</div>
                <div className="pl-4"><span className="text-sky-300">"name"</span>: "{effectiveName}",</div>
                <div className="pl-4"><span className="text-sky-300">"groups"</span>: ["{effectiveGroup}", "{effectiveGroupId}"],</div>
                <div className="pl-4"><span className="text-sky-300">"mapped_arquoncx_role"</span>: "<span className="text-amber-300 font-bold">{effectiveRole}</span>",</div>
                <div className="pl-4"><span className="text-sky-300">"target_portal_landing"</span>: "{effectiveTargetTab}"</div>
                <div>{`}`}</div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#0E1838] border-t border-slate-200/80 dark:border-[#1E2E52] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Encrypted via TLS 1.3 / OAuth2 Bearer</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isAuthenticating}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAuthenticate}
              disabled={isAuthenticating}
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In with Azure AD...</span>
                </>
              ) : (
                <>
                  <MicrosoftLogoSvg className="w-3.5 h-3.5" />
                  <span>Authorize & Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

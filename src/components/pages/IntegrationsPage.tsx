import React, { useState } from 'react';
import { 
  Plug, 
  Code2, 
  Copy, 
  Check, 
  RefreshCw, 
  CheckCircle2, 
  Users, 
  ShieldCheck, 
  ExternalLink,
  Plus,
  Radio,
  Lock
} from 'lucide-react';
import { Integration } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { PermissionGate } from '../common/PermissionGate';

interface IntegrationsPageProps {
  integrations: Integration[];
  onToggleIntegration: (id: string) => void;
}

export const IntegrationsPage: React.FC<IntegrationsPageProps> = ({
  integrations,
  onToggleIntegration,
}) => {
  const { can, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'catalog' | 'sdk' | 'team'>('catalog');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(true);

  const sdkCode = `<script>
  (function(u,p,o,r,t){
    u[r]=u[r]||function(){(u[r].q=u[r].q||[]).push(arguments)};
    var s=p.createElement(o);s.async=1;s.src="https://cdn.arquoncx.io/sdk/v3.4/tracker.min.js";
    var h=p.getElementsByTagName(o)[0];h.parentNode.insertBefore(s,h);
  })(window,document,'script','arquon');

  // Initialize with your workspace key
  arquon('init', 'app_live_839a9c2b9f0291e03');
  
  // Identify currently logged in customer
  arquon('identify', currentUser.id, {
    name: currentUser.name,
    email: currentUser.email,
    company_id: currentAccount.id,
    company_name: currentAccount.name,
    plan: currentAccount.plan,
    mrr: currentAccount.mrr
  });
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sdkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifySuccess(true);
    }, 1200);
  };

  const teamMembers = [
    { name: 'Elena Rostova', email: 'elena@arquoncx.io', role: 'Lead CSM (Admin)', accounts: 18 },
    { name: 'Liam Vance', email: 'liam@arquoncx.io', role: 'Enterprise CSM', accounts: 12 },
    { name: 'Rachel Green', email: 'rachel@arquoncx.io', role: 'Growth Specialist', accounts: 11 },
    { name: 'David Kim', email: 'david@arquoncx.io', role: 'CS Operations & Data Analyst', accounts: 'Global' }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Integrations, Tracking SDK & Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Connect your CRM, data lakes, notification channels, and copy the tracking snippet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sdk')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Install SDK Snippet</span>
          </button>
        </div>
      </div>

      {!can('integrations:manage') && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Administrative Restricted Mode: </span>
            Your active role <span className="font-mono font-semibold">({role})</span> is in read-only mode for Integrations & Webhooks. Connecting or modifying pipelines requires <span className="font-semibold">Super Admin</span> or <span className="font-semibold">CS Operations</span>.
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#1E2D52]">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'catalog' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Plug className="w-3.5 h-3.5" />
          <span>Integrations ({integrations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sdk')}
          className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'sdk' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Tracking SDK</span>
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'team' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>CS Team & Roles</span>
        </button>
      </div>

      {/* Tab 1: Integrations Directory */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {integrations.map((item) => (
            <div 
              key={item.id} 
              className="p-3.5 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h3>
                      <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                    item.status === 'connected' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {item.status === 'connected' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    {item.status === 'connected' ? 'Connected' : 'Available'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  {item.description}
                </p>

                {item.eventCount && (
                  <div className="p-2 bg-slate-50 dark:bg-[#111C35] rounded-lg border border-slate-100 dark:border-[#1E2D52] text-[10px] text-slate-600 dark:text-slate-400 font-mono mb-2.5">
                    {item.eventCount} • Last sync: {item.lastSync}
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-slate-100 dark:border-[#1E2D52] flex items-center justify-between text-xs">
                <PermissionGate permission="integrations:manage" showDisabledTooltip>
                  <button
                    onClick={() => onToggleIntegration(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      item.status === 'connected' 
                        ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {item.status === 'connected' ? 'Configure Sync' : 'Connect'}
                  </button>
                </PermissionGate>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                  Docs →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: JavaScript SDK & Verification */}
      {activeTab === 'sdk' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Universal JavaScript Snippet
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Include this tag right before the closing &lt;/head&gt; tag of your web application.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg hover:bg-slate-50 dark:hover:bg-[#152342] text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 text-indigo-600 dark:text-indigo-400 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>{isVerifying ? 'Verifying...' : 'Verify Installation'}</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Code Block */}
            <div className="p-3 bg-slate-900 rounded-lg text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              <pre>{sdkCode}</pre>
            </div>

            {verifySuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>SDK Status: Verified & Receiving Telemetry</span>
                </div>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[10px]">
                  Last Ping: 4 seconds ago
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: CS Team & Roles */}
      {activeTab === 'team' && (
        <div className="bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-[#1E2D52] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Customer Success Team</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage account assignments and permissions.</p>
            </div>
            <button 
              onClick={() => alert('Invite team member dialog')}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Invite CSM
            </button>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#111C35] border-b border-slate-200 dark:border-[#1E2D52] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3.5">Name & Email</th>
                <th className="py-2.5 px-3.5">Role</th>
                <th className="py-2.5 px-3.5">Assigned Accounts</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E2D52] text-slate-700 dark:text-slate-200">
              {teamMembers.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-[#131F3B]">
                  <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">
                    {m.name}
                    <span className="text-slate-400 font-normal text-[10px] block">{m.email}</span>
                  </td>
                  <td className="py-2.5 px-3.5">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded text-[10px]">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 font-semibold font-mono text-slate-800 dark:text-slate-200">
                    {m.accounts} {typeof m.accounts === 'number' ? 'accounts' : ''}
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <button className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer text-xs">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

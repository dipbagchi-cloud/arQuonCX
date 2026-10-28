import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  ChevronRight, 
  Download, 
  UserPlus, 
  Sparkles,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Account, HealthTier, PlanTier } from '../../types';
import { HealthBadge, PlanBadge } from '../common/Badge';
import { PermissionGate } from '../common/PermissionGate';

interface AccountsPageProps {
  accounts: Account[];
  onSelectAccount: (account: Account) => void;
  onTriggerFlow: (accountId: string) => void;
}

export const AccountsPage: React.FC<AccountsPageProps> = ({
  accounts,
  onSelectAccount,
  onTriggerFlow,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [healthFilter, setHealthFilter] = useState<'all' | HealthTier>('all');
  const [planFilter, setPlanFilter] = useState<'all' | PlanTier>('all');

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          acc.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          acc.csmName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHealth = healthFilter === 'all' || acc.healthTier === healthFilter;
    const matchesPlan = planFilter === 'all' || acc.plan === planFilter;
    return matchesSearch && matchesHealth && matchesPlan;
  });

  const totalARR = accounts.reduce((acc, a) => acc + a.arr, 0);
  const atRiskARR = accounts.filter(a => a.healthTier === 'at-risk').reduce((acc, a) => acc + a.arr, 0);
  const avgHealth = Math.round(accounts.reduce((acc, a) => acc + a.healthScore, 0) / accounts.length);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Enterprise Accounts (Customer CRM 360°)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor account health scores, ARR exposure, seat license utilization, and upcoming renewals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PermissionGate permission="analytics:export" showDisabledTooltip>
            <button
              onClick={() => alert('Exporting Accounts CSV...')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg hover:bg-slate-50 dark:hover:bg-[#152342] transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Export CSV</span>
            </button>
          </PermissionGate>

          <PermissionGate permission="account:write" showDisabledTooltip>
            <button
              onClick={() => alert('Add Account integration with Salesforce / HubSpot is active.')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sync Account</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Account Highlights Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Accounts</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">{accounts.length}</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">100% telemetry synced</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Managed ARR</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">${(totalARR / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+14% YoY Expansion</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Health</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">{avgHealth} / 100</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Strong adoption baseline</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">At-Risk Exposure</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">${(atRiskARR / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">{accounts.filter(a => a.healthTier === 'at-risk').length} accounts require check-in</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-2.5 sm:p-3 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="w-full md:w-72 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, domain, or CSM..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#111C35] rounded-lg border border-slate-200 dark:border-[#22355C] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#131F3B] focus:border-indigo-500 outline-hidden"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Health Tier Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-[#111C35] p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setHealthFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${healthFilter === 'all' ? 'bg-white dark:bg-[#182647] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
            >
              All Health
            </button>
            <button
              onClick={() => setHealthFilter('healthy')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${healthFilter === 'healthy' ? 'bg-white dark:bg-[#182647] text-emerald-700 dark:text-emerald-300 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
            >
              Healthy
            </button>
            <button
              onClick={() => setHealthFilter('neutral')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${healthFilter === 'neutral' ? 'bg-white dark:bg-[#182647] text-amber-700 dark:text-amber-300 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
            >
              Moderate
            </button>
            <button
              onClick={() => setHealthFilter('at-risk')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${healthFilter === 'at-risk' ? 'bg-white dark:bg-[#182647] text-rose-700 dark:text-rose-300 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
            >
              At Risk
            </button>
          </div>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as any)}
            className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer"
          >
            <option value="all">All Plans</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Scale">Scale</option>
            <option value="Starter">Starter</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#111C35] border-b border-slate-200/80 dark:border-[#1E2D52] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3.5">Account Name</th>
                <th className="py-2.5 px-3.5">Health Score</th>
                <th className="py-2.5 px-3.5">ARR Value</th>
                <th className="py-2.5 px-3.5">Seat License</th>
                <th className="py-2.5 px-3.5">Assigned CSM</th>
                <th className="py-2.5 px-3.5">Renewal Date</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E2D52] text-slate-700 dark:text-slate-200">
              {filteredAccounts.map((account) => {
                const seatPercent = Math.round((account.seatsUsed / account.seatsTotal) * 100);
                return (
                  <tr
                    key={account.id}
                    onClick={() => onSelectAccount(account)}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#131F3B] transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#152342] border border-slate-200 dark:border-[#22355C] flex items-center justify-center text-sm shrink-0">
                          {account.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {account.name}
                            </span>
                            <PlanBadge plan={account.plan} />
                          </div>
                          <span className="text-slate-400 text-[10px]">{account.domain}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5">
                      <HealthBadge score={account.healthScore} tier={account.healthTier} size="sm" />
                    </td>

                    <td className="py-2.5 px-3.5 font-bold font-mono text-slate-900 dark:text-white">
                      ${(account.arr / 1000).toFixed(0)}k
                      <span className="text-[10px] text-slate-400 font-normal font-sans block">
                        ${account.mrr.toLocaleString()}/mo
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 min-w-[120px]">
                      <div className="flex justify-between text-[10px] mb-1 font-medium text-slate-600 dark:text-slate-300">
                        <span>{account.seatsUsed} / {account.seatsTotal}</span>
                        <span className={seatPercent >= 90 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}>
                          {seatPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-[#152342] rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${seatPercent >= 90 ? 'bg-indigo-600' : 'bg-slate-400 dark:bg-slate-500'}`}
                          style={{ width: `${seatPercent}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={account.csmAvatar}
                          alt={account.csmName}
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">{account.csmName}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-white text-xs">{account.renewalDate}</span>
                        <span className={`text-[10px] font-semibold ${account.daysToRenewal < 30 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                          {account.daysToRenewal}d remaining
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <PermissionGate permission="flow:write" showDisabledTooltip>
                          <button
                            onClick={() => onTriggerFlow(account.id)}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-[#131F3B] rounded-md transition-colors"
                            title="Deploy In-App Flow"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </PermissionGate>
                        <button
                          onClick={() => onSelectAccount(account)}
                          className="px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131F3B] rounded-md transition-colors"
                        >
                          View 360 →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAccounts.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <Building2 className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
            <p className="text-xs font-semibold">No accounts found matching filter criteria.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try resetting search keywords or health filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

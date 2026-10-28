import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Layers, 
  Sparkles, 
  ArrowUpDown, 
  UserCheck, 
  Clock, 
  CheckCircle2,
  Tag
} from 'lucide-react';
import { User, HealthTier } from '../../types';
import { HealthBadge } from '../common/Badge';
import { PermissionGate } from '../common/PermissionGate';

interface UsersPageProps {
  users: User[];
  onOpenCreateSegment: () => void;
  onTriggerFlowToUser?: (userId: string) => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({
  users,
  onOpenCreateSegment,
  onTriggerFlowToUser,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'segments'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSegmentFilter, setActiveSegmentFilter] = useState<string>('All');

  const segmentPills = [
    'All',
    'Power User',
    'At-Risk Churn',
    'Stalled Onboarding',
    'NPS Promoter',
    'Flow Creator'
  ];

  const savedSegments = [
    {
      id: 'seg-1',
      name: 'Power Users (Highly Engaged)',
      criteria: 'Sessions > 30 in 30d AND Feature Adoption > 10',
      userCount: 2410,
      flowsActive: 2,
      created: 'Aug 10, 2026'
    },
    {
      id: 'seg-2',
      name: 'At-Risk Churn (Dormant Users)',
      criteria: 'Last Seen > 7 days ago AND Health Score < 50',
      userCount: 380,
      flowsActive: 1,
      created: 'Sep 02, 2026'
    },
    {
      id: 'seg-3',
      name: 'Stalled Onboarding Milestones',
      criteria: 'Signed up in last 14d AND Checklist completed < 50%',
      userCount: 620,
      flowsActive: 3,
      created: 'Sep 15, 2026'
    },
    {
      id: 'seg-4',
      name: 'Enterprise Executive Sponsors',
      criteria: 'Role contains VP/Head/Director AND Plan = Enterprise',
      userCount: 142,
      flowsActive: 1,
      created: 'Oct 01, 2026'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.accountName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = activeSegmentFilter === 'All' || user.segmentTags.includes(activeSegmentFilter);
    return matchesSearch && matchesSegment;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Users & Behavioral Audiences
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Segment end-users by product usage telemetry, adoption milestones, and health attributes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PermissionGate permission="flow:write" showDisabledTooltip>
            <button
              onClick={onOpenCreateSegment}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Smart Segment</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#1E2D52]">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'users' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Directory ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('segments')}
          className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'segments' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Saved Segments ({savedSegments.length})</span>
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-3">
          {/* Segment Filter Pills & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {segmentPills.map((pill) => (
                <button
                  key={pill}
                  onClick={() => setActiveSegmentFilter(pill)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeSegmentFilter === pill 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152342]'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>

            <div className="w-full md:w-64 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user, email, company..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#111C35] rounded-lg border border-slate-200 dark:border-[#22355C] text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-hidden"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#111C35] border-b border-slate-200/80 dark:border-[#1E2D52] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3.5">User</th>
                    <th className="py-2.5 px-3.5">Account & Plan</th>
                    <th className="py-2.5 px-3.5">Health</th>
                    <th className="py-2.5 px-3.5">Last Active</th>
                    <th className="py-2.5 px-3.5">Sessions (30d)</th>
                    <th className="py-2.5 px-3.5">Features</th>
                    <th className="py-2.5 px-3.5">Segments</th>
                    <th className="py-2.5 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E2D52] text-slate-700 dark:text-slate-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-[#131F3B] transition-colors">
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs">{user.name}</p>
                            <p className="text-[10px] text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{user.accountName}</p>
                        <p className="text-[10px] text-slate-400">{user.role}</p>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <HealthBadge score={user.healthScore} tier={user.healthTier} size="sm" />
                      </td>

                      <td className="py-2.5 px-3.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">{user.lastSeen}</span>
                      </td>

                      <td className="py-2.5 px-3.5 font-bold font-mono text-slate-900 dark:text-white">
                        {user.totalSessions} <span className="text-[10px] font-normal text-slate-400">sess</span>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-1">
                          <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{user.featureAdoptionCount}</span>
                          <span className="text-slate-400 text-[10px]">/ 25</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <div className="flex flex-wrap gap-1">
                          {user.segmentTags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-[9px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          onClick={() => {
                            if (onTriggerFlowToUser) onTriggerFlowToUser(user.id);
                            alert(`Targeting in-app experience to ${user.name}`);
                          }}
                          className="px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-[#131F3B] rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          Target Flow
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'segments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {savedSegments.map((seg) => (
            <div key={seg.id} className="p-4 bg-white dark:bg-[#0E162E] rounded-xl border border-slate-200/80 dark:border-[#1E2D52] shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{seg.name}</h3>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900">
                    {seg.userCount.toLocaleString()} Users
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-[#111C35] p-2 rounded-lg border border-slate-200 dark:border-[#22355C] mb-2.5">
                  {seg.criteria}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> {seg.flowsActive} Flows Active
                  </span>
                  <span>•</span>
                  <span>Created {seg.created}</span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-[#1E2D52] flex items-center justify-between">
                <button 
                  onClick={() => {
                    setActiveSegmentFilter(seg.name.split(' ')[0]);
                    setActiveTab('users');
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  View Matched Users →
                </button>
                <button
                  onClick={() => alert(`Launching flow targeting "${seg.name}"`)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  Target Experience
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

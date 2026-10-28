import React, { useState } from 'react';
import { 
  X, 
  Check, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  User, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  Briefcase
} from 'lucide-react';
import { 
  DeliveryProject, 
  WbsTask, 
  WbsAssignee, 
  WbsTaskPriority, 
  WbsTaskStatus 
} from '../../types';
import { MOCK_WBS_ASSIGNEE_LIST } from '../../data/mockWbsData';

interface CreateWbsTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask?: (task: Partial<WbsTask>) => void;
  onSaveTask?: (task: Partial<WbsTask>) => void;
  projects: DeliveryProject[];
  assignees?: WbsAssignee[];
  defaultProjectId?: string;
}

const PHASES = [
  'Phase 0: Scoping & Architecture',
  'Phase 1: Environment & SSO Setup',
  'Phase 2: Data Pipeline & Ingestion',
  'Phase 3: AI Model Config & Testing',
  'Phase 4: UAT & Client Validation',
  'Phase 5: Production Go-Live',
  'Phase 6: Hypercare & Handover'
];

export const CreateWbsTaskModal: React.FC<CreateWbsTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  onSaveTask,
  projects,
  assignees = MOCK_WBS_ASSIGNEE_LIST,
  defaultProjectId,
}) => {
  if (!isOpen) return null;

  const initialProjId = defaultProjectId || (projects.length > 0 ? projects[0].id : '');
  const [projectId, setProjectId] = useState(initialProjId);
  const [phase, setPhase] = useState(PHASES[1]);
  const [workPackage, setWorkPackage] = useState('Integration & Data');
  const [taskName, setTaskName] = useState('');
  const [assigneeId, setAssigneeId] = useState(assignees[0]?.id || 'usr-dip');
  const [priority, setPriority] = useState<WbsTaskPriority>('medium');
  const [status, setStatus] = useState<WbsTaskStatus>('not-started');
  const [estimatedHours, setEstimatedHours] = useState(16);
  const [actualHours, setActualHours] = useState(0);
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [isMilestone, setIsMilestone] = useState(false);
  const [isCriticalPath, setIsCriticalPath] = useState(false);
  const [blockerNote, setBlockerNote] = useState('');
  const [tagsInput, setTagsInput] = useState('Core, Setup');

  const selectedProject = projects.find(p => p.id === projectId);
  const selectedAssignee = assignees.find(a => a.id === assigneeId) || assignees[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const taskPayload: Partial<WbsTask> = {
      projectId,
      phase,
      workPackage,
      taskName: taskName.trim(),
      assignedUser: selectedAssignee,
      priority,
      status,
      estimatedHours: Number(estimatedHours) || 8,
      actualHours: Number(actualHours) || 0,
      progress: status === 'completed' ? 100 : Number(progress) || 0,
      plannedStart: startDate,
      plannedFinish: dueDate,
      isMilestone,
      isCriticalPath,
      blockerNote: status === 'blocked' ? blockerNote : undefined,
    };

    if (onSaveTask) {
      onSaveTask(taskPayload);
    } else if (onCreateTask) {
      onCreateTask(taskPayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0E162E] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E2D52] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1E2D52] flex items-center justify-between bg-slate-50/70 dark:bg-[#111C35]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Log New WBS Deliverable / Deployment Task
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Granular work package tracked for team velocity, confidence, and executive reporting.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-[#1E2D52] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Target Client Project & Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Project *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-indigo-500 outline-hidden"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.accountName} ({p.plan})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lifecycle Phase *
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-indigo-500 outline-hidden"
              >
                {PHASES.map((ph) => (
                  <option key={ph} value={ph}>
                    {ph}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Work Package & Task Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work Package
              </label>
              <input
                type="text"
                value={workPackage}
                onChange={(e) => setWorkPackage(e.target.value)}
                placeholder="e.g. Identity & Security"
                className="w-full px-3 py-2 bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-slate-100 outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Task / Deliverable Name *
              </label>
              <input
                type="text"
                required
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g. Configure Okta SAML 2.0 & SCIM User Provisioning"
                className="w-full px-3 py-2 bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-slate-100 outline-hidden focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Assignee, Priority, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Owner / Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-slate-100 outline-hidden focus:border-indigo-500"
              >
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as WbsTaskPriority)}
                className="w-full px-3 py-2 bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-slate-100 outline-hidden focus:border-indigo-500"
              >
                <option value="critical">Critical (P0)</option>
                <option value="high">High (P1)</option>
                <option value="medium">Medium (P2)</option>
                <option value="low">Low (P3)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value as WbsTaskStatus;
                  setStatus(val);
                  if (val === 'completed') setProgress(100);
                }}
                className="w-full px-3 py-2 bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-slate-100 outline-hidden focus:border-indigo-500"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Under Review / QA</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Effort & Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-slate-100 outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Actual Hours Burned
              </label>
              <input
                type="number"
                min="0"
                max="500"
                value={actualHours}
                onChange={(e) => setActualHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-slate-100 outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Progress ({progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-indigo-600 mt-2"
              />
            </div>
          </div>

          {/* Start and Due Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-slate-100 outline-hidden font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-slate-100 outline-hidden font-mono text-xs"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deliverable Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. SSO, Security, Ingestion"
              className="w-full px-3 py-2 bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-lg text-slate-900 dark:text-slate-100 outline-hidden text-xs"
            />
          </div>

          {/* Checkboxes: Critical Path and Key Milestone */}
          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isCriticalPath}
                onChange={(e) => setIsCriticalPath(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Critical Path Deliverable</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isMilestone}
                onChange={(e) => setIsMilestone(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Key Contractual Milestone</span>
            </label>
          </div>

          {/* Blocker Note (conditional on status === 'blocked') */}
          {status === 'blocked' && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-1.5">
              <label className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Root Cause Blocker & Resolution Needed
              </label>
              <textarea
                rows={2}
                value={blockerNote}
                onChange={(e) => setBlockerNote(e.target.value)}
                placeholder="Explain why this task is blocked and what action is required from client or leadership..."
                className="w-full p-2 text-xs rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-[#111C35] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
              />
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-[#1E2D52] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E2D52] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create WBS Deliverable</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  Filter, 
  Plus, 
  Trash2, 
  Users, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface CreateSegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSegment?: (segmentName: string) => void;
}

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export const CreateSegmentModal: React.FC<CreateSegmentModalProps> = ({
  isOpen,
  onClose,
  onSaveSegment,
}) => {
  const [segmentName, setSegmentName] = useState('Power Users & Expansion Prospects');
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', field: 'healthScore', operator: 'greater_than', value: '80' },
    { id: '2', field: 'sessions30d', operator: 'greater_than', value: '30' },
    { id: '3', field: 'planTier', operator: 'equals', value: 'Enterprise' },
  ]);

  const addRule = () => {
    setRules([...rules, { id: String(Date.now()), field: 'lastActive', operator: 'less_than_days', value: '7' }]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleSave = () => {
    if (onSaveSegment && segmentName) {
      onSaveSegment(segmentName);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title="Create Smart User & Account Segment"
      description="Define granular behavioral and demographic criteria for personalized in-app targeting."
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/60">
            <Users className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">Audience Estimate: 1,840 users (4 accounts)</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Save Smart Segment
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Segment Name
          </label>
          <input
            type="text"
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-[#1E2D52] dark:bg-[#0A1024] dark:text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Filter Criteria (Match ALL conditions)
            </span>
            <button
              type="button"
              onClick={addRule}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Condition
            </button>
          </div>

          <div className="space-y-2">
            {rules.map((rule, index) => (
              <div key={rule.id} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-[#1E2D52] bg-slate-50/50 dark:bg-[#0A1024]">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-8 text-center shrink-0">
                  {index === 0 ? 'WHERE' : 'AND'}
                </span>

                <select
                  value={rule.field}
                  onChange={(e) => {
                    const newField = e.target.value;
                    setRules(rules.map(r => r.id === rule.id ? { ...r, field: newField } : r));
                  }}
                  className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-[#0E162E] dark:text-white border border-slate-200 dark:border-[#1E2D52] rounded-lg outline-hidden"
                >
                  <option value="healthScore">Health Score</option>
                  <option value="sessions30d">Total Sessions (30d)</option>
                  <option value="planTier">Account Plan Tier</option>
                  <option value="lastActive">Last Active</option>
                  <option value="featureAdoption">Core Features Adopted</option>
                </select>

                <select
                  value={rule.operator}
                  onChange={(e) => {
                    const newOp = e.target.value;
                    setRules(rules.map(r => r.id === rule.id ? { ...r, operator: newOp } : r));
                  }}
                  className="w-32 px-2.5 py-1 text-xs bg-white dark:bg-[#0E162E] dark:text-white border border-slate-200 dark:border-[#1E2D52] rounded-lg outline-hidden"
                >
                  <option value="equals">is equal to</option>
                  <option value="greater_than">is greater than</option>
                  <option value="less_than">is less than</option>
                  <option value="less_than_days">within last (days)</option>
                </select>

                <input
                  type="text"
                  value={rule.value}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    setRules(rules.map(r => r.id === rule.id ? { ...r, value: newVal } : r));
                  }}
                  className="w-24 px-2.5 py-1 text-xs bg-white dark:bg-[#0E162E] dark:text-white border border-slate-200 dark:border-[#1E2D52] rounded-lg outline-hidden font-mono"
                />

                <button
                  type="button"
                  onClick={() => removeRule(rule.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

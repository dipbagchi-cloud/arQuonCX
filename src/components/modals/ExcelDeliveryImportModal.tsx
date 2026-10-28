import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ArrowRight, 
  Database, 
  Info,
  ShieldCheck,
  Building2,
  Trash2,
  Check
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ProjectLogo } from '../common/ProjectLogo';
import { DeliveryProject, DeliveryHealthStatus, DeliveryPhase, PlanTier } from '../../types';

interface ExcelDeliveryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (projects: DeliveryProject[], mode: 'replace' | 'merge') => Promise<void> | void;
}

// Sample template rows
const SAMPLE_TEMPLATE_ROWS = [
  {
    'Account Name': 'SHPL',
    'Domain': 'qgpt.saswanehabitats.com',
    'Plan Tier': 'Enterprise',
    'Contract ARR': 1500000,
    'Phase': 'Phase A: Knowledge Layer',
    'Progress %': 100,
    'Health Status': 'on-track',
    'Baseline Target Date': '2026-11-20',
    'Delivery Lead': 'Shubham',
    'Delivery Lead Title': 'FDE',
    'CSM Name': 'Dip',
    'Client Sponsor': 'Sarv',
    'Client Sponsor Email': 'sarv@saswanehabitats.com',
    'Current Blocker': '',
    'C-Suite Action Needed': 'To decide implementation plan for Phase B',
    'Hours Allocated': 200,
    'Hours Burned': 225,
    'Daily Standup Note': 'Phase A delivered and verified. Ready for Phase B kickoff.'
  },
  {
    'Account Name': 'Arcelor Mittal H&S',
    'Domain': 'hsqgptpoc.arcelormittal.com',
    'Plan Tier': 'Enterprise',
    'Contract ARR': 10000,
    'Phase': 'Phase 1: Health & Safety Audit',
    'Progress %': 95,
    'Health Status': 'on-track',
    'Baseline Target Date': '2026-12-05',
    'Delivery Lead': 'Trevor',
    'Delivery Lead Title': 'FDE',
    'CSM Name': 'Dip',
    'Client Sponsor': 'Gustavo',
    'Client Sponsor Email': 'gustavo@arcelormittal.com',
    'Current Blocker': '',
    'C-Suite Action Needed': 'Current status of the project is unknown - schedule sync',
    'Hours Allocated': 240,
    'Hours Burned': 250,
    'Daily Standup Note': 'Audit testing 95% complete. Awaiting final executive signoff.'
  },
  {
    'Account Name': 'Indorama Corp',
    'Domain': 'qgpt.indorama.com',
    'Plan Tier': 'Scale',
    'Contract ARR': 0,
    'Phase': 'Phase 1: Finance Ops',
    'Progress %': 80,
    'Health Status': 'at-risk',
    'Baseline Target Date': '2026-11-12',
    'Delivery Lead': 'Dip',
    'Delivery Lead Title': 'FDE',
    'CSM Name': 'Dip',
    'Client Sponsor': 'Rohit',
    'Client Sponsor Email': 'rohit@indorama.com',
    'Current Blocker': 'The IRC instance is not rendering due to which arQuon testing team is unable to test it. Amartya is checking the infra for IRC.',
    'C-Suite Action Needed': 'Needed Direction for the product team to ascertain the priority of the initiative.',
    'Hours Allocated': 200,
    'Hours Burned': 500,
    'Daily Standup Note': 'Infrastructure debugging in progress with client DevOps team.'
  }
];

export const ExcelDeliveryImportModal: React.FC<ExcelDeliveryImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedProjects, setParsedProjects] = useState<DeliveryProject[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [previewTab, setPreviewTab] = useState<'all' | 'flagged'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to normalize keys (strips non-alphanumeric, lowercases)
  const cleanKey = (key: string): string => {
    return key.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  // Robust date parser (handles numbers, excel serials, date strings)
  const parseExcelDate = (val: any, defaultDaysAhead = 30): string => {
    if (val === undefined || val === null || val === '') {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + defaultDaysAhead);
      return fallback.toISOString().split('T')[0];
    }

    // If it's a JS Date object
    if (val instanceof Date) {
      if (!isNaN(val.getTime())) {
        return val.toISOString().split('T')[0];
      }
    }

    // If it's an Excel numeric serial date code (e.g. 46346)
    if (typeof val === 'number') {
      const excelEpoch = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(excelEpoch.getTime())) {
        return excelEpoch.toISOString().split('T')[0];
      }
    }

    const str = val.toString().trim();
    
    // Check if string contains just a number (serial in string form)
    if (/^\d{5}$/.test(str)) {
      const num = parseInt(str, 10);
      const excelEpoch = new Date(Math.round((num - 25569) * 86400 * 1000));
      if (!isNaN(excelEpoch.getTime())) {
        return excelEpoch.toISOString().split('T')[0];
      }
    }

    // Standard YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }

    // Formats like DD/MM/YYYY or MM/DD/YYYY
    if (str.includes('/') || str.includes('-')) {
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    }

    return str;
  };

  // Convert raw row to typed DeliveryProject
  const transformRowToProject = (raw: any, index: number): DeliveryProject | null => {
    // Map by normalized key
    const row: Record<string, any> = {};
    Object.keys(raw).forEach(k => {
      row[cleanKey(k)] = raw[k];
    });

    // Account Name
    const rawAccount = row['accountname'] || row['account'] || row['company'] || row['companyname'] || row['client'] || row['name'];
    if (!rawAccount || rawAccount.toString().trim() === '') return null;
    const accountName = rawAccount.toString().trim();

    // Domain
    const domain = (row['domain'] || row['website'] || row['url'] || `${accountName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`).toString().trim();
    const idSlug = accountName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const id = row['id'] || `deliv-${idSlug}-${Date.now().toString().slice(-4)}`;
    const accountId = row['accountid'] || `acc-${idSlug}`;

    // Contract ARR (support 0, numbers, strings with $, commas, k, M)
    const arrKeys = ['contractarr', 'arr', 'revenue', 'contractvalue', 'acv', 'value'];
    let rawArr: any = undefined;
    for (const k of arrKeys) {
      if (row[k] !== undefined && row[k] !== null && row[k] !== '') {
        rawArr = row[k];
        break;
      }
    }

    let arr = 0;
    if (rawArr !== undefined && rawArr !== null) {
      if (typeof rawArr === 'number') {
        arr = isNaN(rawArr) ? 0 : rawArr;
      } else {
        const cleaned = rawArr.toString().replace(/[\$,]/g, '').trim();
        if (cleaned.toLowerCase().endsWith('k')) {
          arr = (parseFloat(cleaned) || 0) * 1000;
        } else if (cleaned.toLowerCase().endsWith('m')) {
          arr = (parseFloat(cleaned) || 0) * 1000000;
        } else {
          const parsed = parseFloat(cleaned);
          arr = isNaN(parsed) ? 0 : parsed;
        }
      }
    }

    // Plan tier
    let plan: PlanTier = 'Enterprise';
    const rawPlan = (row['plan'] || row['plantier'] || row['tier'] || 'Enterprise').toString().toLowerCase();
    if (rawPlan.includes('scale')) plan = 'Scale';
    else if (rawPlan.includes('starter') || rawPlan.includes('growth')) plan = 'Starter';
    else plan = 'Enterprise';

    // Phase: preserve user's actual custom phase (e.g. "Phase A: Knowledge Layer", "Phase 1: Finance Ops")
    const rawPhase = (row['phase'] || row['deliveryphase'] || row['stage'] || '').toString().trim();
    const deliveryPhase: DeliveryPhase = rawPhase || 'Phase 1: Discovery & Architecture';

    // Progress %
    let phaseProgress = 50;
    const progKeys = ['progress', 'phaseprogress', 'progresspercent', 'completion', 'percent'];
    for (const k of progKeys) {
      if (row[k] !== undefined && row[k] !== null && row[k] !== '') {
        const parsed = parseInt(row[k].toString().replace('%', ''), 10);
        if (!isNaN(parsed)) {
          phaseProgress = Math.min(100, Math.max(0, parsed));
          break;
        }
      }
    }

    // Health Status
    let deliveryHealth: DeliveryHealthStatus = 'on-track';
    const rawHealth = (row['health'] || row['healthstatus'] || row['deliveryhealth'] || row['status'] || 'on-track').toString().toLowerCase();
    if (rawHealth.includes('crit') || rawHealth.includes('red')) {
      deliveryHealth = 'critical';
    } else if (rawHealth.includes('risk') || rawHealth.includes('yellow') || rawHealth.includes('amber')) {
      deliveryHealth = 'at-risk';
    } else if (rawHealth.includes('launch') || rawHealth.includes('complete') || rawHealth.includes('done')) {
      deliveryHealth = 'completed';
    } else {
      deliveryHealth = 'on-track';
    }

    // Baseline Target Date
    const rawTargetDate = row['baselinetargetdate'] || row['targetdate'] || row['golivedate'] || row['duedate'];
    const baselineTargetDate = parseExcelDate(rawTargetDate, 30);

    // Blockers & C-Suite Actions
    const currentBlocker = (row['currentblocker'] || row['blocker'] || row['roadblock'] || '').toString().trim() || undefined;
    const csuiteActionNeeded = (row['csuiteactionneeded'] || row['csuiteaction'] || row['execaction'] || row['escalation'] || '').toString().trim() || undefined;

    // Variance calculation
    let varianceDays = 0;
    if (row['variancedays'] !== undefined && row['variancedays'] !== '') {
      varianceDays = parseInt(row['variancedays'], 10) || 0;
    } else if (currentBlocker || deliveryHealth === 'critical') {
      varianceDays = 14;
    } else if (deliveryHealth === 'at-risk') {
      varianceDays = 7;
    } else if (phaseProgress === 100) {
      varianceDays = 0;
    } else if (phaseProgress >= 90) {
      varianceDays = -2;
    }

    // Predicted Go-Live Date
    let predictedGoLiveDate = baselineTargetDate;
    try {
      const bDate = new Date(baselineTargetDate);
      if (!isNaN(bDate.getTime())) {
        bDate.setDate(bDate.getDate() + varianceDays);
        predictedGoLiveDate = bDate.toISOString().split('T')[0];
      }
    } catch {
      predictedGoLiveDate = baselineTargetDate;
    }

    // Confidence Score
    let confidenceScore = 85;
    if (phaseProgress === 100) confidenceScore = 100;
    else if (deliveryHealth === 'critical') confidenceScore = 35;
    else if (deliveryHealth === 'at-risk') confidenceScore = 60;
    else confidenceScore = Math.min(98, 70 + Math.round(phaseProgress * 0.25));

    // ARR at risk
    const arrAtRisk = (deliveryHealth === 'critical' || deliveryHealth === 'at-risk') ? arr : 0;

    // Team members
    const leadName = (row['deliverylead'] || row['lead'] || row['pm'] || 'Shubham').toString().trim();
    const leadTitle = (row['deliveryleadtitle'] || row['leadtitle'] || 'Forward Deployed Engineer (FDE)').toString().trim();
    const csmName = (row['csmname'] || row['csm'] || row['accountcsm'] || 'Dip').toString().trim();
    const sponsorName = (row['clientsponsor'] || row['sponsor'] || 'Client Technical Sponsor').toString().trim();
    const sponsorRole = (row['clientsponsorrole'] || row['sponsorrole'] || 'VP Technology').toString().trim();
    const sponsorEmail = (row['clientsponsoremail'] || row['sponsoremail'] || (domain ? `sponsor@${domain}` : '')).toString().trim();

    // Implementation Hours
    const hoursAllocated = parseInt(row['hoursallocated'] || row['totalhours'] || 200, 10) || 200;
    const hoursBurned = parseInt(row['hoursburned'] || row['hoursspent'] || Math.round(hoursAllocated * (phaseProgress / 100)), 10) || 0;

    // Daily Standup Note
    const rawNote = (row['dailystandupnote'] || row['standupnote'] || row['notes'] || row['pulse'] || '').toString().trim();
    const dailyStandupNote = rawNote || (
      phaseProgress === 100 
        ? 'All deliverables successfully validated. Ready for executive signoff.' 
        : currentBlocker 
          ? `Blocker active: ${currentBlocker}` 
          : csuiteActionNeeded 
            ? `C-Suite action requested: ${csuiteActionNeeded}` 
            : `Implementation tracking on schedule (${phaseProgress}% completed).`
    );

    // Build intelligent milestones matching user's progress
    const cleanPhaseName = deliveryPhase.includes(':') ? deliveryPhase.split(':')[1].trim() : deliveryPhase;
    const milestones = [
      {
        id: `ms-${id}-1`,
        name: `Discovery & Architecture Sign-Off`,
        phase: 'Phase 1',
        targetDate: baselineTargetDate,
        status: phaseProgress >= 25 ? 'completed' : 'in-progress',
        owner: leadName
      },
      {
        id: `ms-${id}-2`,
        name: `${cleanPhaseName} Setup & Infrastructure`,
        phase: 'Phase 2',
        targetDate: baselineTargetDate,
        status: phaseProgress >= 50 ? 'completed' : phaseProgress >= 25 ? 'in-progress' : 'pending',
        owner: leadName
      },
      {
        id: `ms-${id}-3`,
        name: `Integration & Workflows Verification`,
        phase: 'Phase 3',
        targetDate: baselineTargetDate,
        status: phaseProgress >= 75 ? 'completed' : phaseProgress >= 50 ? 'in-progress' : 'pending',
        owner: csmName
      },
      {
        id: `ms-${id}-4`,
        name: `UAT Validation & Security Review`,
        phase: 'Phase 4',
        targetDate: baselineTargetDate,
        status: phaseProgress >= 90 ? 'completed' : phaseProgress >= 75 ? (currentBlocker ? 'blocked' : 'in-progress') : 'pending',
        owner: sponsorName
      },
      {
        id: `ms-${id}-5`,
        name: `Production Go-Live Sign-Off`,
        phase: 'Phase 5',
        targetDate: baselineTargetDate,
        status: phaseProgress === 100 ? 'completed' : 'pending',
        owner: leadName
      }
    ] as any;

    // Logo: Use Clearbit or clean 2-letter badge
    const logo = domain ? `https://logo.clearbit.com/${domain}` : accountName.slice(0, 2).toUpperCase();

    return {
      id,
      accountId,
      accountName,
      domain,
      logo,
      plan,
      arr,
      deliveryPhase,
      phaseProgress,
      deliveryHealth,
      deliveryLead: {
        name: leadName,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
        title: leadTitle
      },
      accountCsm: {
        name: csmName,
        avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80`
      },
      clientSponsor: {
        name: sponsorName,
        role: sponsorRole,
        email: sponsorEmail
      },
      baselineTargetDate,
      currentEstimatedDate: predictedGoLiveDate,
      predictedGoLiveDate,
      varianceDays,
      confidenceScore,
      arrAtRisk,
      hoursAllocated,
      hoursBurned,
      currentBlocker,
      csuiteActionNeeded,
      dailyStandupNote,
      lastDailyUpdateDate: 'Today',
      weeklyHighlights: {
        completedThisWeek: [dailyStandupNote],
        plannedNextWeek: [`Advance ${deliveryPhase} deliverables`, `Review C-Suite milestones for ${baselineTargetDate}`]
      },
      milestones
    };
  };

  // Process File with ArrayBuffer for maximum binary format reliability
  const handleProcessFile = (selectedFile: File) => {
    setFile(selectedFile);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) throw new Error('Could not read file data from disk');

        const workbook = XLSX.read(buffer, { 
          type: 'array',
          cellDates: true,
          dateNF: 'yyyy-mm-dd'
        });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) throw new Error('Spreadsheet does not contain any sheets');

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { 
          defval: '',
          raw: false
        });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('Spreadsheet appears to be empty. Please populate sample client rows and try again.');
        }

        const validProjects: DeliveryProject[] = [];
        rawJson.forEach((row, idx) => {
          const project = transformRowToProject(row, idx);
          if (project) {
            validProjects.push(project);
          }
        });

        if (validProjects.length === 0) {
          throw new Error('No valid client projects found. Ensure columns include "Account Name".');
        }

        setParsedProjects(validProjects);
      } catch (err: any) {
        console.error('Error parsing spreadsheet:', err);
        setParseError(err.message || 'Failed to parse file. Please verify format.');
        setParsedProjects([]);
      }
    };

    reader.onerror = () => {
      setParseError('Failed to read the file from disk.');
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Download Sample Template (Excel or CSV)
  const handleDownloadTemplate = (format: 'xlsx' | 'csv') => {
    const ws = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_ROWS);
    
    // Set column widths for readability
    ws['!cols'] = [
      { wch: 25 }, // Account Name
      { wch: 28 }, // Domain
      { wch: 14 }, // Plan Tier
      { wch: 16 }, // Contract ARR
      { wch: 34 }, // Phase
      { wch: 12 }, // Progress %
      { wch: 14 }, // Health Status
      { wch: 20 }, // Baseline Target Date
      { wch: 16 }, // Delivery Lead
      { wch: 18 }, // Lead Title
      { wch: 16 }, // CSM Name
      { wch: 20 }, // Client Sponsor
      { wch: 28 }, // Sponsor Email
      { wch: 45 }, // Current Blocker
      { wch: 45 }, // C-Suite Action Needed
      { wch: 16 }, // Hours Allocated
      { wch: 16 }, // Hours Burned
      { wch: 45 }, // Daily Standup Note
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Delivery Briefing');

    if (format === 'xlsx') {
      XLSX.writeFile(wb, 'arQuonCX_Delivery_Briefing_Template.xlsx');
    } else {
      XLSX.writeFile(wb, 'arQuonCX_Delivery_Briefing_Template.csv', { bookType: 'csv' });
    }
  };

  // Handle Import Submit
  const handleConfirmImport = async () => {
    if (parsedProjects.length === 0) return;
    setIsImporting(true);
    try {
      await onImport(parsedProjects, importMode);
      onClose();
      setFile(null);
      setParsedProjects([]);
    } catch (err: any) {
      setParseError(err.message || 'Import failed. Check server logs.');
    } finally {
      setIsImporting(false);
    }
  };

  // Preview Aggregates
  const totalImportARR = parsedProjects.reduce((acc, p) => acc + (p.arr || 0), 0);
  const totalAtRiskARR = parsedProjects.filter(p => p.deliveryHealth === 'at-risk' || p.deliveryHealth === 'critical').reduce((acc, p) => acc + (p.arr || 0), 0);
  const actionRequiredCount = parsedProjects.filter(p => !!p.csuiteActionNeeded).length;

  const displayedProjects = previewTab === 'flagged' 
    ? parsedProjects.filter(p => p.csuiteActionNeeded || p.deliveryHealth !== 'on-track') 
    : parsedProjects;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title="Upload Client Delivery Spreadsheet (Excel / CSV)"
      description="Bridge delivery data into your C-Suite Briefing & predictive engine until direct CRM / Jira connectors are synced."
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Client-side parsed with automatic variance, risk & milestone scoring</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={parsedProjects.length === 0 || isImporting}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer ${
                parsedProjects.length === 0 || isImporting
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
              }`}
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing Briefing...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>Import {parsedProjects.length} Project{parsedProjects.length === 1 ? '' : 's'} into C-Suite</span>
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Step 1: Download Official Template Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Need the standard C-Suite Delivery spreadsheet format?
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Pre-configured with columns for ARR, baseline target dates, blockers, and C-Suite escalation notes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleDownloadTemplate('xlsx')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white dark:bg-[#111C35] border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadTemplate('csv')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#1E2D52] text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-[#152342] transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Step 2: Drop Zone / Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 scale-[0.99]'
              : file
              ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20'
              : 'border-slate-300 dark:border-[#1E2D52] bg-slate-50/60 dark:bg-[#0A1024] hover:border-indigo-400 dark:hover:border-indigo-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleProcessFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className={`p-3 rounded-full ${
              file 
                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' 
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
            }`}>
              {file ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
            </div>

            {file ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB • Click or drop another file to replace
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Drag and drop your delivery spreadsheet here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse files</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Supports Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {parseError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Parsing Error: </span>
              {parseError}
            </div>
            <button 
              onClick={() => setParseError(null)}
              className="text-rose-500 hover:text-rose-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Step 3: Parsed Data Preview & Mode Selector */}
        {parsedProjects.length > 0 && (
          <div className="space-y-3 pt-2">
            {/* Header with Aggregates */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#1E2D52]">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Projects Found
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {parsedProjects.length}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#1E2D52]">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Total Pipeline ARR
                </span>
                <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                  ${(totalImportARR / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#1E2D52]">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  ARR At Risk
                </span>
                <span className={`text-base font-extrabold ${totalAtRiskARR > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                  ${(totalAtRiskARR / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#1E2D52]">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  C-Suite Actions
                </span>
                <span className={`text-base font-extrabold ${actionRequiredCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                  {actionRequiredCount} Escalation{actionRequiredCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* Import Mode Radio Toggle */}
            <div className="p-3 bg-slate-50 dark:bg-[#111C35] rounded-xl border border-slate-200 dark:border-[#1E2D52] space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Select Pipeline Import Mode:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label 
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    importMode === 'merge'
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-white'
                      : 'border-slate-200 dark:border-[#1E2D52] hover:bg-slate-100/60 dark:hover:bg-[#152342] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">Merge with Existing Pipeline (Recommended)</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Updates matching client accounts by name and appends new client projects.
                    </span>
                  </div>
                </label>

                <label 
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    importMode === 'replace'
                      ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-white'
                      : 'border-slate-200 dark:border-[#1E2D52] hover:bg-slate-100/60 dark:hover:bg-[#152342] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">Replace Entire Pipeline</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Overwrites all existing delivery projects with only the rows in this file.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Preview Table Header & Filter Tabs */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Live Data Preview ({displayedProjects.length} rows)
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#111C35] p-0.5 rounded-lg border border-slate-200 dark:border-[#1E2D52]">
                <button
                  type="button"
                  onClick={() => setPreviewTab('all')}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                    previewTab === 'all'
                      ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All ({parsedProjects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('flagged')}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                    previewTab === 'flagged'
                      ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Needs Attention ({actionRequiredCount})
                </button>
              </div>
            </div>

            {/* Scrollable Preview Table */}
            <div className="border border-slate-200 dark:border-[#1E2D52] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 dark:bg-[#111C35] text-slate-600 dark:text-slate-400 font-semibold sticky top-0 border-b border-slate-200 dark:border-[#1E2D52] z-10">
                  <tr>
                    <th className="py-2 px-3">Account</th>
                    <th className="py-2 px-2">Plan</th>
                    <th className="py-2 px-2 text-right">ARR</th>
                    <th className="py-2 px-3">Phase & Progress</th>
                    <th className="py-2 px-2 text-center">Status</th>
                    <th className="py-2 px-2">Target Date</th>
                    <th className="py-2 px-3">C-Suite Action / Blocker</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E2D52]/60">
                  {displayedProjects.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-[#152342]/50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <ProjectLogo logo={p.logo} name={p.accountName} size="sm" />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                              {p.accountName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                              {p.domain}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {p.plan}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ${((p.arr || 0) / 1000).toFixed(0)}k
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]" title={p.deliveryPhase}>
                          {p.deliveryPhase.includes(':') ? p.deliveryPhase.split(':')[1].trim() : p.deliveryPhase}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-16">
                            <div 
                              className={`h-full rounded-full ${
                                p.deliveryHealth === 'critical' ? 'bg-rose-500' :
                                p.deliveryHealth === 'at-risk' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${Math.min(100, p.phaseProgress)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-semibold text-slate-500">{p.phaseProgress}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.deliveryHealth === 'on-track' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                          p.deliveryHealth === 'at-risk' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                          p.deliveryHealth === 'critical' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' :
                          'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                        }`}>
                          {p.deliveryHealth}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {p.baselineTargetDate}
                      </td>
                      <td className="py-2.5 px-3">
                        {p.csuiteActionNeeded ? (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 truncate max-w-[200px]" title={p.csuiteActionNeeded}>
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span className="truncate">{p.csuiteActionNeeded}</span>
                          </div>
                        ) : p.currentBlocker ? (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400 truncate max-w-[200px]" title={p.currentBlocker}>
                            Blocker: {p.currentBlocker}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No blockers</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

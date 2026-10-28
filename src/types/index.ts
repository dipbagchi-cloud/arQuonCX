export type NavigationTab = 
  | 'overview' 
  | 'delivery-briefing'
  | 'deployment-wbs'
  | 'accounts' 
  | 'users' 
  | 'flows' 
  | 'surveys' 
  | 'analytics' 
  | 'resource-center' 
  | 'integrations';

export type HealthTier = 'healthy' | 'neutral' | 'at-risk';
export type PlanTier = 'Enterprise' | 'Scale' | 'Starter';

export interface HealthFactors {
  usage: number; // 0-100
  support: number; // 0-100 (higher = fewer/resolved tickets)
  nps: number; // 0-100
  champion: number; // 0-100 (champion engagement)
}

export interface AccountContact {
  name: string;
  role: string;
  email: string;
  isChampion?: boolean;
}

export interface AccountMilestone {
  title: string;
  completed: boolean;
  date?: string;
}

export interface Account {
  id: string;
  name: string;
  domain: string;
  logo: string;
  plan: PlanTier;
  mrr: number;
  arr: number;
  csmName: string;
  csmAvatar: string;
  healthScore: number;
  healthTier: HealthTier;
  npsScore: number;
  seatsTotal: number;
  seatsUsed: number;
  renewalDate: string;
  daysToRenewal: number;
  tags: string[];
  healthFactors: HealthFactors;
  lastActiveDaysAgo: number;
  onboardingProgress: number; // 0-100
  contacts: AccountContact[];
  milestones: AccountMilestone[];
  notes: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  accountId: string;
  accountName: string;
  role: string;
  healthScore: number;
  healthTier: HealthTier;
  lastSeen: string;
  totalSessions: number;
  featureAdoptionCount: number;
  segmentTags: string[];
  joinedDate: string;
  plan: PlanTier;
}

export type FlowType = 'modal' | 'slideout' | 'tooltip' | 'checklist' | 'banner';
export type FlowStatus = 'live' | 'paused' | 'draft';

export interface FlowStep {
  stepNumber: number;
  title: string;
  content: string;
  targetElement?: string;
  buttonText: string;
  type: FlowType;
}

export interface Flow {
  id: string;
  name: string;
  type: FlowType;
  status: FlowStatus;
  targetAudience: string;
  triggerEvent: string;
  impressions: number;
  completedCount: number;
  completionRate: number; // percentage
  dropOffRate: number; // percentage
  goalName: string;
  goalConversion: number; // percentage
  lastEdited: string;
  steps: FlowStep[];
}

export type SurveyType = 'nps' | 'csat' | 'ces' | 'micro';
export type SentimentType = 'positive' | 'neutral' | 'negative';
export type FeedbackCategory = 'promoter' | 'passive' | 'detractor';

export interface FeedbackItem {
  id: string;
  userName: string;
  userAvatar: string;
  accountName: string;
  score: number;
  category: FeedbackCategory;
  tags: string[];
  comment: string;
  sentiment: SentimentType;
  csmAssigned: string;
  status: 'open' | 'addressed';
  date: string;
}

export interface Survey {
  id: string;
  title: string;
  type: SurveyType;
  responsesCount: number;
  score: string;
  scoreNumeric: number;
  status: 'active' | 'scheduled' | 'ended';
  dateCreated: string;
  targetSegment: string;
}

export interface FeatureTag {
  id: string;
  name: string;
  selector: string;
  section: string;
  monthlyClicks: number;
  uniqueUsers: number;
  adoptionPercentage: number;
  trend: number; // percentage change
}

export interface FunnelStep {
  stepNumber: number;
  name: string;
  visitors: number;
  conversionRate: number; // vs previous step
  overallRate: number; // vs first step
  dropOffCount: number;
}

export interface CohortRow {
  cohortName: string;
  userCount: number;
  weeks: number[]; // percentage retention for W0 to W7
}

export interface Integration {
  id: string;
  name: string;
  category: 'CRM' | 'Analytics' | 'Communication' | 'Support' | 'Data';
  icon: string;
  description: string;
  status: 'connected' | 'disconnected';
  lastSync?: string;
  eventCount?: string;
}

export interface ResourceModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  type: 'checklist' | 'guides' | 'announcements' | 'chat' | 'articles';
  badge?: string;
}

export interface ResourceChecklistItem {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  actionText: string;
}

export type DeliveryPhase = 
  | 'Phase 1: Architecture & Infosec'
  | 'Phase 2: Data & SDK Pipeline'
  | 'Phase 3: Workflows & Segment Config'
  | 'Phase 4: UAT & Pilot Validation'
  | 'Phase 5: Production Go-Live'
  | 'Phase 6: 30-Day Hypercare'
  | (string & {});

export type DeliveryHealthStatus = 'on-track' | 'at-risk' | 'delayed' | 'critical' | 'completed';

export interface DeliveryMilestoneItem {
  id: string;
  name: string;
  phase: string;
  targetDate: string;
  actualDate?: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  owner: string;
}

export interface DeliveryProject {
  id: string;
  accountId: string;
  accountName: string;
  domain: string;
  logo: string;
  plan: PlanTier;
  arr: number;
  deliveryPhase: DeliveryPhase;
  phaseProgress: number; // 0-100
  deliveryHealth: DeliveryHealthStatus;
  deliveryLead: {
    name: string;
    avatar: string;
    title: string;
  };
  accountCsm: {
    name: string;
    avatar: string;
  };
  clientSponsor: {
    name: string;
    role: string;
    email: string;
  };
  baselineTargetDate: string;
  currentEstimatedDate: string;
  predictedGoLiveDate: string;
  varianceDays: number; // e.g. +14 for 14-day delay, -3 for 3 days ahead
  confidenceScore: number; // 0-100 percentage
  arrAtRisk: number;
  hoursAllocated: number;
  hoursBurned: number;
  currentBlocker?: string;
  csuiteActionNeeded?: string;
  dailyStandupNote: string;
  lastDailyUpdateDate: string;
  weeklyHighlights: {
    completedThisWeek: string[];
    plannedNextWeek: string[];
  };
  milestones: DeliveryMilestoneItem[];
  wbsTasks?: WbsTask[];
  velocityMetrics?: TeamVelocityMetrics;
}

export type WbsTaskStatus = 'not-started' | 'in-progress' | 'in-review' | 'blocked' | 'completed';
export type WbsTaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface WbsAssignee {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
}

export interface WbsTask {
  id: string; // e.g. "SHPL-WBS-1.1"
  projectId: string; // references DeliveryProject.id
  phase: string; // e.g. "Phase 1: Architecture & Infosec"
  workPackage: string; // e.g. "Infosec & Governance"
  taskName: string; // e.g. "Configure SAML 2.0 SSO and SCIM provisioning"
  assignedUser: WbsAssignee;
  status: WbsTaskStatus;
  priority: WbsTaskPriority;
  estimatedHours: number;
  actualHours: number;
  progress: number; // 0-100
  plannedStart: string; // YYYY-MM-DD
  plannedFinish: string; // YYYY-MM-DD
  actualFinish?: string;
  dependencyId?: string; // Predecessor WBS ID
  isCriticalPath?: boolean;
  isMilestone?: boolean;
  blockerNote?: string;
  lastUpdated?: string;
}

export interface UserWorkloadItem {
  userId: string;
  name: string;
  avatar: string;
  role: string;
  assignedHours: number;
  loggedHours: number;
  completedTasks: number;
  totalTasks: number;
  openBlockers: number;
  efficiencyRatio: number; // actualHours / (estimatedHours * progress/100 || 1)
}

export interface TeamVelocityMetrics {
  weeklyBurnHours: number;
  targetBurnHours: number;
  tasksCompletedThisSprint: number;
  totalTasksInSprint: number;
  velocityTrend: 'accelerating' | 'steady' | 'degrading';
  sprintNumber: number;
  userWorkloads: UserWorkloadItem[];
}

import { 
  Account, 
  User, 
  Flow, 
  FeedbackItem, 
  Survey, 
  FeatureTag, 
  FunnelStep, 
  CohortRow, 
  Integration, 
  ResourceModule,
  ResourceChecklistItem,
  DeliveryProject
} from '../types';

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'Acme Cloud Dynamics',
    domain: 'acmecloud.io',
    logo: '☁️',
    plan: 'Enterprise',
    mrr: 12500,
    arr: 150000,
    csmName: 'Elena Rostova',
    csmAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    healthScore: 92,
    healthTier: 'healthy',
    npsScore: 9,
    seatsTotal: 150,
    seatsUsed: 142,
    renewalDate: '2026-12-15',
    daysToRenewal: 53,
    tags: ['Expansion Ready', 'Advocate', 'Multi-Product'],
    healthFactors: {
      usage: 95,
      support: 92,
      nps: 90,
      champion: 98,
    },
    lastActiveDaysAgo: 0,
    onboardingProgress: 100,
    contacts: [
      { name: 'Marcus Chen', role: 'VP of Product', email: 'marcus@acmecloud.io', isChampion: true },
      { name: 'Sarah Miller', role: 'Head of Growth', email: 'sarah.m@acmecloud.io' },
      { name: 'David Kim', role: 'Lead Architect', email: 'david.k@acmecloud.io' }
    ],
    milestones: [
      { title: 'Kickoff & SDK Integration', completed: true, date: 'Jan 12' },
      { title: 'First 5 Flows Published', completed: true, date: 'Feb 04' },
      { title: 'Executive QBR Review', completed: true, date: 'Jun 20' },
      { title: 'Contract Renewal Discussion', completed: false }
    ],
    notes: 'Power customer! Interested in upgrading seats for their EMEA division next quarter. Marcus loves the new AI segmentation.'
  },
  {
    id: 'acc-2',
    name: 'FinPulse Systems',
    domain: 'finpulse.co',
    logo: '💳',
    plan: 'Enterprise',
    mrr: 9800,
    arr: 117600,
    csmName: 'Liam Vance',
    csmAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    healthScore: 44,
    healthTier: 'at-risk',
    npsScore: 5,
    seatsTotal: 80,
    seatsUsed: 31,
    renewalDate: '2026-11-28',
    daysToRenewal: 36,
    tags: ['High Churn Risk', 'Low License Usage', 'Sponsor Left'],
    healthFactors: {
      usage: 38,
      support: 52,
      nps: 45,
      champion: 30,
    },
    lastActiveDaysAgo: 9,
    onboardingProgress: 58,
    contacts: [
      { name: 'Chloe Dubois', role: 'Director of CX', email: 'chloe@finpulse.co' },
      { name: 'Alex Thorne', role: 'Interim Tech Lead', email: 'alex.t@finpulse.co' }
    ],
    milestones: [
      { title: 'Kickoff & SDK Integration', completed: true, date: 'Mar 15' },
      { title: 'First 5 Flows Published', completed: false },
      { title: 'Health Score Stabilization', completed: false }
    ],
    notes: 'Previous champion left company 4 weeks ago. Seat usage dropped by 45%. Urgent CSM intervention needed before renewal.'
  },
  {
    id: 'acc-3',
    name: 'NovaScale BioTech',
    domain: 'novascale.ai',
    logo: '🧬',
    plan: 'Scale',
    mrr: 6400,
    arr: 76800,
    csmName: 'Elena Rostova',
    csmAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    healthScore: 88,
    healthTier: 'healthy',
    npsScore: 10,
    seatsTotal: 50,
    seatsUsed: 48,
    renewalDate: '2027-03-10',
    daysToRenewal: 138,
    tags: ['Fast Growth', 'High Adoption'],
    healthFactors: {
      usage: 90,
      support: 95,
      nps: 100,
      champion: 85,
    },
    lastActiveDaysAgo: 1,
    onboardingProgress: 95,
    contacts: [
      { name: 'Dr. Aris Vance', role: 'Chief of Informatics', email: 'aris@novascale.ai', isChampion: true },
      { name: 'Zoe Morales', role: 'Product Operations', email: 'zoe@novascale.ai' }
    ],
    milestones: [
      { title: 'SDK Integration', completed: true, date: 'Apr 02' },
      { title: 'Custom NPS Launched', completed: true, date: 'May 14' },
      { title: 'Feature Tagging Setup', completed: true, date: 'Jul 22' }
    ],
    notes: 'Exceptional retention. Currently testing our in-app resource center with 90% positive feedback.'
  },
  {
    id: 'acc-4',
    name: 'SentryPay Global',
    domain: 'sentrypay.com',
    logo: '🛡️',
    plan: 'Enterprise',
    mrr: 16200,
    arr: 194400,
    csmName: 'Rachel Green',
    csmAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    healthScore: 68,
    healthTier: 'neutral',
    npsScore: 7,
    seatsTotal: 200,
    seatsUsed: 135,
    renewalDate: '2027-01-30',
    daysToRenewal: 99,
    tags: ['Mid-Tier Health', 'Needs Training'],
    healthFactors: {
      usage: 65,
      support: 70,
      nps: 72,
      champion: 68,
    },
    lastActiveDaysAgo: 3,
    onboardingProgress: 80,
    contacts: [
      { name: 'Keith O\'Connor', role: 'Head of Customer Experience', email: 'keith@sentrypay.com', isChampion: true },
      { name: 'Jessica Alba', role: 'UX Research Manager', email: 'jessica@sentrypay.com' }
    ],
    milestones: [
      { title: 'Enterprise SSO Verified', completed: true, date: 'Feb 10' },
      { title: 'Team Workshop Onboarding', completed: true, date: 'Mar 18' },
      { title: 'Automated Retention Funnel', completed: false }
    ],
    notes: 'Good baseline usage but underutilizing the funnel analytics and cohorts. Suggested tailored training session.'
  },
  {
    id: 'acc-5',
    name: 'Vortex Logistics',
    domain: 'vortexlog.de',
    logo: '🚚',
    plan: 'Scale',
    mrr: 5200,
    arr: 62400,
    csmName: 'Liam Vance',
    csmAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    healthScore: 38,
    healthTier: 'at-risk',
    npsScore: 4,
    seatsTotal: 40,
    seatsUsed: 14,
    renewalDate: '2026-11-15',
    daysToRenewal: 23,
    tags: ['Renewal Overdue', 'Unresponsive'],
    healthFactors: {
      usage: 25,
      support: 40,
      nps: 35,
      champion: 20,
    },
    lastActiveDaysAgo: 14,
    onboardingProgress: 42,
    contacts: [
      { name: 'Hans Gruber', role: 'Head of Dispatch Tech', email: 'hans@vortexlog.de' }
    ],
    milestones: [
      { title: 'Initial Signoff', completed: true, date: 'May 01' },
      { title: 'Onboarding Checklist Completion', completed: false }
    ],
    notes: 'Critical risk! Last login was 2 weeks ago. Renewal in 23 days. Triggered escalation to VP of Sales.'
  },
  {
    id: 'acc-6',
    name: 'Luminary Media Tech',
    domain: 'luminary.io',
    logo: '✨',
    plan: 'Starter',
    mrr: 2400,
    arr: 28800,
    csmName: 'Rachel Green',
    csmAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    healthScore: 94,
    healthTier: 'healthy',
    npsScore: 10,
    seatsTotal: 25,
    seatsUsed: 25,
    renewalDate: '2027-05-18',
    daysToRenewal: 207,
    tags: ['Upgrade Prospect', 'Maxed Seats'],
    healthFactors: {
      usage: 98,
      support: 96,
      nps: 95,
      champion: 90,
    },
    lastActiveDaysAgo: 0,
    onboardingProgress: 100,
    contacts: [
      { name: 'Maya Lin', role: 'VP Digital Media', email: 'maya@luminary.io', isChampion: true }
    ],
    milestones: [
      { title: 'Getting Started Tour', completed: true, date: 'Jun 05' },
      { title: 'Full Resource Center Deployed', completed: true, date: 'Jul 12' }
    ],
    notes: 'Consistently hitting 100% seat cap. Prime candidate to upgrade to Scale tier with automated flows.'
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Marcus Chen',
    email: 'marcus@acmecloud.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    accountId: 'acc-1',
    accountName: 'Acme Cloud Dynamics',
    role: 'VP of Product',
    healthScore: 95,
    healthTier: 'healthy',
    lastSeen: '12 mins ago',
    totalSessions: 148,
    featureAdoptionCount: 18,
    segmentTags: ['Power User', 'Champion', 'Flow Creator'],
    joinedDate: 'Jan 10, 2026',
    plan: 'Enterprise'
  },
  {
    id: 'usr-2',
    name: 'Chloe Dubois',
    email: 'chloe@finpulse.co',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    accountId: 'acc-2',
    accountName: 'FinPulse Systems',
    role: 'Director of CX',
    healthScore: 42,
    healthTier: 'at-risk',
    lastSeen: '9 days ago',
    totalSessions: 22,
    featureAdoptionCount: 4,
    segmentTags: ['At-Risk Churn', 'Stalled Onboarding'],
    joinedDate: 'Mar 15, 2026',
    plan: 'Enterprise'
  },
  {
    id: 'usr-3',
    name: 'Dr. Aris Vance',
    email: 'aris@novascale.ai',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    accountId: 'acc-3',
    accountName: 'NovaScale BioTech',
    role: 'Chief of Informatics',
    healthScore: 91,
    healthTier: 'healthy',
    lastSeen: '1 hour ago',
    totalSessions: 112,
    featureAdoptionCount: 16,
    segmentTags: ['Power User', 'NPS Promoter'],
    joinedDate: 'Apr 02, 2026',
    plan: 'Scale'
  },
  {
    id: 'usr-4',
    name: 'Keith O\'Connor',
    email: 'keith@sentrypay.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    accountId: 'acc-4',
    accountName: 'SentryPay Global',
    role: 'Head of Customer Exp',
    healthScore: 68,
    healthTier: 'neutral',
    lastSeen: '3 days ago',
    totalSessions: 64,
    featureAdoptionCount: 9,
    segmentTags: ['Regular User', 'Target: Funnel Training'],
    joinedDate: 'Feb 10, 2026',
    plan: 'Enterprise'
  },
  {
    id: 'usr-5',
    name: 'Hans Gruber',
    email: 'hans@vortexlog.de',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    accountId: 'acc-5',
    accountName: 'Vortex Logistics',
    role: 'Head of Dispatch Tech',
    healthScore: 35,
    healthTier: 'at-risk',
    lastSeen: '14 days ago',
    totalSessions: 11,
    featureAdoptionCount: 2,
    segmentTags: ['Dormant User', 'At-Risk Churn'],
    joinedDate: 'May 01, 2026',
    plan: 'Scale'
  },
  {
    id: 'usr-6',
    name: 'Maya Lin',
    email: 'maya@luminary.io',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    accountId: 'acc-6',
    accountName: 'Luminary Media Tech',
    role: 'VP Digital Media',
    healthScore: 96,
    healthTier: 'healthy',
    lastSeen: 'Just now',
    totalSessions: 195,
    featureAdoptionCount: 21,
    segmentTags: ['Power User', 'NPS Promoter', 'Upgrade Ready'],
    joinedDate: 'Jun 05, 2026',
    plan: 'Starter'
  },
  {
    id: 'usr-7',
    name: 'Sarah Miller',
    email: 'sarah.m@acmecloud.io',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    accountId: 'acc-1',
    accountName: 'Acme Cloud Dynamics',
    role: 'Head of Growth',
    healthScore: 89,
    healthTier: 'healthy',
    lastSeen: '4 hours ago',
    totalSessions: 94,
    featureAdoptionCount: 14,
    segmentTags: ['Flow Creator', 'Growth Team'],
    joinedDate: 'Jan 15, 2026',
    plan: 'Enterprise'
  },
  {
    id: 'usr-8',
    name: 'Alex Thorne',
    email: 'alex.t@finpulse.co',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    accountId: 'acc-2',
    accountName: 'FinPulse Systems',
    role: 'Interim Tech Lead',
    healthScore: 48,
    healthTier: 'at-risk',
    lastSeen: '8 days ago',
    totalSessions: 18,
    featureAdoptionCount: 3,
    segmentTags: ['Stalled Onboarding'],
    joinedDate: 'Mar 20, 2026',
    plan: 'Enterprise'
  }
];

export const MOCK_FLOWS: Flow[] = [
  {
    id: 'flow-1',
    name: 'New User Interactive Welcome Tour',
    type: 'modal',
    status: 'live',
    targetAudience: 'Signups in last 3 days (All Plans)',
    triggerEvent: 'First Login',
    impressions: 4820,
    completedCount: 3712,
    completionRate: 77,
    dropOffRate: 23,
    goalName: 'Complete 3 Core Actions',
    goalConversion: 64,
    lastEdited: 'Yesterday at 16:40',
    steps: [
      {
        stepNumber: 1,
        title: 'Welcome to arQuonCX Customer Success! 🎉',
        content: 'Accelerate product adoption, identify churn risks before they happen, and automate engaging in-app experiences.',
        buttonText: 'Start Quick 2-Min Tour',
        type: 'modal'
      },
      {
        stepNumber: 2,
        title: 'Monitor Live Account Health',
        content: 'This unified dashboard automatically computes customer health scores from usage metrics, support velocity, and NPS sentiment.',
        targetElement: '#metric-health-card',
        buttonText: 'Next: In-App Flows',
        type: 'tooltip'
      },
      {
        stepNumber: 3,
        title: 'Launch No-Code Guided Walkthroughs',
        content: 'Create contextual modals, tooltips, and checklists to onboard your users without deploying engineering releases.',
        targetElement: '#nav-flows',
        buttonText: 'Finish Tour & Explore',
        type: 'slideout'
      }
    ]
  },
  {
    id: 'flow-2',
    name: 'Feature Spotlight: AI Sentiment Tagging v2.4',
    type: 'slideout',
    status: 'live',
    targetAudience: 'Product Managers & CS Leads (Tier: Scale, Enterprise)',
    triggerEvent: 'View Surveys Dashboard',
    impressions: 2150,
    completedCount: 1827,
    completionRate: 85,
    dropOffRate: 15,
    goalName: 'Filter by AI Sentiment Tag',
    goalConversion: 58,
    lastEdited: 'Oct 20, 2026',
    steps: [
      {
        stepNumber: 1,
        title: 'Introducing Automated Sentiment Tagging',
        content: 'Save hours of manual triage! Feedback verbatims are now auto-classified into UI Friction, Feature Requests, or Pricing concerns.',
        buttonText: 'Try AI Tag Filter',
        type: 'slideout'
      }
    ]
  },
  {
    id: 'flow-3',
    name: 'Onboarding Checklist: Activation Milestones',
    type: 'checklist',
    status: 'live',
    targetAudience: 'New Admins with Unverified Snippets',
    triggerEvent: 'App Load on Dashboard',
    impressions: 1420,
    completedCount: 1022,
    completionRate: 72,
    dropOffRate: 28,
    goalName: 'Verify Tracking Snippet',
    goalConversion: 82,
    lastEdited: 'Oct 18, 2026',
    steps: [
      {
        stepNumber: 1,
        title: 'Install arQuon Tracking Snippet',
        content: 'Paste the single script tag onto your web application header.',
        buttonText: 'Copy Snippet',
        type: 'checklist'
      },
      {
        stepNumber: 2,
        title: 'Tag Your First 3 Core Features',
        content: 'Track key click events using the point-and-click element picker.',
        buttonText: 'Open Tag Editor',
        type: 'checklist'
      },
      {
        stepNumber: 3,
        title: 'Publish First In-App Announcement',
        content: 'Guide users to your newest release.',
        buttonText: 'Create Flow',
        type: 'checklist'
      }
    ]
  },
  {
    id: 'flow-4',
    name: 'Enterprise Renewal & Expansion Reminder',
    type: 'banner',
    status: 'paused',
    targetAudience: 'Accounts with Renewal < 45 Days & Health > 80',
    triggerEvent: 'Page: Billing & Team',
    impressions: 640,
    completedCount: 512,
    completionRate: 80,
    dropOffRate: 20,
    goalName: 'Book QBR Call with CSM',
    goalConversion: 41,
    lastEdited: 'Sep 29, 2026',
    steps: [
      {
        stepNumber: 1,
        title: 'Your Annual Agreement Renews in 30 Days',
        content: 'Lock in your preferred tier pricing and review custom feature add-ons with your dedicated Customer Success Manager.',
        buttonText: 'Schedule Review',
        type: 'banner'
      }
    ]
  },
  {
    id: 'flow-5',
    name: 'Self-Serve Tooltip: Funnel Drop-off Inspection',
    type: 'tooltip',
    status: 'draft',
    targetAudience: 'Analytics Explorers',
    triggerEvent: 'First Visit to Analytics Page',
    impressions: 0,
    completedCount: 0,
    completionRate: 0,
    dropOffRate: 0,
    goalName: 'Export Funnel Insights',
    goalConversion: 0,
    lastEdited: 'Today at 11:15',
    steps: [
      {
        stepNumber: 1,
        title: 'Inspect Step Drop-offs',
        content: 'Hover over any step to see exact conversion velocity and user accounts that dropped off.',
        targetElement: '#funnel-step-2',
        buttonText: 'Got It!',
        type: 'tooltip'
      }
    ]
  }
];

export const MOCK_FEEDBACK: FeedbackItem[] = [
  {
    id: 'fb-1',
    userName: 'Marcus Chen',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    accountName: 'Acme Cloud Dynamics',
    score: 10,
    category: 'promoter',
    tags: ['Adoption Boost', 'Great Support', 'Easy Flows'],
    comment: 'The in-app onboarding tours boosted our feature activation by 43% in just 3 weeks! Elena Rostova from CS has been super responsive.',
    sentiment: 'positive',
    csmAssigned: 'Elena Rostova',
    status: 'addressed',
    date: 'Oct 22, 2026'
  },
  {
    id: 'fb-2',
    userName: 'Chloe Dubois',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    accountName: 'FinPulse Systems',
    score: 4,
    category: 'detractor',
    tags: ['UI Friction', 'Slow Loading', 'Need Support'],
    comment: 'Dashboard loading latency feels sluggish with over 50k events. We had trouble configuring the Salesforce sync attribute schema.',
    sentiment: 'negative',
    csmAssigned: 'Liam Vance',
    status: 'open',
    date: 'Oct 21, 2026'
  },
  {
    id: 'fb-3',
    userName: 'Dr. Aris Vance',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    accountName: 'NovaScale BioTech',
    score: 10,
    category: 'promoter',
    tags: ['Resource Center', 'Self-Serve'],
    comment: 'Our team loves the embedded Resource Center. Having guides and announcements right inside the application eliminated half our support tickets.',
    sentiment: 'positive',
    csmAssigned: 'Elena Rostova',
    status: 'addressed',
    date: 'Oct 19, 2026'
  },
  {
    id: 'fb-4',
    userName: 'Keith O\'Connor',
    userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    accountName: 'SentryPay Global',
    score: 7,
    category: 'passive',
    tags: ['Pricing Tier', 'Feature Request: CSV'],
    comment: 'Good overall platform. We really want automated CSV export scheduling to our data lake without requiring a custom webhook integration.',
    sentiment: 'neutral',
    csmAssigned: 'Rachel Green',
    status: 'open',
    date: 'Oct 17, 2026'
  },
  {
    id: 'fb-5',
    userName: 'Hans Gruber',
    userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    accountName: 'Vortex Logistics',
    score: 3,
    category: 'detractor',
    tags: ['Onboarding Stall', 'Missing Training'],
    comment: 'Nobody on our operations team understands how to create funnels properly. We need an actual hands-on walkthrough with an expert.',
    sentiment: 'negative',
    csmAssigned: 'Liam Vance',
    status: 'open',
    date: 'Oct 15, 2026'
  },
  {
    id: 'fb-6',
    userName: 'Maya Lin',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    accountName: 'Luminary Media Tech',
    score: 10,
    category: 'promoter',
    tags: ['Upgrade Ready', 'Easy UI'],
    comment: 'Hands down the cleanest onboarding and customer success product we have tried. The visual builder was a game changer for our non-technical managers.',
    sentiment: 'positive',
    csmAssigned: 'Rachel Green',
    status: 'addressed',
    date: 'Oct 12, 2026'
  }
];

export const MOCK_SURVEYS: Survey[] = [
  {
    id: 'srv-1',
    title: 'Q3 Enterprise Product NPS & Sentiment',
    type: 'nps',
    responsesCount: 842,
    score: '+48 NPS',
    scoreNumeric: 48,
    status: 'active',
    dateCreated: 'Sep 01, 2026',
    targetSegment: 'Active users (> 5 sessions)'
  },
  {
    id: 'srv-2',
    title: 'Post-Onboarding CSAT (First 14 Days)',
    type: 'csat',
    responsesCount: 520,
    score: '4.6 / 5.0',
    scoreNumeric: 92,
    status: 'active',
    dateCreated: 'Aug 15, 2026',
    targetSegment: 'Completed Onboarding Tour'
  },
  {
    id: 'srv-3',
    title: 'Customer Effort Score (CES): Report Builder',
    type: 'ces',
    responsesCount: 310,
    score: '84% Easy',
    scoreNumeric: 84,
    status: 'active',
    dateCreated: 'Sep 20, 2026',
    targetSegment: 'Used Analytics Report Builder'
  },
  {
    id: 'srv-4',
    title: 'AI Copilot Beta Feedback',
    type: 'micro',
    responsesCount: 195,
    score: '88% Helpful',
    scoreNumeric: 88,
    status: 'ended',
    dateCreated: 'Jul 10, 2026',
    targetSegment: 'Beta Testers'
  }
];

export const MOCK_FEATURE_TAGS: FeatureTag[] = [
  {
    id: 'tag-1',
    name: 'Export Analytics Report (CSV/PDF)',
    selector: 'button#btn-export-report',
    section: 'Analytics & Reporting',
    monthlyClicks: 14850,
    uniqueUsers: 3420,
    adoptionPercentage: 68,
    trend: +14.2
  },
  {
    id: 'tag-2',
    name: 'Create Segment Rule',
    selector: 'button.btn-add-segment-rule',
    section: 'Audience Targeting',
    monthlyClicks: 8920,
    uniqueUsers: 1980,
    adoptionPercentage: 42,
    trend: +8.7
  },
  {
    id: 'tag-3',
    name: 'Publish In-App Experience Flow',
    selector: 'button#publish-flow-modal',
    section: 'Experience Builder',
    monthlyClicks: 5640,
    uniqueUsers: 1420,
    adoptionPercentage: 35,
    trend: +22.4
  },
  {
    id: 'tag-4',
    name: 'Invite Team Member to Workspace',
    selector: 'button[data-testid="invite-member"]',
    section: 'Account & Settings',
    monthlyClicks: 4180,
    uniqueUsers: 1110,
    adoptionPercentage: 29,
    trend: +5.1
  },
  {
    id: 'tag-5',
    name: 'Trigger Live Resource Center',
    selector: '#arquon-launcher-btn',
    section: 'Self-Serve Help',
    monthlyClicks: 28400,
    uniqueUsers: 6240,
    adoptionPercentage: 81,
    trend: +31.8
  }
];

export const MOCK_FUNNEL_STEPS: FunnelStep[] = [
  {
    stepNumber: 1,
    name: 'User Sign Up / Account Provisioned',
    visitors: 12400,
    conversionRate: 100,
    overallRate: 100,
    dropOffCount: 0
  },
  {
    stepNumber: 2,
    name: 'Completed Onboarding Welcome Tour',
    visitors: 9680,
    conversionRate: 78.1,
    overallRate: 78.1,
    dropOffCount: 2720
  },
  {
    stepNumber: 3,
    name: 'Tagged 1st Feature or Built Segment',
    visitors: 6380,
    conversionRate: 65.9,
    overallRate: 51.5,
    dropOffCount: 3300
  },
  {
    stepNumber: 4,
    name: 'Published Live In-App Experience',
    visitors: 4420,
    conversionRate: 69.3,
    overallRate: 35.6,
    dropOffCount: 1960
  },
  {
    stepNumber: 5,
    name: '30-Day Active Retention (Product Activated)',
    visitors: 3620,
    conversionRate: 81.9,
    overallRate: 29.2,
    dropOffCount: 800
  }
];

export const MOCK_RETENTION_COHORTS: CohortRow[] = [
  { cohortName: 'Aug 25 - Aug 31', userCount: 1420, weeks: [100, 78, 66, 59, 53, 49, 47, 45] },
  { cohortName: 'Sep 01 - Sep 07', userCount: 1580, weeks: [100, 81, 70, 62, 57, 52, 50, 48] },
  { cohortName: 'Sep 08 - Sep 14', userCount: 1640, weeks: [100, 83, 72, 65, 59, 55, 53, 0] },
  { cohortName: 'Sep 15 - Sep 21', userCount: 1720, weeks: [100, 84, 75, 68, 62, 58, 0, 0] },
  { cohortName: 'Sep 22 - Sep 28', userCount: 1890, weeks: [100, 86, 77, 71, 65, 0, 0, 0] },
  { cohortName: 'Sep 29 - Oct 05', userCount: 1950, weeks: [100, 87, 79, 73, 0, 0, 0, 0] },
  { cohortName: 'Oct 06 - Oct 12', userCount: 2110, weeks: [100, 89, 82, 0, 0, 0, 0, 0] },
  { cohortName: 'Oct 13 - Oct 19', userCount: 2240, weeks: [100, 91, 0, 0, 0, 0, 0, 0] },
];

export const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: 'int-1',
    name: 'Salesforce CRM',
    category: 'CRM',
    icon: '☁️',
    description: 'Bi-directional sync of Account Health Scores, ARR, Renewal Dates, and CSM touchpoints.',
    status: 'connected',
    lastSync: '10 mins ago',
    eventCount: '1.2M records synced'
  },
  {
    id: 'int-2',
    name: 'HubSpot',
    category: 'CRM',
    icon: '🧡',
    description: 'Sync customer contact properties, lifecycle stages, and trigger automated email follow-ups.',
    status: 'connected',
    lastSync: '25 mins ago',
    eventCount: '480k contacts synced'
  },
  {
    id: 'int-3',
    name: 'Segment (Twilio)',
    category: 'Analytics',
    icon: '🟩',
    description: 'Stream identify() and track() events directly into arQuonCX without duplicate code.',
    status: 'connected',
    lastSync: 'Live stream',
    eventCount: '4.8M events/day'
  },
  {
    id: 'int-4',
    name: 'Slack Alerts',
    category: 'Communication',
    icon: '💬',
    description: 'Receive real-time notifications for at-risk churn accounts, detractor NPS ratings, and goal completions.',
    status: 'connected',
    lastSync: 'Active (channel: #cs-alerts)',
    eventCount: '142 alerts this week'
  },
  {
    id: 'int-5',
    name: 'Mixpanel',
    category: 'Analytics',
    icon: '📊',
    description: 'Correlate in-app adoption flow completions with deep product conversion funnels.',
    status: 'disconnected',
    lastSync: 'Never'
  },
  {
    id: 'int-6',
    name: 'Zendesk Support',
    category: 'Support',
    icon: '🎧',
    description: 'Factor unresolved tickets and customer satisfaction scores into the unified health score calculation.',
    status: 'connected',
    lastSync: '1 hour ago',
    eventCount: '320 tickets tracked'
  },
  {
    id: 'int-7',
    name: 'Intercom Live Chat',
    category: 'Support',
    icon: '🔵',
    description: 'Embed your Intercom messenger directly inside the arQuonCX Resource Center drawer.',
    status: 'disconnected',
    lastSync: 'Never'
  },
  {
    id: 'int-8',
    name: 'Custom Webhooks',
    category: 'Data',
    icon: '⚡',
    description: 'Send JSON payloads on health score drops, NPS responses, or flow completion milestones.',
    status: 'connected',
    lastSync: '5 endpoints active',
    eventCount: '24k webhooks sent'
  }
];

export const MOCK_RESOURCE_MODULES: ResourceModule[] = [
  {
    id: 'mod-1',
    title: 'Getting Started Checklist',
    description: 'Gamified progress bar with step-by-step onboarding tasks for new users.',
    icon: 'CheckSquare',
    enabled: true,
    type: 'checklist',
    badge: 'Recommended'
  },
  {
    id: 'mod-2',
    title: 'Knowledge Base & Search',
    description: 'Allow users to search documentation and help articles directly in-app.',
    icon: 'Search',
    enabled: true,
    type: 'articles'
  },
  {
    id: 'mod-3',
    title: 'Product Releases & What\'s New',
    description: 'Announce new features, changelogs, and roadmap updates with badges.',
    icon: 'Sparkles',
    enabled: true,
    type: 'announcements',
    badge: 'New Update'
  },
  {
    id: 'mod-4',
    title: 'Interactive Guides Catalog',
    description: 'Let users trigger interactive walkthroughs and video tutorials on demand.',
    icon: 'BookOpen',
    enabled: true,
    type: 'guides'
  },
  {
    id: 'mod-5',
    title: 'Contact CS Concierge / Chat',
    description: 'Direct link to chat with assigned CSM or book a strategy call.',
    icon: 'MessageSquare',
    enabled: true,
    type: 'chat'
  }
];

export const MOCK_CHECKLIST_ITEMS: ResourceChecklistItem[] = [
  {
    id: 'chk-1',
    title: 'Install JavaScript Tracking Snippet',
    duration: '2 min',
    completed: true,
    actionText: 'Verify Tag'
  },
  {
    id: 'chk-2',
    title: 'Define Customer Health Score Weights',
    duration: '5 min',
    completed: true,
    actionText: 'Adjust Weights'
  },
  {
    id: 'chk-3',
    title: 'Publish First Interactive Onboarding Flow',
    duration: '4 min',
    completed: true,
    actionText: 'Launch Tour'
  },
  {
    id: 'chk-4',
    title: 'Connect CRM Integration (Salesforce / HubSpot)',
    duration: '3 min',
    completed: true,
    actionText: 'Configure'
  },
  {
    id: 'chk-5',
    title: 'Schedule Q4 Customer Health Review',
    duration: '1 min',
    completed: false,
    actionText: 'Open Calendar'
  }
];

export const MOCK_DELIVERY_PROJECTS: DeliveryProject[] = [
  {
    id: 'proj-1',
    accountId: 'acc-1',
    accountName: 'Acme Cloud Dynamics',
    domain: 'acmecloud.io',
    logo: '☁️',
    plan: 'Enterprise',
    arr: 420000,
    deliveryPhase: 'Phase 5: Production Go-Live',
    phaseProgress: 95,
    deliveryHealth: 'on-track',
    deliveryLead: {
      name: 'Marcus Thorne',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      title: 'Principal Implementation Architect'
    },
    accountCsm: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'
    },
    clientSponsor: {
      name: 'Sarah Jenkins',
      role: 'VP Cloud Platform',
      email: 'sjenkins@acmecloud.io'
    },
    baselineTargetDate: '2026-10-30',
    currentEstimatedDate: '2026-10-30',
    predictedGoLiveDate: '2026-10-29',
    varianceDays: -1,
    confidenceScore: 96,
    arrAtRisk: 0,
    hoursAllocated: 160,
    hoursBurned: 142,
    dailyStandupNote: 'Final smoke test on multi-tenant SSO completed. Scheduled production rollout cutover for Friday 9:00 PM EST with 0 downtime.',
    lastDailyUpdateDate: 'Today, 09:30 AM',
    weeklyHighlights: {
      completedThisWeek: [
        'Production database cluster telemetry ingestion verified (4.2M events/day)',
        'Sign-off received from Infosec and VP of Cloud Platform',
        'Executive onboarding tour published to live staging domain'
      ],
      plannedNextWeek: [
        'Full cutover to live production traffic',
        'Initiate 30-day executive hypercare monitoring cycle'
      ]
    },
    milestones: [
      { id: 'm1', name: 'Architecture & Infosec Review', phase: 'Phase 1', targetDate: '2026-09-10', actualDate: '2026-09-08', status: 'completed', owner: 'Marcus Thorne' },
      { id: 'm2', name: 'Telemetry SDK Integration', phase: 'Phase 2', targetDate: '2026-09-24', actualDate: '2026-09-22', status: 'completed', owner: 'Marcus Thorne' },
      { id: 'm3', name: 'Custom Health Score Weighting', phase: 'Phase 3', targetDate: '2026-10-08', actualDate: '2026-10-07', status: 'completed', owner: 'Elena Rostova' },
      { id: 'm4', name: 'UAT & Champion Signoff', phase: 'Phase 4', targetDate: '2026-10-22', actualDate: '2026-10-20', status: 'completed', owner: 'Sarah Jenkins' },
      { id: 'm5', name: 'Production Cutover & Launch', phase: 'Phase 5', targetDate: '2026-10-30', status: 'in-progress', owner: 'Marcus Thorne' },
      { id: 'm6', name: '30-Day Hypercare Review', phase: 'Phase 6', targetDate: '2026-11-30', status: 'pending', owner: 'Elena Rostova' }
    ]
  },
  {
    id: 'proj-2',
    accountId: 'acc-2',
    accountName: 'FinPulse Systems',
    domain: 'finpulse.co',
    logo: '💳',
    plan: 'Enterprise',
    arr: 280000,
    deliveryPhase: 'Phase 2: Data & SDK Pipeline',
    phaseProgress: 38,
    deliveryHealth: 'at-risk',
    deliveryLead: {
      name: 'Nathan Drake',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      title: 'Senior Integration Engineer'
    },
    accountCsm: {
      name: 'Liam Vance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    },
    clientSponsor: {
      name: 'Marcus Vance',
      role: 'VP Engineering & Infrastructure',
      email: 'm.vance@finpulse.co'
    },
    baselineTargetDate: '2026-11-15',
    currentEstimatedDate: '2026-11-20',
    predictedGoLiveDate: '2026-11-27',
    varianceDays: 12,
    confidenceScore: 58,
    arrAtRisk: 280000,
    hoursAllocated: 180,
    hoursBurned: 115,
    currentBlocker: 'Client internal SSO/IdP certificate authority mismatch is rejecting auth handshakes in staging.',
    csuiteActionNeeded: 'VP Engineering to host a 30-min technical peer bridge with FinPulse Infosec to approve certificate authority.',
    dailyStandupNote: 'FinPulse DevOps requested modified staging webhook headers. Engineering patch deployed, awaiting client security review.',
    lastDailyUpdateDate: 'Today, 10:15 AM',
    weeklyHighlights: {
      completedThisWeek: [
        'Postgres telemetry streaming connector configured',
        'Staging environment provisioned and seeded'
      ],
      plannedNextWeek: [
        'Resolve SSL certificate mismatch with FinPulse Infosec',
        'Verify end-to-end event throughput at 5,000 req/sec'
      ]
    },
    milestones: [
      { id: 'm1', name: 'SOC2 & Architecture Review', phase: 'Phase 1', targetDate: '2026-10-01', actualDate: '2026-10-03', status: 'completed', owner: 'Nathan Drake' },
      { id: 'm2', name: 'Telemetry SDK Integration', phase: 'Phase 2', targetDate: '2026-10-20', status: 'blocked', owner: 'Nathan Drake' },
      { id: 'm3', name: 'Data Pipeline Validation', phase: 'Phase 2', targetDate: '2026-10-31', status: 'in-progress', owner: 'Marcus Vance' },
      { id: 'm4', name: 'UAT & Staff Training', phase: 'Phase 4', targetDate: '2026-11-10', status: 'pending', owner: 'Liam Vance' },
      { id: 'm5', name: 'Go-Live Execution', phase: 'Phase 5', targetDate: '2026-11-15', status: 'pending', owner: 'Nathan Drake' }
    ]
  },
  {
    id: 'proj-3',
    accountId: 'acc-3',
    accountName: 'Vortex Logistics',
    domain: 'vortexlogistics.com',
    logo: '🚛',
    plan: 'Enterprise',
    arr: 510000,
    deliveryPhase: 'Phase 3: Workflows & Segment Config',
    phaseProgress: 52,
    deliveryHealth: 'critical',
    deliveryLead: {
      name: 'Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      title: 'Principal Solutions Architect'
    },
    accountCsm: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'
    },
    clientSponsor: {
      name: 'Hans Gruber',
      role: 'Chief Operating Officer & VP Logistics',
      email: 'hgruber@vortexlogistics.com'
    },
    baselineTargetDate: '2026-11-05',
    currentEstimatedDate: '2026-11-14',
    predictedGoLiveDate: '2026-11-23',
    varianceDays: 18,
    confidenceScore: 42,
    arrAtRisk: 510000,
    hoursAllocated: 220,
    hoursBurned: 175,
    currentBlocker: 'Legacy TMS (Transportation Management System) API rate-limiting blocks real-time driver telemetry.',
    csuiteActionNeeded: 'CEO sponsor-to-sponsor alignment meeting with Vortex COO Hans Gruber to sign off on a phased hybrid rollout.',
    dailyStandupNote: 'Engineered custom rate-limiting backoff buffer. Waiting on Vortex IT approval to test batch synchronization tonight.',
    lastDailyUpdateDate: 'Today, 08:45 AM',
    weeklyHighlights: {
      completedThisWeek: [
        'Discovered and documented 120 req/min TMS hard limit',
        'Implemented distributed Redis queue for asynchronous telemetry'
      ],
      plannedNextWeek: [
        'Secure C-Suite signoff on 5-minute delayed batching for non-critical telemetry',
        'Begin driver mobile app in-app adoption flow testing'
      ]
    },
    milestones: [
      { id: 'm1', name: 'Contract & Technical Scope', phase: 'Phase 1', targetDate: '2026-09-15', actualDate: '2026-09-15', status: 'completed', owner: 'Priya Patel' },
      { id: 'm2', name: 'Custom TMS API Connector', phase: 'Phase 2', targetDate: '2026-10-05', actualDate: '2026-10-18', status: 'completed', owner: 'Priya Patel' },
      { id: 'm3', name: 'Driver Workflow Provisioning', phase: 'Phase 3', targetDate: '2026-10-25', status: 'blocked', owner: 'Elena Rostova' },
      { id: 'm4', name: 'End-to-End Pilot Simulation', phase: 'Phase 4', targetDate: '2026-11-01', status: 'pending', owner: 'Hans Gruber' },
      { id: 'm5', name: 'Enterprise Fleet Rollout', phase: 'Phase 5', targetDate: '2026-11-05', status: 'pending', owner: 'Priya Patel' }
    ]
  },
  {
    id: 'proj-4',
    accountId: 'acc-4',
    accountName: 'Nexus AI Labs',
    domain: 'nexusai.tech',
    logo: '🤖',
    plan: 'Scale',
    arr: 190000,
    deliveryPhase: 'Phase 4: UAT & Pilot Validation',
    phaseProgress: 84,
    deliveryHealth: 'on-track',
    deliveryLead: {
      name: 'Clara Oswald',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      title: 'Implementation Consultant'
    },
    accountCsm: {
      name: 'Rachel Green',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'
    },
    clientSponsor: {
      name: 'Dr. Aris Vance',
      role: 'Head of AI Research & Product',
      email: 'aris@nexusai.tech'
    },
    baselineTargetDate: '2026-11-12',
    currentEstimatedDate: '2026-11-10',
    predictedGoLiveDate: '2026-11-08',
    varianceDays: -4,
    confidenceScore: 91,
    arrAtRisk: 0,
    hoursAllocated: 120,
    hoursBurned: 88,
    dailyStandupNote: 'Pilot cohorts completed 120 session test runs with 0 reported issues. Client signed off on all 4 onboarding flows.',
    lastDailyUpdateDate: 'Today, 11:00 AM',
    weeklyHighlights: {
      completedThisWeek: [
        'Completed full UAT checklist with 35 researcher beta testers',
        'Custom NPS trigger mapped to model execution success'
      ],
      plannedNextWeek: [
        'Executive delivery review and transition to live general availability'
      ]
    },
    milestones: [
      { id: 'm1', name: 'Scope & Data Dictionary', phase: 'Phase 1', targetDate: '2026-10-01', actualDate: '2026-09-28', status: 'completed', owner: 'Clara Oswald' },
      { id: 'm2', name: 'SDK Ingestion Setup', phase: 'Phase 2', targetDate: '2026-10-15', actualDate: '2026-10-12', status: 'completed', owner: 'Clara Oswald' },
      { id: 'm3', name: 'NPS & Survey Rules', phase: 'Phase 3', targetDate: '2026-10-25', actualDate: '2026-10-22', status: 'completed', owner: 'Rachel Green' },
      { id: 'm4', name: 'Researcher Pilot UAT', phase: 'Phase 4', targetDate: '2026-11-05', actualDate: '2026-10-26', status: 'completed', owner: 'Dr. Aris Vance' },
      { id: 'm5', name: 'Production Launch', phase: 'Phase 5', targetDate: '2026-11-12', status: 'in-progress', owner: 'Clara Oswald' }
    ]
  },
  {
    id: 'proj-5',
    accountId: 'acc-5',
    accountName: 'BioHealth Analytics',
    domain: 'biohealth.io',
    logo: '🧬',
    plan: 'Enterprise',
    arr: 340000,
    deliveryPhase: 'Phase 1: Architecture & Infosec',
    phaseProgress: 24,
    deliveryHealth: 'on-track',
    deliveryLead: {
      name: 'Nathan Drake',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      title: 'Senior Integration Engineer'
    },
    accountCsm: {
      name: 'Liam Vance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    },
    clientSponsor: {
      name: 'Dr. Elizabeth Hayes',
      role: 'Chief Medical Officer & VP Compliance',
      email: 'ehayes@biohealth.io'
    },
    baselineTargetDate: '2026-12-15',
    currentEstimatedDate: '2026-12-15',
    predictedGoLiveDate: '2026-12-18',
    varianceDays: 3,
    confidenceScore: 84,
    arrAtRisk: 0,
    hoursAllocated: 200,
    hoursBurned: 46,
    dailyStandupNote: 'SOC2 Type II exhibits and HIPAA Business Associate Agreement (BAA) signed off. Architecture kickoff workshop held yesterday.',
    lastDailyUpdateDate: 'Today, 09:00 AM',
    weeklyHighlights: {
      completedThisWeek: [
        'Security & HIPAA compliance audit cleared with 0 findings',
        'Customer implementation team assigned and scheduled'
      ],
      plannedNextWeek: [
        'Begin SDK tracking instrumentation on patient portal test bench'
      ]
    },
    milestones: [
      { id: 'm1', name: 'Infosec & HIPAA Signoff', phase: 'Phase 1', targetDate: '2026-10-25', actualDate: '2026-10-24', status: 'completed', owner: 'Nathan Drake' },
      { id: 'm2', name: 'SDK Ingestion Setup', phase: 'Phase 2', targetDate: '2026-11-10', status: 'in-progress', owner: 'Nathan Drake' },
      { id: 'm3', name: 'HIPAA Sanitization Rules', phase: 'Phase 3', targetDate: '2026-11-25', status: 'pending', owner: 'Liam Vance' },
      { id: 'm4', name: 'Clinical Staff UAT', phase: 'Phase 4', targetDate: '2026-12-05', status: 'pending', owner: 'Dr. Elizabeth Hayes' },
      { id: 'm5', name: 'Enterprise Go-Live', phase: 'Phase 5', targetDate: '2026-12-15', status: 'pending', owner: 'Nathan Drake' }
    ]
  },
  {
    id: 'proj-6',
    accountId: 'acc-6',
    accountName: 'Quantum Retail Global',
    domain: 'quantumretail.com',
    logo: '🛍️',
    plan: 'Scale',
    arr: 200000,
    deliveryPhase: 'Phase 6: 30-Day Hypercare',
    phaseProgress: 100,
    deliveryHealth: 'completed',
    deliveryLead: {
      name: 'Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      title: 'Principal Solutions Architect'
    },
    accountCsm: {
      name: 'Rachel Green',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'
    },
    clientSponsor: {
      name: 'Dave Miller',
      role: 'VP eCommerce & Merchandising',
      email: 'dmiller@quantumretail.com'
    },
    baselineTargetDate: '2026-10-10',
    currentEstimatedDate: '2026-10-10',
    predictedGoLiveDate: '2026-10-10',
    varianceDays: 0,
    confidenceScore: 100,
    arrAtRisk: 0,
    hoursAllocated: 110,
    hoursBurned: 108,
    dailyStandupNote: 'Day 16 of 30-day hypercare. Daily active users reached 94% adoption. Handover to CSM steady with 0 open support escalations.',
    lastDailyUpdateDate: 'Today, 11:30 AM',
    weeklyHighlights: {
      completedThisWeek: [
        'Live production rollout across 40 regional retail brand sites',
        'Customer CSAT score recorded at 9.4/10'
      ],
      plannedNextWeek: [
        'Final hypercare signoff review and full transition to standard CSM care'
      ]
    },
    milestones: [
      { id: 'm1', name: 'Architecture Review', phase: 'Phase 1', targetDate: '2026-09-01', actualDate: '2026-08-30', status: 'completed', owner: 'Priya Patel' },
      { id: 'm2', name: 'Shopify / Magento Integration', phase: 'Phase 2', targetDate: '2026-09-15', actualDate: '2026-09-14', status: 'completed', owner: 'Priya Patel' },
      { id: 'm3', name: 'Flows & NPS Setup', phase: 'Phase 3', targetDate: '2026-09-28', actualDate: '2026-09-27', status: 'completed', owner: 'Rachel Green' },
      { id: 'm4', name: 'Pilot Rollout', phase: 'Phase 4', targetDate: '2026-10-05', actualDate: '2026-10-04', status: 'completed', owner: 'Dave Miller' },
      { id: 'm5', name: 'Full Launch', phase: 'Phase 5', targetDate: '2026-10-10', actualDate: '2026-10-10', status: 'completed', owner: 'Priya Patel' },
      { id: 'm6', name: 'Hypercare Signoff', phase: 'Phase 6', targetDate: '2026-11-10', status: 'in-progress', owner: 'Rachel Green' }
    ]
  }
];


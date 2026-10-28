import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  HeartHandshake, 
  Layers, 
  ShieldCheck, 
  Star, 
  Users, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft,
  TrendingUp, 
  Zap, 
  Globe, 
  Quote, 
  Check, 
  MousePointerClick,
  Play,
  Pause,
  Activity,
  Smile,
  Shield,
  Target,
  Search,
  Video,
  Sliders,
  RotateCcw,
  ThumbsUp,
  X,
  ExternalLink
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { BrandLogo } from '../common/BrandLogo';

interface LandingPageProps {
  onGoToLogin: () => void;
  onEnterApp: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToSecurity?: () => void;
}

const MARQUEE_LOGOS_TRACK1 = [
  { name: 'Adobe Experience', tag: 'Analytics', icon: '🅰️' },
  { name: 'Miro Collaboration', tag: 'Visual Work', icon: '🟡' },
  { name: 'Skedulo Workforce', tag: 'Deskless CS', icon: '⚡' },
  { name: 'McGraw Hill', tag: 'EdTech', icon: '📚' },
  { name: 'Visme Design', tag: 'Visual Content', icon: '🎨' },
  { name: 'Databox Metrics', tag: 'BI Dashboards', icon: '📊' },
  { name: 'Clearbit Enrichment', tag: 'B2B Intel', icon: '🔍' },
  { name: 'RocketReach', tag: 'Prospecting', icon: '🚀' },
  { name: 'Thryv Software', tag: 'Small Biz', icon: '💼' },
];

const MARQUEE_LOGOS_TRACK2 = [
  { name: 'Pendo Adoption', tag: 'Product Analytics', icon: '🟣' },
  { name: 'Heap Automated', tag: 'Telemetry', icon: '📈' },
  { name: 'Typeform Surveys', tag: 'Feedback', icon: '📝' },
  { name: 'Leadfeeder IP', tag: 'B2B Signals', icon: '📡' },
  { name: 'Kudo Enterprise', tag: 'Translation', icon: '🌐' },
  { name: 'Kontentino SaaS', tag: 'Social Ops', icon: '⏱️' },
  { name: 'Outfunnel Sync', tag: 'RevOps', icon: '🔄' },
  { name: 'Segment CDP', tag: 'Events', icon: '🟢' },
  { name: 'Mixpanel Data', tag: 'Retention', icon: '📉' },
];

const FEATURE_CAROUSEL_TABS = [
  {
    id: 'onboarding',
    tabLabel: 'In-App Onboarding Tours',
    tag: 'No-Code Adoption',
    title: 'Guide Users to Their Aha! Moment with Interactive In-App Tours',
    description: 'Build modals, tooltips, checklists, and progressive walkthroughs without waiting for engineering sprints. Target flows based on user role, plan tier, and behavioral triggers.',
    statNumber: '+43%',
    statLabel: 'Feature Activation Rate in 30 Days',
    accentColor: 'indigo',
  },
  {
    id: 'churn',
    tabLabel: 'Predictive Churn Radar',
    tag: 'Composite Health',
    title: 'Detect At-Risk Enterprise Accounts 90 Days Before Renewal',
    description: 'Unify real-time product telemetry, support ticket velocity, NPS sentiment, and champion activity into an algorithmic 0-100 Customer Health Score with automated CSM playbooks.',
    statNumber: '32%',
    statLabel: 'Gross Renewal Churn Reduction',
    accentColor: 'emerald',
  },
  {
    id: 'surveys',
    tabLabel: 'In-App Microsurveys & NPS',
    tag: 'AI Sentiment Analysis',
    title: 'Capture Actionable Feedback at the Peak Moment of Value',
    description: 'Trigger 1-click in-app NPS and CSAT microsurveys while users are active. Automated AI tags sentiment and routes feedback to Slack so CSMs can close the loop instantly.',
    statNumber: '+48',
    statLabel: 'Net Promoter Score (68% Response Rate)',
    accentColor: 'amber',
  },
  {
    id: 'resource',
    tabLabel: 'Self-Service Resource Hub',
    tag: 'Ticket Deflection',
    title: 'Deflect 50% of Support Tickets with an Embedded In-App Center',
    description: 'Embed searchable knowledge base guides, interactive onboarding checklists, and video tutorials directly inside your web app without cluttering the screen.',
    statNumber: '54%',
    statLabel: 'Tier-1 Ticket Deflection Rate',
    accentColor: 'sky',
  },
  {
    id: 'analytics',
    tabLabel: 'Funnels & Retention Cohorts',
    tag: 'Drop-off Intelligence',
    title: 'Pinpoint Where Users Drop Off & Trigger Automated Re-Engagement',
    description: 'Analyze multi-step adoption funnels, track custom feature click tags, and monitor 8-week cohort retention heatmaps to eliminate onboarding drop-off bottlenecks.',
    statNumber: '3.8x',
    statLabel: 'Faster Onboarding Bottleneck Discovery',
    accentColor: 'violet',
  },
];

const TESTIMONIALS_DATA = [
  {
    quote: "The in-app onboarding tours boosted our feature activation by 43% in just 3 weeks. Being able to track which enterprise accounts haven't logged in and trigger proactive check-ins has saved our renewals team hundreds of hours.",
    author: "Marcus Chen",
    role: "VP of Product",
    company: "Acme Cloud Dynamics",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&crop=face&q=80",
    metricValue: "+43%",
    metricLabel: "Feature Activation Rate",
    tier: "Enterprise Tier · $150k ARR",
    rating: 5,
  },
  {
    quote: "Our customers love the embedded Resource Center. Having guides, release notes, and onboarding checklists right inside our web application eliminated half our Tier-1 support tickets immediately.",
    author: "Dr. Aris Vance",
    role: "Chief of Informatics",
    company: "NovaScale BioTech",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&crop=face&q=80",
    metricValue: "-50%",
    metricLabel: "Support Ticket Deflection",
    tier: "Scale Tier · 10/10 NPS Promoter",
    rating: 5,
  },
  {
    quote: "arQuonCX gave our CS and product growth teams instant visibility into user drop-offs and at-risk accounts. We reduced renewal churn by 32% within our first quarter and automated our quarterly QBR prep.",
    author: "Elena Rostova",
    role: "Lead Customer Success Manager",
    company: "CloudScale International",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&crop=face&q=80",
    metricValue: "32%",
    metricLabel: "Renewal Churn Reduction",
    tier: "Enterprise Tier · 24 Enterprise CSMs",
    rating: 5,
  },
  {
    quote: "We replaced three disjointed tools with arQuonCX. Deploying targeted in-app walkthroughs and automated NPS sentiment tagging without engineering dependencies accelerated our activation velocity by 4.2x.",
    author: "Sophia Lindqvist",
    role: "Director of Product Growth",
    company: "FinPulse Global",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&crop=face&q=80",
    metricValue: "4.2x",
    metricLabel: "Activation Velocity",
    tier: "Growth Tier · 42,000 MAU",
    rating: 5,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToLogin,
  onEnterApp,
  onNavigateToPrivacy,
  onNavigateToTerms,
  onNavigateToSecurity,
}) => {
  // 1. Feature Carousel State (Userpilot-style tabbed interactive slider with auto-timer)
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const [isFeatureCarouselPaused, setIsFeatureCarouselPaused] = useState(false);
  const [featureProgressKey, setFeatureProgressKey] = useState(0);

  // 2. Testimonial Carousel State
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isTestimonialPaused, setIsTestimonialPaused] = useState(false);

  // 3. Live In-App Walkthrough Experience Modal on the Page
  const [isLiveDemoActive, setIsLiveDemoActive] = useState(false);
  const [demoTourStep, setDemoTourStep] = useState(1);

  // 4. Interactive Simulation Playground States
  const [tourSimStep, setTourSimStep] = useState(1);
  const [simulatedHealth, setSimulatedHealth] = useState(88);
  const [simulatedNpsScore, setSimulatedNpsScore] = useState<number | null>(10);
  const [resourceSearch, setResourceSearch] = useState('');
  const [checkedChecklist, setCheckedChecklist] = useState<{ [key: string]: boolean }>({
    'c1': true,
    'c2': true,
    'c3': false,
    'c4': false,
  });

  // Auto-advance Feature Carousel every 5.5 seconds (when not paused)
  useEffect(() => {
    if (isFeatureCarouselPaused) return;
    const timer = setInterval(() => {
      setActiveFeatureTab((prev) => (prev + 1) % FEATURE_CAROUSEL_TABS.length);
      setFeatureProgressKey((k) => k + 1);
    }, 5500);
    return () => clearInterval(timer);
  }, [isFeatureCarouselPaused, activeFeatureTab]);

  // Auto-advance Testimonial Carousel every 5 seconds (when not paused)
  useEffect(() => {
    if (isTestimonialPaused) return;
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isTestimonialPaused]);

  // Reset timer on manual tab click
  const handleSelectFeatureTab = (index: number) => {
    setActiveFeatureTab(index);
    setFeatureProgressKey((k) => k + 1);
  };

  const currentTab = FEATURE_CAROUSEL_TABS[activeFeatureTab];
  const currentTestimonial = TESTIMONIALS_DATA[activeTestimonial];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B19] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-150">
      {/* 1. Marketing Navigation */}
      <nav className="border-b border-slate-200/80 dark:border-[#1E2C4F] bg-white/90 dark:bg-[#0A1024]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <BrandLogo
            size="md"
            badgeText="Enterprise Suite"
            subtitle="Customer Success & Product Adoption"
            onClick={onEnterApp}
          />

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Platform Tours</a>
            <a href="#personas" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Solutions</a>
            <a href="#testimonials" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Customers</a>
            <a href="#modules" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Modules</a>
          </div>

          {/* Action Buttons & Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={onGoToLogin}
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131F3B] rounded-xl transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onEnterApp}
              className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch CS App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section: Two-Column Layout with Face-Centered Human Photography */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-24 px-6 border-b border-slate-200 dark:border-[#1E2C4F]">
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-violet-500/10 dark:bg-blue-600/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>All-In-One Product Growth & Customer Success Platform</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Drive Product Adoption & <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-indigo-400 dark:via-violet-300 dark:to-cyan-400">
                Prevent Churn Before Renewals.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-xl">
              Unify account telemetry, predict customer churn with composite health scoring, deploy engaging in-app walkthroughs, and analyze NPS sentiment in real time.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={onEnterApp}
                className="px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Live CS Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setIsLiveDemoActive(true); setDemoTourStep(1); }}
                className="px-6 py-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
                <span>Test In-App Tour Right Now</span>
              </button>
              <button
                onClick={onGoToLogin}
                className="px-5 py-3.5 rounded-xl bg-white dark:bg-[#0F182E] hover:bg-slate-50 dark:hover:bg-[#152342] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-[#24365D] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <span>Sign In</span>
              </button>
            </div>

            {/* Human Social Proof Avatars (Properly Centered on Faces) */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-2.5 overflow-hidden p-0.5">
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-[#070B19] object-cover object-top"
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&crop=face&q=80"
                  alt="Elena Rostova - Lead CSM"
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-[#070B19] object-cover object-top"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&crop=face&q=80"
                  alt="Liam Vance - Enterprise CSM"
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-[#070B19] object-cover object-top"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&crop=face&q=80"
                  alt="Marcus Chen - VP Product"
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-[#070B19] object-cover object-top"
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&crop=face&q=80"
                  alt="Sarah Miller - Growth Lead"
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-[#070B19] object-cover object-top"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&crop=face&q=80"
                  alt="Chloe Dubois - Director of CX"
                />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 ml-1">4.9 / 5</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Trusted by 1,400+ CS & Product leaders</span>
              </div>
            </div>
          </div>

          {/* Right Column: Beautifully Framed Human Portrait with Cleanly Positioned Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-indigo-100 dark:border-[#223358] bg-white dark:bg-[#0E172A] p-3">
              {/* Main Human Image: Centered on Face */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-100 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&auto=format&fit=crop&crop=faces&q=80"
                  alt="Elena Rostova, Customer Success Leader"
                  className="w-full h-full object-cover object-top filter brightness-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Person Label at Bottom of Photo */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Active CS Session</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">Elena Rostova</h3>
                  <p className="text-xs text-slate-300">Lead CSM · arQuonCX Customer Success Team</p>
                </div>
              </div>

              {/* Floating Stat Badge 1 (Cleanly Anchored Outside the Face, Top Right) */}
              <div className="absolute -top-3 -right-3 bg-white dark:bg-[#111C35] p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-[#223358] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Account Health</span>
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">92 / 100 Healthy</p>
                </div>
              </div>

              {/* Floating Stat Badge 2 (Bottom Left, Cleanly Aligned) */}
              <div className="absolute -bottom-3 -left-3 bg-white dark:bg-[#111C35] p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-[#223358] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Adoption Rate</span>
                  <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">+78.4% MoM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Infinite Moving Logo Marquee Carousel (Exact Userpilot style) */}
      <section className="py-12 border-b border-slate-200 dark:border-[#1E2C4F] bg-white/60 dark:bg-[#0A1024]/60 overflow-hidden relative">
        <div className="max-w-7xl mx-auto text-center mb-6 px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Trusted by fast-growing SaaS leaders to drive activation, feature adoption & retention
          </p>
        </div>

        {/* Gradient edge masks for sleek fade out */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-white dark:from-[#070B19] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-l from-white dark:from-[#070B19] to-transparent z-10" />

        {/* Track 1: Moving Left */}
        <div className="flex overflow-hidden py-2 select-none">
          <div className="animate-marquee flex items-center gap-12 sm:gap-16 pr-12 sm:pr-16">
            {MARQUEE_LOGOS_TRACK1.map((logo, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold text-sm tracking-tight transition-colors cursor-pointer shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#111C35] flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200/60 dark:border-slate-800">
                  {logo.icon}
                </div>
                <span>{logo.name}</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#111C35] text-slate-500 dark:text-slate-400">
                  {logo.tag}
                </span>
              </div>
            ))}
            {/* Duplicate for seamless infinite loop */}
            {MARQUEE_LOGOS_TRACK1.map((logo, i) => (
              <div
                key={`dup1-${i}`}
                className="flex items-center gap-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold text-sm tracking-tight transition-colors cursor-pointer shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#111C35] flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200/60 dark:border-slate-800">
                  {logo.icon}
                </div>
                <span>{logo.name}</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#111C35] text-slate-500 dark:text-slate-400">
                  {logo.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Track 2: Moving Reverse / Right */}
        <div className="flex overflow-hidden py-2 select-none mt-2">
          <div className="animate-marquee-reverse flex items-center gap-12 sm:gap-16 pr-12 sm:pr-16">
            {MARQUEE_LOGOS_TRACK2.map((logo, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold text-sm tracking-tight transition-colors cursor-pointer shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#111C35] flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200/60 dark:border-slate-800">
                  {logo.icon}
                </div>
                <span>{logo.name}</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#111C35] text-slate-500 dark:text-slate-400">
                  {logo.tag}
                </span>
              </div>
            ))}
            {/* Duplicate for seamless infinite loop */}
            {MARQUEE_LOGOS_TRACK2.map((logo, i) => (
              <div
                key={`dup2-${i}`}
                className="flex items-center gap-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold text-sm tracking-tight transition-colors cursor-pointer shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#111C35] flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200/60 dark:border-slate-800">
                  {logo.icon}
                </div>
                <span>{logo.name}</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#111C35] text-slate-500 dark:text-slate-400">
                  {logo.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Interactive Auto-Advancing Feature Showcase Carousel (Signature Userpilot-style Tour) */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-b border-slate-200 dark:border-[#1E2C4F]">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Interactive Platform Walkthrough</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            See How arQuonCX Drives Product Growth
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Click through our 5 core modules or watch the auto-advancing live simulation below.
          </p>
        </div>

        {/* Carousel Tabs with Animated Progress Fill Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-slate-200 dark:border-[#1E2C4F]">
          <div className="flex items-center gap-2">
            {FEATURE_CAROUSEL_TABS.map((tab, idx) => {
              const isActive = activeFeatureTab === idx;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectFeatureTab(idx)}
                  className={`relative px-4 py-3 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#111C35] text-indigo-600 dark:text-white shadow-md border border-indigo-200 dark:border-indigo-800'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111C35]/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    {tab.tabLabel}
                  </span>

                  {/* Auto-advancing Timer Fill Bar */}
                  {isActive && !isFeatureCarouselPaused && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div key={featureProgressKey} className="h-full bg-indigo-600 dark:bg-indigo-400 animate-progress-fill" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 hidden sm:inline">
              0{activeFeatureTab + 1} / 0{FEATURE_CAROUSEL_TABS.length}
            </span>
            <button
              onClick={() => handleSelectFeatureTab((activeFeatureTab - 1 + FEATURE_CAROUSEL_TABS.length) % FEATURE_CAROUSEL_TABS.length)}
              className="p-2 rounded-xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] hover:bg-slate-50 dark:hover:bg-[#172649] transition-colors cursor-pointer"
              title="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
            <button
              onClick={() => setIsFeatureCarouselPaused(!isFeatureCarouselPaused)}
              className="p-2 rounded-xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] hover:bg-slate-50 dark:hover:bg-[#172649] transition-colors cursor-pointer"
              title={isFeatureCarouselPaused ? "Resume auto-play" : "Pause auto-play"}
            >
              {isFeatureCarouselPaused ? (
                <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Pause className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              )}
            </button>
            <button
              onClick={() => handleSelectFeatureTab((activeFeatureTab + 1) % FEATURE_CAROUSEL_TABS.length)}
              className="p-2 rounded-xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] hover:bg-slate-50 dark:hover:bg-[#172649] transition-colors cursor-pointer"
              title="Next slide"
            >
              <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
          </div>
        </div>

        {/* Feature Carousel Active Slide Body */}
        <div
          onMouseEnter={() => setIsFeatureCarouselPaused(true)}
          onMouseLeave={() => setIsFeatureCarouselPaused(false)}
          className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-[#0E172A] p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-[#1E2C4F] shadow-xl"
        >
          {/* Left Side: Copy & Verified Metrics */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
              <span>{currentTab.tag}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {currentTab.title}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {currentTab.description}
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111C35] border border-slate-200/80 dark:border-[#1F3057] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Verified Business Impact</span>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{currentTab.statNumber}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{currentTab.statLabel}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onEnterApp}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Try this in Live App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> No code required
              </span>
            </div>
          </div>

          {/* Right Side: Live Interactive Simulation Playground */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-[#070B19] rounded-2xl border border-slate-200 dark:border-[#1F3057] p-6 shadow-inner relative overflow-hidden">
            {/* Ambient header bar for mockup */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1A2644] text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-mono text-[11px] text-slate-500 ml-2">arQuonCX SDK Live Interactive Canvas</span>
              </div>
              <span className="font-bold text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                ● Live Interactive
              </span>
            </div>

            {/* TAB 1: Interactive Onboarding Flow Simulator */}
            {activeFeatureTab === 0 && (
              <div className="py-6 space-y-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Step {tourSimStep} of 3
                    </span>
                    <button
                      onClick={() => setTourSimStep(1)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>

                  {tourSimStep === 1 && (
                    <div className="space-y-2 animate-in fade-in">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        Welcome to Acme Cloud! Let's get you set up 🎉
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        This modal triggered because you are an Enterprise Admin who logged in for the first time.
                      </p>
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setTourSimStep(2)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <span>Next: Pin Feature</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {tourSimStep === 2 && (
                    <div className="space-y-2 animate-in fade-in">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        Interactive Feature Spotlight: Health Score
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Notice how the tooltip points directly to the UI button without taking the user to a separate documentation page.
                      </p>
                      <div className="pt-2 flex justify-between items-center">
                        <button
                          onClick={() => setTourSimStep(1)}
                          className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          onClick={() => setTourSimStep(3)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <span>Next: Complete Flow</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {tourSimStep === 3 && (
                    <div className="space-y-2 text-center py-2 animate-in fade-in">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 mx-auto font-bold text-xl">
                        ✓
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        Tour Completed! Activation Recorded
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Event `tour_completed` was instantly dispatched to your Customer Health algorithm.
                      </p>
                      <button
                        onClick={() => setTourSimStep(1)}
                        className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Restart Interactive Flow Simulation ↺
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Interactive Health & Churn Slider */}
            {activeFeatureTab === 1 && (
              <div className="py-6 space-y-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Drag Health Score to Simulate Real-Time Risk
                    </span>
                    <span className={`text-base font-black px-3 py-1 rounded-xl border ${
                      simulatedHealth >= 75
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 border-emerald-200 dark:border-emerald-800'
                        : simulatedHealth >= 50
                        ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-950/70 text-rose-600 border-rose-200 dark:border-rose-800'
                    }`}>
                      {simulatedHealth} / 100
                    </span>
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={simulatedHealth}
                    onChange={(e) => setSimulatedHealth(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />

                  {/* Dynamic Playbook Trigger Output */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#1E2C4F] text-xs space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {simulatedHealth >= 75 ? '🟢 Tier Status: Healthy Account' : simulatedHealth >= 50 ? '🟡 Tier Status: At-Risk Account' : '🔴 Tier Status: Critical Churn Warning'}
                    </span>
                    <p className="text-slate-500 dark:text-slate-400">
                      {simulatedHealth >= 75
                        ? 'Automated Playbook: Triggered expansion upsell prompt (Add 20 team seats).'
                        : simulatedHealth >= 50
                        ? 'Automated Playbook: Warning email sent to Lead CSM + scheduled 30-day health check.'
                        : 'Automated Playbook: High Priority Alert posted to Slack #churn-prevention + CEO notified.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Interactive In-App NPS Rating Box */}
            {activeFeatureTab === 2 && (
              <div className="py-6 space-y-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] shadow-sm space-y-4 text-center">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    How likely are you to recommend arQuonCX to a colleague?
                  </p>

                  <div className="flex justify-center gap-1.5 flex-wrap">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setSimulatedNpsScore(num)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          simulatedNpsScore === num
                            ? 'bg-indigo-600 text-white scale-110 shadow-md ring-2 ring-indigo-400'
                            : 'bg-slate-100 dark:bg-[#111C35] text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  {simulatedNpsScore !== null && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#1E2C4F] text-xs text-left space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          AI Sentiment Tag: {simulatedNpsScore >= 9 ? '🌟 Promoter (+100)' : simulatedNpsScore >= 7 ? '⚖️ Passive' : '🚨 Detractor'}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">1-Click Close The Loop</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">
                        {simulatedNpsScore >= 9
                          ? 'Automated prompt: "Thank you! Would you mind sharing a quick review on G2?"'
                          : simulatedNpsScore >= 7
                          ? 'Automated prompt: "What is one feature we could add to make arQuonCX a 10 for you?"'
                          : 'Automated prompt: "We are sorry to hear that. A senior Customer Success Director will reach out within 2 hours."'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: Interactive Embedded Resource Center */}
            {activeFeatureTab === 3 && (
              <div className="py-6 space-y-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] shadow-sm space-y-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search in-app guides, checklists, API docs..."
                      value={resourceSearch}
                      onChange={(e) => setResourceSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#1E2C4F] rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { id: 'c1', title: 'Complete Executive Health Checklist' },
                      { id: 'c2', title: 'Invite 3 Customer Success Team Members' },
                      { id: 'c3', title: 'Connect Salesforce CRM Integration' },
                      { id: 'c4', title: 'Deploy First In-App Walkthrough' },
                    ]
                      .filter((item) => item.title.toLowerCase().includes(resourceSearch.toLowerCase()))
                      .map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setCheckedChecklist({ ...checkedChecklist, [item.id]: !checkedChecklist[item.id] })}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111C35] text-xs cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                        >
                          <input
                            type="checkbox"
                            checked={!!checkedChecklist[item.id]}
                            onChange={() => {}}
                            className="rounded text-indigo-600 cursor-pointer"
                          />
                          <span className={checkedChecklist[item.id] ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                            {item.title}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Interactive Funnel Analytics */}
            {activeFeatureTab === 4 && (
              <div className="py-6 space-y-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] shadow-sm space-y-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Product Onboarding Drop-off Funnel (10,000 Users)
                  </span>

                  <div className="space-y-2">
                    {[
                      { step: '1. Registered Account', count: '10,000 (100%)', width: 'w-full', bg: 'bg-indigo-600' },
                      { step: '2. Started Welcome Tour', count: '7,400 (74%)', width: 'w-[74%]', bg: 'bg-indigo-500' },
                      { step: '3. Connected Salesforce', count: '4,800 (48%)', width: 'w-[48%]', bg: 'bg-indigo-400' },
                      { step: '4. Active Retention Week 4', count: '3,900 (39%)', width: 'w-[39%]', bg: 'bg-emerald-500' },
                    ].map((row, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          <span>{row.step}</span>
                          <span>{row.count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-[#111C35] overflow-hidden">
                          <div className={`h-full ${row.width} ${row.bg} rounded-full transition-all duration-500`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Persona Cards: "Built For Every Role" */}
      <section id="personas" className="py-20 px-6 max-w-7xl mx-auto border-b border-slate-200 dark:border-[#1E2C4F]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <span>Specialized Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Built For Modern Product & Customer Teams
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Empower every department to deliver exceptional onboarding, improve product adoption, and protect ARR renewals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Persona 1: Customer Success Managers */}
          <div className="bg-white dark:bg-[#0E172A] rounded-3xl border border-slate-200 dark:border-[#1E2C4F] overflow-hidden shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between group">
            <div>
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&crop=face&q=80"
                  alt="Customer Success Manager"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Customer Success Managers
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Account 360° & Churn Prediction
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Identify at-risk enterprise accounts 60 days before contract renewals. Track license seat consumption, log CSM notes, and schedule executive QBRs.
                </p>
                <div className="mt-4 space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>4-factor health score (Usage, Support, NPS, Champion)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Real-time Slack notifications for at-risk accounts</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={onEnterApp}
                className="w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-200 dark:border-indigo-800"
              >
                <span>Explore Accounts 360°</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Persona 2: Product & Growth Managers */}
          <div className="bg-white dark:bg-[#0E172A] rounded-3xl border border-slate-200 dark:border-[#1E2C4F] overflow-hidden shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between group">
            <div>
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&crop=face&q=80"
                  alt="Product Manager"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Product & Growth Leaders
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  No-Code In-App Walkthroughs
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Build modal announcements, guided spotlights, and interactive onboarding checklists in minutes without developer dependencies.
                </p>
                <div className="mt-4 space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Visual flow builder with instant live simulator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Audience segmentation by plan, activity, and role</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={onEnterApp}
                className="w-full py-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-violet-200 dark:border-violet-800"
              >
                <span>Try Flow Simulator</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Persona 3: Customer Operations */}
          <div className="bg-white dark:bg-[#0E172A] rounded-3xl border border-slate-200 dark:border-[#1E2C4F] overflow-hidden shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between group">
            <div>
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=800&auto=format&fit=crop&crop=face&q=80"
                  alt="Customer Operations"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Customer Operations & Support
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Self-Service Resource Hub
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Deflect recurring support tickets by giving users instant in-app access to searchable documentation, onboarding tasks, and release updates.
                </p>
                <div className="mt-4 space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Floating launcher with custom brand styling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Embedded ZenDesk & Intercom chat connectors</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={onEnterApp}
                className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-200 dark:border-emerald-800"
              >
                <span>View Resource Center</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Moving Customer Stories & Testimonial Carousel */}
      <section id="testimonials" className="py-20 px-6 max-w-7xl mx-auto border-b border-slate-200 dark:border-[#1E2C4F]">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Proven Customer Success ROI</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Trusted By High-Growth SaaS Teams
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Real Customer Success and Product leaders on how arQuonCX eliminated renewal surprises.
          </p>
        </div>

        {/* Dynamic Testimonial Carousel Card with Sliding Animation */}
        <div
          onMouseEnter={() => setIsTestimonialPaused(true)}
          onMouseLeave={() => setIsTestimonialPaused(false)}
          className="relative max-w-4xl mx-auto"
        >
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] shadow-xl flex flex-col justify-between transition-all">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {currentTestimonial.metricValue} {currentTestimonial.metricLabel}
                </span>
              </div>

              <blockquote className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed italic">
                "{currentTestimonial.quote}"
              </blockquote>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-[#1A2644]">
              <div className="flex items-center gap-4">
                <img
                  src={currentTestimonial.avatar}
                  alt={currentTestimonial.author}
                  className="w-14 h-14 rounded-full object-cover object-top ring-2 ring-indigo-500 shrink-0"
                />
                <div>
                  <p className="font-bold text-base text-slate-900 dark:text-white">{currentTestimonial.author}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{currentTestimonial.role} • {currentTestimonial.company}</p>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> {currentTestimonial.tier}
                  </span>
                </div>
              </div>

              {/* Prev / Next Carousel Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setActiveTestimonial((activeTestimonial - 1 + TESTIMONIALS_DATA.length) % TESTIMONIALS_DATA.length)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#111C35] hover:bg-slate-200 dark:hover:bg-[#172649] transition-colors cursor-pointer"
                  title="Previous testimonial"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1.5 px-2">
                  {TESTIMONIALS_DATA.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setActiveTestimonial(dotIdx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeTestimonial === dotIdx
                          ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                          : 'w-2 bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setActiveTestimonial((activeTestimonial + 1) % TESTIMONIALS_DATA.length)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#111C35] hover:bg-slate-200 dark:hover:bg-[#172649] transition-colors cursor-pointer"
                  title="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Feature Modules Grid */}
      <section id="modules" className="py-20 px-6 max-w-7xl mx-auto border-b border-slate-200 dark:border-[#1E2C4F]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Complete Product Growth Suite</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            6 Specialized Modules in One Platform
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Everything your Customer Success and Product team needs to scale customer retention.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'No-Code Adoption Flows',
              desc: 'Design modals, tooltips, slideouts, and checklists. Preview them live in the built-in simulator canvas.',
              tag: 'Interactive Builder',
              tagColor: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
              icon: '✨'
            },
            {
              title: 'Account 360° CRM',
              desc: 'Unified health scoring across product usage, support tickets, NPS ratings, and champion engagement.',
              tag: 'Predictive Health',
              tagColor: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
              icon: '🛡️'
            },
            {
              title: 'Users & Smart Segments',
              desc: 'Segment power users, passive accounts, and at-risk churn profiles with behavioral telemetry rules.',
              tag: 'Audience Engine',
              tagColor: 'bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
              icon: '👥'
            },
            {
              title: 'Product Funnels & Cohorts',
              desc: 'Track 8-week retention cohorts, feature click tags, and identify exactly where users drop off.',
              tag: 'Product Analytics',
              tagColor: 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
              icon: '📊'
            },
            {
              title: 'In-App NPS & Sentiment',
              desc: 'Trigger Net Promoter Score microsurveys with AI sentiment classification and 1-click loop closing.',
              tag: 'Feedback Loop',
              tagColor: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
              icon: '💬'
            },
            {
              title: 'Enterprise Integrations',
              desc: 'Sync telemetry bi-directionally with Salesforce, HubSpot, Segment, Slack, Mixpanel, and Zendesk.',
              tag: 'CRM Sync',
              tagColor: 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
              icon: '🔌'
            }
          ].map((item, i) => (
            <div 
              key={i}
              className="p-7 rounded-3xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{item.icon}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.tagColor}`}>
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1E2C4F]">
                <button
                  onClick={onEnterApp}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Launch Module</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Conversion Banner */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <div className="p-12 sm:p-16 rounded-3xl bg-gradient-to-tr from-[#080E1E] via-[#0E172A] to-[#121E3D] border border-indigo-500/20 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          <span className="inline-block text-xs font-bold text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800">
            Enterprise CS & Product Growth
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Accelerate Your Product Growth & Retention Today.
          </h2>

          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Join hundreds of high-growth SaaS teams using arQuonCX to monitor customer health, launch no-code onboarding tours, and predict renewals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/35 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Live CS Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onGoToLogin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#111C35] hover:bg-[#162547] text-slate-200 border border-[#22355C] font-bold text-sm transition-colors cursor-pointer"
            >
              <span>Sign In to Workspace</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. Modern Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-[#1E2C4F] bg-white dark:bg-[#070B19] px-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo
            size="sm"
            subtitle="Customer Success & Product Growth Platform"
            onClick={onEnterApp}
          />

          <div className="flex items-center gap-6 font-medium text-slate-600 dark:text-slate-400">
            <button
              onClick={onNavigateToPrivacy}
              className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={onNavigateToTerms}
              className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={onNavigateToSecurity}
              className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer"
            >
              Security & SSO
            </button>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Systems Operational (99.98%)
            </span>
          </div>
        </div>
      </footer>

      {/* 10. Live Floating In-Page Experience Spotlight (When user clicks "Test Drive In-App Tour") */}
      {isLiveDemoActive && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E172A] border-2 border-indigo-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 space-y-4">
            <button
              onClick={() => setIsLiveDemoActive(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                In-App Walkthrough Experience (Step {demoTourStep} of 3)
              </span>
            </div>

            {demoTourStep === 1 && (
              <div className="space-y-3">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Welcome to Your In-App Adoption Tour! 👋
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Notice how this interactive overlay appears seamlessly right on top of the web app without reloading or navigating away.
                </p>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-medium">Triggered by: Role = Lead CSM</span>
                  <button
                    onClick={() => setDemoTourStep(2)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                  >
                    Next Spotlight →
                  </button>
                </div>
              </div>
            )}

            {demoTourStep === 2 && (
              <div className="space-y-3">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Automated Customer Health Scoring 🎯
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Composite telemetry calculates login frequency, license utilization, and support tickets to alert CSMs 90 days before renewal risks.
                </p>
                <div className="pt-2 flex justify-between items-center">
                  <button
                    onClick={() => setDemoTourStep(1)}
                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setDemoTourStep(3)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                  >
                    Finish Tour →
                  </button>
                </div>
              </div>
            )}

            {demoTourStep === 3 && (
              <div className="space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                  🎉
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  You Just Experienced arQuonCX In-App Onboarding!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ready to test our full Customer Success dashboard, accounts CRM, and interactive visual flow simulator?
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setIsLiveDemoActive(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setIsLiveDemoActive(false);
                      onEnterApp();
                    }}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg cursor-pointer"
                  >
                    Launch Live CS Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

import React from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  ExternalLink,
  Mail,
  Server
} from 'lucide-react';
import { ThemeToggle } from '../../common/ThemeToggle';
import { BrandLogo } from '../../common/BrandLogo';

interface PrivacyPolicyPageProps {
  onBackToHome: () => void;
  onEnterApp: () => void;
  onNavigateToTerms: () => void;
  onNavigateToSecurity: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  onBackToHome,
  onEnterApp,
  onNavigateToTerms,
  onNavigateToSecurity,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150">
      {/* Top Navbar */}
      <nav className="border-b border-slate-200/80 dark:border-[#1E2C4F] bg-white/90 dark:bg-[#0A1024]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <BrandLogo
            size="md"
            onClick={onBackToHome}
          />

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={onBackToHome}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#111C35] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </button>
            <button
              onClick={onEnterApp}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Open CS App
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="pb-8 border-b border-slate-200 dark:border-[#1E2C4F]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>GDPR & CCPA Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-4">
            <span>Last Updated: October 2026</span>
            <span>•</span>
            <span>Effective Date: January 1, 2026</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Quick Anchor Navigation */}
          <div className="hidden md:block col-span-1 space-y-2 sticky top-24 self-start text-xs font-semibold text-slate-600 dark:text-slate-400">
            <p className="uppercase text-[10px] tracking-wider font-bold text-slate-400 mb-2">Sections</p>
            <a href="#overview" className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1">1. Overview & Scope</a>
            <a href="#collection" className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1">2. Information Collected</a>
            <a href="#usage" className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1">3. How We Use Data</a>
            <a href="#security" className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1">4. Data Security</a>
            <a href="#gdpr" className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1">5. GDPR & CCPA Rights</a>
            <a href="#subprocessors" className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1">6. Sub-processors</a>
            <a href="#contact" className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1">7. Contact DPO</a>
          </div>

          {/* Legal Text */}
          <div className="col-span-3 space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <section id="overview" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                1. Overview & Scope
              </h2>
              <p>
                arQuonCX ("we," "our," or "us") provides a cloud-based Customer Success, Digital Adoption, and Product Analytics platform. This Privacy Policy describes how we collect, process, and protect information when you visit our website, install our JavaScript SDK, or use our web application.
              </p>
              <p>
                We act as a <strong>Data Processor</strong> on behalf of our enterprise customers regarding end-user telemetry transmitted through our SDK, and as a <strong>Data Controller</strong> regarding customer account, billing, and direct website visitor interactions.
              </p>
            </section>

            <section id="collection" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                2. Information We Collect
              </h2>
              <div className="p-4 rounded-xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">A. Customer Account Data</h3>
                <p className="text-xs">
                  Name, business email address, company name, billing details, and assigned Customer Success team credentials.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">B. Product Telemetry & In-App Usage</h3>
                <p className="text-xs">
                  When the arQuonCX SDK is integrated into your application, we collect user-triggered events (e.g. clicks on tagged features, flow completion steps, NPS responses, session frequency, and browser environment) to compute Customer Health Scores.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">C. Sensitive Data Exclusions</h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  We explicitly forbid customers from passing credit card numbers, passwords, health data (HIPAA), or sensitive personal categories into custom event tracking attributes.
                </p>
              </div>
            </section>

            <section id="usage" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                3. How We Process & Use Data
              </h2>
              <ul className="space-y-2 list-disc list-inside text-xs">
                <li>To calculate unified Customer Health Scores and predict account renewal churn risks.</li>
                <li>To trigger personalized in-app onboarding walkthroughs, modals, and tooltips based on audience segment criteria.</li>
                <li>To categorize qualitative NPS feedback verbatims using automated AI sentiment tagging.</li>
                <li>To deliver self-service support guides and checklist progress in the embedded Resource Center.</li>
              </ul>
            </section>

            <section id="security" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                4. Data Protection & Security
              </h2>
              <p>
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Our production environments undergo regular automated penetration testing and third-party SOC 2 Type II audits.
              </p>
            </section>

            <section id="gdpr" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                5. Your GDPR & CCPA/CPRA Privacy Rights
              </h2>
              <p>
                Under applicable privacy regulations, European Economic Area (EEA), UK, and California residents possess the right to:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-[#1E2C4F] bg-white dark:bg-[#0E172A] text-xs">
                  <span className="font-bold block text-slate-900 dark:text-white">Right to Access & Portability</span>
                  <span className="text-slate-500">Request an exported copy of your telemetry in JSON format.</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-[#1E2C4F] bg-white dark:bg-[#0E172A] text-xs">
                  <span className="font-bold block text-slate-900 dark:text-white">Right to Erasure ("Forgotten")</span>
                  <span className="text-slate-500">Purge end-user telemetry and identities within 30 days.</span>
                </div>
              </div>
            </section>

            <section id="subprocessors" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                6. Certified Sub-processors
              </h2>
              <p className="text-xs">
                We maintain Data Processing Agreements (DPAs) incorporating standard contractual clauses with our core cloud infrastructure providers:
              </p>
              <div className="divide-y divide-slate-200 dark:divide-[#1E2C4F] border border-slate-200 dark:border-[#1E2C4F] rounded-xl overflow-hidden text-xs">
                <div className="p-3 flex justify-between bg-white dark:bg-[#0E172A]">
                  <span className="font-bold text-slate-900 dark:text-white">Amazon Web Services (AWS)</span>
                  <span className="text-slate-500">Cloud Hosting & Database (US & EU)</span>
                </div>
                <div className="p-3 flex justify-between bg-white dark:bg-[#0E172A]">
                  <span className="font-bold text-slate-900 dark:text-white">Twilio / Segment</span>
                  <span className="text-slate-500">Event Ingestion Pipeline</span>
                </div>
                <div className="p-3 flex justify-between bg-white dark:bg-[#0E172A]">
                  <span className="font-bold text-slate-900 dark:text-white">Stripe Inc.</span>
                  <span className="text-slate-500">Subscription & Payment Processing</span>
                </div>
              </div>
            </section>

            <section id="contact" className="space-y-3 pt-4 border-t border-slate-200 dark:border-[#1E2C4F]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                7. Contact Our Data Protection Officer (DPO)
              </h2>
              <p className="text-xs">
                If you have questions about this policy or wish to execute a Data Processing Addendum (DPA), contact our legal and security compliance team:
              </p>
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-indigo-900 dark:text-indigo-200">arQuonCX Privacy & Legal Office</p>
                  <p className="text-indigo-700 dark:text-indigo-300">privacy@arquoncx.io • dpo@arquoncx.io</p>
                </div>
                <a href="mailto:privacy@arquoncx.io" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition-colors">
                  Contact Legal
                </a>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-[#1E2C4F] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex gap-4 font-semibold text-indigo-600 dark:text-indigo-400">
            <button onClick={onNavigateToTerms} className="hover:underline cursor-pointer">
              Terms of Service →
            </button>
            <button onClick={onNavigateToSecurity} className="hover:underline cursor-pointer">
              Security & SSO Overview →
            </button>
          </div>
          <span className="text-slate-400">© 2026 arQuonCX Inc. All rights reserved.</span>
        </div>
      </main>
    </div>
  );
};

import React from 'react';
import { 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  Scale, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { ThemeToggle } from '../../common/ThemeToggle';
import { BrandLogo } from '../../common/BrandLogo';

interface TermsOfServicePageProps {
  onBackToHome: () => void;
  onEnterApp: () => void;
  onNavigateToPrivacy: () => void;
  onNavigateToSecurity: () => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({
  onBackToHome,
  onEnterApp,
  onNavigateToPrivacy,
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
            <Scale className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Enterprise Master Subscription Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-4">
            <span>Last Revised: October 2026</span>
            <span>•</span>
            <span>Version 4.2</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Quick Anchor Navigation */}
          <div className="hidden md:block col-span-1 space-y-2 sticky top-24 self-start text-xs font-semibold text-slate-600 dark:text-slate-400">
            <p className="uppercase text-[10px] tracking-wider font-bold text-slate-400 mb-2">Clauses</p>
            <a href="#acceptance" className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1">1. Acceptance of Terms</a>
            <a href="#subscription" className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1">2. License & Seats</a>
            <a href="#ownership" className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1">3. Customer Data Rights</a>
            <a href="#sla" className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1">4. 99.9% Uptime SLA</a>
            <a href="#usage" className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1">5. Acceptable Use</a>
            <a href="#billing" className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1">6. Renewals & Billing</a>
            <a href="#liability" className="block hover:text-indigo-600 dark:hover:text-indigo-400 py-1">7. Liability & Warranties</a>
          </div>

          {/* Legal Text */}
          <div className="col-span-3 space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <section id="acceptance" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                1. Acceptance of Terms & Eligibility
              </h2>
              <p>
                By signing an Order Form, registering an account, or integrating the arQuonCX JavaScript SDK, your organization ("Customer") agrees to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company, you represent that you possess the authority to bind that entity.
              </p>
            </section>

            <section id="subscription" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                2. Subscription Grant, Provisioned Seats & Tiers
              </h2>
              <p>
                Subject to timely payment, arQuonCX grants Customer a non-exclusive, worldwide, non-transferable right during the Subscription Term to:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-xs">
                <li>Deploy in-app onboarding flows, tooltips, checklists, and NPS sentiment surveys.</li>
                <li>Access the unified Customer 360° health dashboard, product funnels, and retention cohort heatmaps.</li>
                <li>Invite designated Customer Success Managers, Product Managers, and team members up to the provisioned seat limit.</li>
              </ul>
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Seat License Enforcement:</span> Accounts exceeding provisioned seats (e.g. 100% capacity) are permitted a 14-day grace period to adjust tier limits without service disruption.
              </div>
            </section>

            <section id="ownership" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                3. Customer Data Ownership & Intellectual Property
              </h2>
              <p>
                <strong>Customer retains 100% sole ownership of all customer data</strong>, telemetry, end-user records, and survey responses ingested into arQuonCX. We claim no intellectual property rights over your data.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                arQuonCX retains all proprietary rights, trademarks, algorithms, UI patterns, and code relating to the platform and SDK.
              </p>
            </section>

            <section id="sla" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                4. Service Level Agreement (99.9% Uptime SLA)
              </h2>
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Enterprise Uptime Commitment</span>
                </div>
                <p className="text-emerald-700 dark:text-emerald-400">
                  We guarantee 99.9% monthly uptime for SDK script delivery and in-app flow triggers, backed by financial service credits for Enterprise tier agreements. Scheduled maintenance windows occur with at least 48 hours advance notice.
                </p>
              </div>
            </section>

            <section id="usage" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                5. Acceptable Use Policy & Prohibitions
              </h2>
              <p className="text-xs">Customer agrees not to:</p>
              <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-600 dark:text-slate-400">
                <li>Reverse engineer, decompile, or extract source code from the arQuonCX platform or SDK.</li>
                <li>Transmit malware, viruses, or malicious script tags via in-app experience builders.</li>
                <li>Use the platform to target fraudulent, deceptive, or unsolicited phishing surveys.</li>
              </ul>
            </section>

            <section id="billing" className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                6. Fees, Auto-Renewal & Cancellation
              </h2>
              <p className="text-xs">
                Annual agreements renew automatically for successive 12-month periods unless either party provides written notice of non-renewal at least 30 days prior to expiration. Fees are billed in advance according to the specified tier (Enterprise, Scale, or Starter).
              </p>
            </section>

            <section id="liability" className="space-y-3 pt-4 border-t border-slate-200 dark:border-[#1E2C4F]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                7. Limitation of Liability
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Except for gross negligence or willful misconduct, neither party's total aggregate liability arising out of this agreement shall exceed the total amount actually paid by Customer in the 12 months preceding the incident.
              </p>
            </section>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-[#1E2C4F] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex gap-4 font-semibold text-indigo-600 dark:text-indigo-400">
            <button onClick={onNavigateToPrivacy} className="hover:underline cursor-pointer">
              ← Privacy Policy
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

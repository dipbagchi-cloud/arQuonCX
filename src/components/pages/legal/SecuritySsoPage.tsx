import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Key, 
  Server, 
  CheckCircle2, 
  Copy, 
  Check, 
  Cpu, 
  ExternalLink,
  ShieldAlert,
  FileCheck2,
  Database,
  Users
} from 'lucide-react';
import { ThemeToggle } from '../../common/ThemeToggle';
import { BrandLogo } from '../../common/BrandLogo';

interface SecuritySsoPageProps {
  onBackToHome: () => void;
  onEnterApp: () => void;
  onNavigateToPrivacy: () => void;
  onNavigateToTerms: () => void;
}

export const SecuritySsoPage: React.FC<SecuritySsoPageProps> = ({
  onBackToHome,
  onEnterApp,
  onNavigateToPrivacy,
  onNavigateToTerms,
}) => {
  const [copiedAcs, setCopiedAcs] = useState(false);
  const [copiedEntity, setCopiedEntity] = useState(false);

  const acsUrl = "https://auth.arquoncx.io/saml/v2/acs/org_892a01f";
  const entityId = "urn:arquoncx:sp:saml2:prod";

  const handleCopyAcs = () => {
    navigator.clipboard.writeText(acsUrl);
    setCopiedAcs(true);
    setTimeout(() => setCopiedAcs(false), 2000);
  };

  const handleCopyEntity = () => {
    navigator.clipboard.writeText(entityId);
    setCopiedEntity(true);
    setTimeout(() => setCopiedEntity(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150">
      {/* Top Navbar */}
      <nav className="border-b border-slate-200/80 dark:border-[#1E2C4F] bg-white/90 dark:bg-[#0A1024]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Enterprise Security & Identity Standards</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Security, Compliance & Enterprise SSO
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Built from the ground up with bank-grade encryption, continuous vulnerability monitoring, SOC 2 Type II compliance, and turnkey SAML 2.0 Single Sign-On.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">SOC 2 Type II Certified</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Audited annually across Security, Availability, and Confidentiality trust principles.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">End-to-End Encryption</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              TLS 1.3 encryption in transit with automated certs and AES-256 bit encryption at rest.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">SAML 2.0 & SCIM</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Single Sign-On and automated just-in-time user provisioning via Okta, Entra ID, and OneLogin.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Data Residency Options</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Choose US (AWS us-east-1) or EU (AWS eu-central-1 Frankfurt) data storage isolation.
            </p>
          </div>
        </div>

        {/* Enterprise SSO Configuration Section */}
        <div className="p-8 rounded-3xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Identity Federation</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                Enterprise SAML 2.0 & OIDC Single Sign-On
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Connect your organization's Identity Provider (IdP) for centralized authentication and role assignment.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
              ● Ready for SAML Setup
            </span>
          </div>

          {/* Supported IdP Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {['Okta Workforce', 'Microsoft Entra ID (Azure AD)', 'Google Workspace SSO', 'OneLogin & Ping'].map((idp, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-[#1E2C4F] bg-slate-50 dark:bg-[#111C35] text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                {idp}
              </div>
            ))}
          </div>

          {/* SAML Parameters to Copy */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-[#1A2644]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Service Provider (SP) Metadata Configuration
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Assertion Consumer Service (ACS) URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={acsUrl}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-xl text-slate-800 dark:text-slate-200 outline-hidden"
                />
                <button
                  onClick={handleCopyAcs}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedAcs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAcs ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Entity ID / Audience URI
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={entityId}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-xl text-slate-800 dark:text-slate-200 outline-hidden"
                />
                <button
                  onClick={handleCopyEntity}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedEntity ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEntity ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Security Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Role-Based Access Control (RBAC) & Audit Logs
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Restrict access to sensitive customer telemetry using custom roles: <strong>Administrator</strong>, <strong>Customer Success Manager</strong>, <strong>Product Manager</strong>, and <strong>Read-Only Analyst</strong>.
            </p>
            <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
              <li>Comprehensive audit logging with user IP, action timestamps, and diff records.</li>
              <li>Enforced 2FA (Two-Factor Authentication) for all non-SSO accounts.</li>
              <li>Automatic session timeout after 30 minutes of inactivity.</li>
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-[#1E2C4F] space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Continuous Vulnerability & Penetration Testing
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              We partner with independent cybersecurity auditing firms to conduct annual white-box and black-box penetration tests across our SDK, API gateway, and cloud infrastructure.
            </p>
            <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
              <li>Continuous static code analysis (SAST) and dependency vulnerability checks in CI/CD.</li>
              <li>Active Bug Bounty program with 24-hour triage SLA.</li>
              <li>Automated daily backups with 15-minute point-in-time recovery (PITR).</li>
            </ul>
          </div>
        </div>

        {/* Security Assessment Download CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-indigo-700/50">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold">Need a Vendor Security Questionnaire or SOC 2 Report?</h3>
            <p className="text-xs text-slate-300">
              Our enterprise security compliance package includes our SOC 2 Type II report, penetration testing summary, and SIG questionnaire.
            </p>
          </div>
          <a
            href="mailto:security@arquoncx.io?subject=Requesting%20SOC%202%20Report%20and%20Security%20Packet"
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold shrink-0 transition-colors shadow-lg cursor-pointer"
          >
            Request Security Packet
          </a>
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-slate-200 dark:border-[#1E2C4F] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex gap-4 font-semibold text-indigo-600 dark:text-indigo-400">
            <button onClick={onNavigateToPrivacy} className="hover:underline cursor-pointer">
              Privacy Policy →
            </button>
            <button onClick={onNavigateToTerms} className="hover:underline cursor-pointer">
              Terms of Service →
            </button>
          </div>
          <span className="text-slate-400">© 2026 arQuonCX Inc. All rights reserved.</span>
        </div>
      </main>
    </div>
  );
};

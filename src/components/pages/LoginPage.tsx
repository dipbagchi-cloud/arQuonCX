import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Star, 
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { BrandLogo } from '../common/BrandLogo';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  const [email, setEmail] = useState('elena.rostova@arquoncx.io');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 400);
  };

  const handleInstantDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B19] flex flex-col justify-center select-none font-sans p-4 sm:p-8 transition-colors duration-150">
      <div className="flex-1 flex flex-col md:flex-row max-w-5xl w-full mx-auto my-auto shadow-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-[#1E2C4F]">
        {/* Left Side: Auth Form */}
        <div className="w-full md:w-1/2 bg-white dark:bg-[#0E172A] p-8 sm:p-12 flex flex-col justify-between transition-colors">
          <div>
            {/* Top Back Link & Brand */}
            <div className="flex items-center justify-between mb-8">
              <BrandLogo
                size="md"
                onClick={onBackToHome}
              />

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={onBackToHome}
                  className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#152342]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Home
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Log in to your workspace
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Access real-time customer health, adoption flows, and NPS analytics.
              </p>
            </div>

            {/* Quick SSO Buttons */}
            <div className="space-y-2.5 mb-6">
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                className="w-full py-2.5 px-4 bg-white dark:bg-[#111C35] hover:bg-slate-50 dark:hover:bg-[#162547] text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-[#22355C] shadow-2xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleInstantDemoLogin}
                className="w-full py-2.5 px-4 bg-white dark:bg-[#111C35] hover:bg-slate-50 dark:hover:bg-[#162547] text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-[#22355C] shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Single Sign-On (SAML / Okta)</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-slate-200 dark:border-[#1E2C4F] w-full" />
              <span className="bg-white dark:bg-[#0E172A] px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                Or with work email
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-xl focus:bg-white dark:focus:bg-[#131F3B] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#forgot" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-[#22355C] rounded-xl focus:bg-white dark:focus:bg-[#131F3B] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-hidden font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Remember me for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Instant Demo 1-Click Login Option */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#1E2C4F]">
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>1-Click Instant Demo Login (Elena Rostova, Lead CSM)</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an enterprise account?{' '}
            <button onClick={onBackToHome} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
              Start 14-day free trial
            </button>
          </div>
        </div>

        {/* Right Side: Dark Navy Blue Branded Showcase Panel */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-[#080E1E] via-[#0D162D] to-[#0A1024] text-white p-10 flex-col justify-between relative overflow-hidden border-l border-slate-200 dark:border-[#1E2C4F]">
          {/* Ambient Glow */}
          <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

          {/* Top Pill */}
          <div className="relative z-10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
              Live Production Suite
            </span>
          </div>

          {/* Testimonial Quote with Centered Face Headshot */}
          <div className="relative z-10 space-y-4 my-auto">
            <div className="flex gap-1 text-amber-400 text-sm">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>

            <blockquote className="text-lg font-medium text-slate-200 leading-snug italic">
              "arQuonCX gave our CS and product growth teams instant visibility into user drop-offs and at-risk accounts. We reduced renewal churn by 32% within our first quarter."
            </blockquote>

            <div className="flex items-center gap-3 pt-2">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&crop=face&q=80"
                alt="Marcus Chen"
                className="w-12 h-12 rounded-full object-cover object-top ring-2 ring-indigo-500 shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-white">Marcus Chen</p>
                <p className="text-[11px] text-indigo-300 font-medium">VP of Product • Acme Cloud Dynamics</p>
              </div>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="relative z-10 grid grid-cols-3 gap-2 pt-6 border-t border-slate-800/80 text-center">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <p className="text-base font-black text-white">38.4k</p>
              <p className="text-[10px] text-slate-400">Monthly Active</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <p className="text-base font-black text-emerald-400">84/100</p>
              <p className="text-[10px] text-slate-400">Avg Health Index</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <p className="text-base font-black text-indigo-300">+48</p>
              <p className="text-[10px] text-slate-400">Net Promoter</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

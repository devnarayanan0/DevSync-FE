import { useState, FormEvent } from 'react';
import { Eye, EyeOff, Sun, Moon, Lock, Mail, RefreshCw } from 'lucide-react';
import { Theme, UserProfile } from '../types';

interface LoginPageProps {
  theme: Theme;
  onThemeToggle: () => void;
  onLoginSuccess: (user: UserProfile, isNewUser: boolean) => void;
}

export default function LoginPage({
  theme,
  onThemeToggle,
  onLoginSuccess,
}: LoginPageProps) {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Fields for registration
  const [regName, setRegName] = useState<string>('');
  const [regTenant, setRegTenant] = useState<string>('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState<string>('');

  const handlePresetLogin = (type: 'existing' | 'new') => {
    setIsSubmitting(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsSubmitting(false);
      if (type === 'existing') {
        onLoginSuccess(
          {
            name: 'David Vance',
            email: 'david.vance@devsync.io',
            role: 'Storage Lead',
            tenant: 'Client-Org-Production',
          },
          false
        );
      } else {
        onLoginSuccess(
          {
            name: 'Alex Mercer',
            email: 'alex.mercer@devsync.io',
            role: 'DevOps Engineer',
            tenant: 'Client-Sandbox-Beta',
          },
          true
        );
      }
    }, 800);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    // Basic email regex structure
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please specify a valid email address.');
      return;
    }

    if (password.length < 5) {
      setErrorMsg('Password should contain at least 5 characters.');
      return;
    }

    if (isRegistering) {
      if (!regName) {
        setErrorMsg('Please provide your Display Name.');
        return;
      }
      if (password !== regPasswordConfirm) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (isRegistering) {
        // Register succeeds, swap to login
        setIsRegistering(false);
        setPassword('');
        setRegPasswordConfirm('');
        // Show simulated notification
        alert('Registration successful! Please login with your credentials.');
      } else {
        // Is it a new or existing user?
        // Let's decide based on whether email has 'new' or is from a new user checkbox/domain
        const isNew = email.toLowerCase().includes('new') || email.toLowerCase() === 'alex@devsync.io';
        onLoginSuccess(
          {
            name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
            email: email,
            role: isNew ? 'Storage Auditor' : 'Systems Lead',
            tenant: isNew ? 'DevSync-Sandbox-Alpha' : 'Client-Org-Production',
          },
          isNew
        );
      }
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center bg-slate-50 text-slate-800 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Right Header Theme Selector */}
      <div className="absolute top-6 right-6">
        <button
          onClick={onThemeToggle}
          className="rounded-sm p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          id="login-theme-toggle"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-550" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md px-6">
        {/* Logo Section */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-indigo-600 text-white shadow-xs">
            <svg
              className="h-6 w-6 animate-spin-slow text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 font-sans uppercase">
            DevSync
          </h1>
        </div>

        {/* Auth form card */}
        <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-5 text-sm font-bold font-mono tracking-wider uppercase text-slate-400 dark:text-slate-500">
            {isRegistering ? 'Register account' : 'Client Access Authorization'}
          </h2>

          {errorMsg && (
            <div className="mb-4 rounded-sm bg-red-50 p-3 text-xs font-mono uppercase tracking-wide text-red-650 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. ALEX MERCER"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Organization Tenant
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. CLIENT-SANDBOX"
                    value={regTenant}
                    onChange={(e) => setRegTenant(e.target.value)}
                    className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1" id="email-label">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  placeholder={isRegistering ? "E.G. DEV@DEVSYNC.IO" : "ENTER EMAIL ADDRESS..."}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 pl-9 text-xs font-mono uppercase tracking-wide transition-colors placeholder:text-slate-350 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-600 dark:focus:border-indigo-500 text-slate-800 dark:text-slate-250"
                  id="email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1" id="password-label">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 pl-9 pr-10 text-xs font-mono uppercase tracking-wide transition-colors placeholder:text-slate-350 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-600 dark:focus:border-indigo-500 text-slate-800 dark:text-slate-250"
                  id="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  id="password-toggle"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="******"
                  value={regPasswordConfirm}
                  onChange={(e) => setRegPasswordConfirm(e.target.value)}
                  className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex h-10 w-full items-center justify-center rounded-sm bg-indigo-600 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-indigo-550 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
              }`}
              id="login-submit-button"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span>{isRegistering ? 'Register account' : 'Verify & Launch'}</span>
              )}
            </button>
          </form>

          {/* Quick toggle register / login */}
          <div className="mt-5 text-center text-[11px] font-mono uppercase tracking-wider">
            {isRegistering ? (
              <span className="text-slate-400">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setIsRegistering(false);
                    setErrorMsg('');
                  }}
                  className="font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                  id="login-view-toggle"
                >
                  Login
                </button>
              </span>
            ) : (
              <span className="text-slate-400">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setIsRegistering(true);
                    setErrorMsg('');
                  }}
                  className="font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                  id="register-view-toggle"
                >
                  Register
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Preset accounts for quick and flawless eval capability */}
        {!isRegistering && (
          <div className="mt-6 rounded-sm border border-slate-200 bg-slate-100/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <h3 className="mb-2 text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Interactive Dev Evaluation Presets
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePresetLogin('existing')}
                disabled={isSubmitting}
                className="flex flex-col items-center justify-center rounded-sm border border-slate-200 bg-white p-2.5 text-center transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
              >
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  Existing User
                </span>
                <span className="text-[9px] font-mono text-slate-450 mt-1 uppercase">
                  Loads 4 Sync configurations
                </span>
              </button>
              <button
                onClick={() => handlePresetLogin('new')}
                disabled={isSubmitting}
                className="flex flex-col items-center justify-center rounded-sm border border-slate-200 bg-white p-2.5 text-center transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
              >
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-widest">
                  New User
                </span>
                <span className="text-[9px] font-mono text-slate-450 mt-1 uppercase">
                  Launches Step-by-Step Wizard
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

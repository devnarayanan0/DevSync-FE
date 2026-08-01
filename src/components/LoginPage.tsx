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
            role: 'User',
            tenant: isNew ? 'DevSync-Sandbox-Alpha' : 'Client-Org-Production',
          },
          isNew
        );
      }
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center bg-theme-bg text-theme-text transition-colors duration-200 font-sans">
      {/* Top Right Header Theme Selector */}
      <button
        onClick={() => onLoginSuccess({ name: 'Dev', email: 'dev@local', role: 'User', tenant: 'Local' }, false)}
        className="ml-2 rounded-lg p-2 text-slate-700 hover:bg-theme-card hover:text-black dark:text-slate-300 dark:hover:text-white transition-colors text-[10px] font-mono font-bold uppercase cursor-pointer"
      >
        Bypass
      </button>
      <div className="absolute top-6 right-6">
        <button
          onClick={onThemeToggle}
          className="rounded-lg p-2 text-slate-700 hover:bg-theme-card hover:text-black dark:text-slate-300 dark:hover:text-white transition-colors"
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
          <div className="flex h-16 w-52 items-center justify-center rounded-2xl border border-[#b8d5cb] bg-[#D6E8E1] p-3 shadow-xl hover:shadow-2xl transition-all">
            <img src="/logo.png" alt="DevSync Logo" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Auth form card */}
        <div className="rounded-xl border border-theme-border bg-theme-card p-7 shadow-xl">
          <h2 className="mb-5 text-xs font-extrabold font-mono tracking-wider uppercase text-black dark:text-white">
            {isRegistering ? 'REGISTER' : 'LOGIN'}
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
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dev"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    UCN
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="UNIQUE CLIENT NO"
                    value={regTenant}
                    onChange={(e) => setRegTenant(e.target.value)}
                    className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                EMAIL
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  placeholder={isRegistering ? "DEV@DEVSYNC.IO" : "EMAIL"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-lg border border-theme-border bg-theme-bg/60 px-3 pl-9 text-xs font-sans font-semibold transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:bg-theme-card focus:outline-none text-black dark:text-white"
                  id="email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-theme-border bg-theme-bg/60 px-3 pl-9 pr-10 text-xs font-sans font-semibold transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:bg-theme-card focus:outline-none text-black dark:text-white"
                  id="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-black dark:hover:text-white focus:outline-none"
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
                  CONFIRM PASSWORD
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
              className={`flex h-11 w-full items-center justify-center rounded-xl bg-lime-500 text-xs font-sans font-extrabold uppercase tracking-wider text-black shadow-md transition-all hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400 ${isSubmitting ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
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

      </div>
    </div>
  );
}

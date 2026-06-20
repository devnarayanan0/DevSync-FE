import { useState } from 'react';
import { Search, Sun, Moon, Info, ShieldAlert, Cpu } from 'lucide-react';
import { Theme, UserProfile } from '../types';
import ProfileDropdown from './ProfileDropdown';

interface NavbarProps {
  theme: Theme;
  onThemeToggle: () => void;
  onOpenAbout: () => void;
  user: UserProfile;
  onLogout: () => void;
  onNavigateToTab: (tabId: string) => void;
  onSearchChange: (term: string) => void;
  searchTerm: string;
}

export default function Navbar({
  theme,
  onThemeToggle,
  onOpenAbout,
  user,
  onLogout,
  onNavigateToTab,
  onSearchChange,
  searchTerm,
}: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950"
      id="devsync-top-navbar"
    >
      {/* Left branding */}
      <div className="flex items-center space-x-6">
        <button
          onClick={() => onNavigateToTab('dashboard')}
          className="group flex items-center space-x-2.5 hover:opacity-90 focus:outline-none"
          title="Go to Dashboard"
          id="branding-logo-trigger"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-sm bg-indigo-600 text-white shadow-xs">
            {/* Minimal dual sync arrow representation as SVG */}
            <svg
              className="h-4 w-4 animate-spin-slow text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans uppercase">
            DevSync
          </span>
        </button>

        {/* Localhost connection badge */}
        <div className="hidden items-center space-x-1.5 rounded-sm bg-slate-50 px-2 py-0.5 text-[9px] font-mono font-medium uppercase text-slate-500 border border-slate-200/60 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 lg:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Spring API (3000)</span>
        </div>
      </div>

      {/* Center Interactive Search */}
      <div className="relative mx-4 flex w-full max-w-sm flex-1 items-center md:max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="SEARCH FILES, LOGS, SCHEDULES..."
          className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 pl-9 text-xs font-mono uppercase tracking-wide transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:placeholder:text-slate-650 dark:focus:border-indigo-500 dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200"
          id="global-search-input"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3">
        {/* Toggle Theme System */}
        <button
          onClick={onThemeToggle}
          className="rounded-sm p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme appearance"
          id="theme-toggle-button"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-550" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </button>

        {/* About App Info trigger */}
        <button
          onClick={onOpenAbout}
          className="rounded-sm p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition-colors"
          title="About DevSync Client"
          aria-label="About DevSync client details"
          id="about-button"
        >
          <Info className="h-4 w-4" />
        </button>

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-850" />

        {/* User Status Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2.5 rounded-sm p-1 focus:outline-none"
            aria-haspopup="true"
            aria-expanded={profileOpen}
            id="avatar-trigger-button"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              JD
            </div>
          </button>

          {/* Connected dropdown */}
          <ProfileDropdown
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            user={user}
            onLogout={onLogout}
            onNavigateToTab={onNavigateToTab}
          />
        </div>
      </div>
    </nav>
  );
}

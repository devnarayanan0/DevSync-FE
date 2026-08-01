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
      className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white backdrop-blur-md px-6 text-black shadow-xs"
      id="devsync-top-navbar"
    >
      {/* Left branding */}
      <div className="flex items-center space-x-6">
        <button
          onClick={() => onNavigateToTab('dashboard')}
          className="group flex items-center hover:opacity-90 focus:outline-none cursor-pointer"
          title="Go to Dashboard"
          id="branding-logo-trigger"
        >
          <span className="text-xl font-extrabold tracking-tight text-black font-heading uppercase">
            DevSync
          </span>
        </button>
      </div>

      {/* Center Interactive Search */}
      <div className="relative mx-4 flex w-full max-w-sm flex-1 items-center md:max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search files, logs, schedules..."
          className="h-10 w-full rounded-full border border-slate-200 bg-slate-100/80 px-4 pl-10 text-xs font-sans font-medium transition-all placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:outline-none text-black shadow-xs"
          id="global-search-input"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-bold text-slate-500 hover:text-black cursor-pointer"
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
          className="h-9 w-9 rounded-full border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black transition-all flex items-center justify-center shadow-xs cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme appearance"
          id="theme-toggle-button"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User Status Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 rounded-full p-0.5 focus:outline-none cursor-pointer"
            aria-haspopup="true"
            aria-expanded={profileOpen}
            id="avatar-trigger-button"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-lime-400 bg-lime-500 text-black font-extrabold text-xs shadow-xs">
              {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
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

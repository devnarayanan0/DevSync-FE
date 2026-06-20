import { motion, AnimatePresence } from 'motion/react';
import { User, LogOut, Settings, Layers, Shield, Cloud, Server, Key } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLogout: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export default function ProfileDropdown({
  isOpen,
  onClose,
  user,
  onLogout,
  onNavigateToTab,
}: ProfileDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent click-outside overlay */}
          <div
            className="fixed inset-0 z-45"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute right-0 mt-2 z-50 w-72 origin-top-right rounded-sm border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-950"
            id="profile-dropdown-container"
          >
            {/* Header User Badge */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-indigo-50 text-indigo-700 font-bold dark:bg-slate-900 dark:text-indigo-300">
                    {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500 dark:border-slate-950" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold font-mono uppercase tracking-wide truncate text-slate-800 dark:text-slate-100">
                    {user.name}
                  </p>
                  <p className="text-[11px] font-mono tracking-normal text-slate-400 truncate dark:text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Status Pills */}
              <div className="mt-3 flex gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-450 border border-slate-200 dark:border-slate-800">
                  <Layers className="h-2.5 w-2.5 mr-1 text-slate-400" />
                  {user.tenant}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-slate-900/60 dark:text-indigo-400 border border-indigo-120/40 dark:border-slate-800">
                  <Shield className="h-2.5 w-2.5 mr-1 text-indigo-500" />
                  {user.role}
                </span>
              </div>
            </div>

            {/* Provider Connectivity Monitor */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/20 border-b border-slate-150 dark:border-slate-850">
              <p className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                Connected Providers
              </p>
              <div className="space-y-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-650 dark:text-slate-350">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Cloud className="h-3.5 w-3.5 mr-1.5 text-sky-500" />
                    AWS S3
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Server className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                    Google Drive
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-1 space-y-0.5">
              <button
                onClick={() => {
                  onNavigateToTab('profile');
                  onClose();
                }}
                className="w-full flex items-center px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <User className="h-3.5 w-3.5 mr-2.5 text-slate-400" />
                View User Profile
              </button>
              <button
                onClick={() => {
                  onNavigateToTab('settings');
                  onClose();
                }}
                className="w-full flex items-center px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <Settings className="h-3.5 w-3.5 mr-2.5 text-slate-400" />
                Durable Settings
              </button>
              <button
                onClick={() => {
                  onNavigateToTab('activity');
                  onClose();
                }}
                className="w-full flex items-center px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <Key className="h-3.5 w-3.5 mr-2.5 text-slate-400" />
                Session Token
              </button>
            </div>

            {/* Logout Trigger */}
            <div className="p-1 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/10">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center px-3 py-1.5 text-xs font-mono uppercase tracking-wider font-bold rounded-sm text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                id="logout-button"
              >
                <LogOut className="h-3.5 w-3.5 mr-2.5" />
                Disconnect Client
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

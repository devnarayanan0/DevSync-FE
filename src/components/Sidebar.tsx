import {
  LayoutDashboard,
  FolderSync,
  CalendarCheck,
  Terminal,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  User,
} from 'lucide-react';
import { Theme, UserProfile } from '../types';

interface SidebarProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  syncRequestsCount: number;
  user: UserProfile;
  theme: Theme;
  onThemeToggle: () => void;
}

export default function Sidebar({
  isExpanded,
  onToggleExpand,
  activeTabId,
  onSelectTab,
  syncRequestsCount,
  user,
  theme,
  onThemeToggle,
}: SidebarProps) {
  // Navigation layout configurations
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      disabled: false,
    },
    {
      id: 'requests',
      label: 'Sync Requests',
      icon: FolderSync,
      badge: syncRequestsCount > 0 ? syncRequestsCount : null,
      disabled: false,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: CalendarCheck,
      disabled: false,
    },
    {
      id: 'logs',
      label: 'Logs',
      icon: Terminal,
      badge: null,
      disabled: false,
    },
    {
      id: 'mcp',
      label: 'MCP Toolkit',
      icon: Cpu,
      badge: 'Soon',
      disabled: true,
    },
  ];

  return (
    <aside
      className={`flex flex-col border-r border-slate-900 bg-[#06070A] text-white transition-all duration-300 ease-in-out ${isExpanded ? 'w-56' : 'w-16'
        }`}
      id="devsync-navigation-sidebar"
    >
      {/* Top Sidebar Branding Header: Logo + Collapse/Expand Arrow */}
      <div className="flex h-14 items-center px-3 border-b border-slate-900/80 justify-between shrink-0">
        {isExpanded ? (
          /* Expanded: DevSync text + collapse arrow side by side */
          <>
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center focus:outline-none cursor-pointer group"
              title="Go to Dashboard"
            >
              <span className="text-lg font-extrabold tracking-tight text-white font-heading uppercase group-hover:text-lime-400 transition-colors">
                DevSync
              </span>
            </button>
            <button
              onClick={onToggleExpand}
              className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Collapse Sidebar"
              id="nav-item-collapse-toggle"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        ) : (
          /* Collapsed: DS text hides on hover, expand arrow reveals */
          <div className="relative flex items-center justify-center w-full h-full group">
            {/* DS logo — visible by default, hidden on hover */}
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center justify-center focus:outline-none cursor-pointer w-full"
              title="Go to Dashboard"
            >
              <span className="text-lg font-extrabold tracking-tight text-white font-heading uppercase transition-opacity duration-200 group-hover:opacity-0">
                DS
              </span>
            </button>
            {/* Expand arrow — hidden by default, revealed on hover */}
            <button
              onClick={onToggleExpand}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-slate-400 hover:text-white"
              title="Expand Sidebar"
              id="nav-item-collapse-toggle"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Nav Items List */}
      <nav className="flex-1 space-y-1.5 p-2 pt-4">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTabId === item.id;
          const isDisabled = item.disabled;

          if (isDisabled) {
            return (
              <div
                key={item.id}
                className={`relative flex items-center rounded-lg px-3 py-2.5 text-[11px] font-sans font-semibold tracking-wide text-slate-500 cursor-not-allowed group`}
                title={`${item.label} (Under Development)`}
              >
                <div className="flex items-center w-full justify-between">
                  <div className="flex items-center space-x-2.5">
                    <IconComponent className="h-4 w-4 opacity-50" />
                    {isExpanded && <span className="truncate">{item.label}</span>}
                  </div>
                  {isExpanded && item.badge && (
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[8px] font-bold text-slate-500 border border-slate-800">
                      Soon
                    </span>
                  )}
                </div>

                {/* Collapsed Badge Indicator */}
                {!isExpanded && (
                  <div className="absolute left-14 z-50 hidden rounded-md bg-slate-900 px-2 py-1 text-[10px] text-white shadow-xs group-hover:block whitespace-nowrap">
                    {item.label} (Coming Soon)
                  </div>
                )}
              </div>
            );
          }

          {/* Active / Inactive Nav Items */ }
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-sans tracking-wide transition-all group cursor-pointer ${isActive
                ? 'bg-lime-500 text-black font-extrabold shadow-sm border border-lime-600'
                : 'text-white font-bold hover:bg-slate-900/80 hover:text-lime-300'
                }`}
              id={`nav-item-${item.id}`}
            >
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center space-x-2.5">
                  <IconComponent
                    className={`h-4 w-4 ${isActive ? 'text-black' : 'text-white group-hover:text-lime-300'
                      }`}
                  />
                  {isExpanded && <span className="truncate">{item.label}</span>}
                </div>

                {/* Optional Action Badge */}
                {isExpanded && item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${item.id === 'activity'
                      ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
                      : 'bg-slate-800 text-white border border-slate-700'
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Hover tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-14 z-50 hidden rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white shadow-md group-hover:block whitespace-nowrap border border-slate-800">
                  {item.label}
                  {item.badge && <span className="ml-1.5 text-[10px] text-lime-400">({item.badge})</span>}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer: Theme → Settings → Profile (top to bottom) */}
      <div className="p-2 border-t border-slate-900 flex flex-col space-y-1 bg-[#06070A]">
        {/* Theme Toggle Button */}
        <button
          onClick={onThemeToggle}
          className="relative flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-sans font-bold tracking-wide text-white hover:bg-slate-900/80 hover:text-lime-300 transition-all group cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
          id="sidebar-theme-toggle"
        >
          <div className="flex items-center space-x-2.5">
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-300" />
            )}
            {isExpanded && <span className="truncate">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </div>
          {!isExpanded && (
            <div className="absolute left-14 z-50 hidden rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white shadow-md group-hover:block whitespace-nowrap border border-slate-800">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </div>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`relative flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-sans tracking-wide transition-all group cursor-pointer ${activeTabId === 'settings'
            ? 'bg-lime-500 text-black font-extrabold shadow-sm border border-lime-600'
            : 'text-white font-bold hover:bg-slate-900/80 hover:text-lime-300'
            }`}
          id="nav-item-settings"
        >
          <div className="flex items-center space-x-2.5">
            <Settings
              className={`h-4 w-4 ${activeTabId === 'settings' ? 'text-black' : 'text-white group-hover:text-lime-300'
                }`}
            />
            {isExpanded && <span className="truncate">Settings</span>}
          </div>
          {!isExpanded && (
            <div className="absolute left-14 z-50 hidden rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white shadow-md group-hover:block whitespace-nowrap border border-slate-800">
              Settings
            </div>
          )}
        </button>

        {/* Profile Button */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`relative flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-sans tracking-wide transition-all group cursor-pointer ${activeTabId === 'profile'
            ? 'bg-lime-500 text-black font-extrabold shadow-sm border border-lime-600'
            : 'text-white font-bold hover:bg-slate-900/80 hover:text-lime-300'
            }`}
          title="User Profile"
          id="nav-item-profile"
        >
          <div className="flex items-center space-x-2.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-500 text-black font-extrabold text-[9px]">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
            </div>
            {isExpanded && <span className="truncate">Profile</span>}
          </div>
          {!isExpanded && (
            <div className="absolute left-14 z-50 hidden rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white shadow-md group-hover:block whitespace-nowrap border border-slate-800">
              Profile
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

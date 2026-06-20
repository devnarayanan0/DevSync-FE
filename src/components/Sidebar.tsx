import {
  LayoutDashboard,
  FolderSync,
  CalendarCheck,
  Terminal,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  syncRequestsCount: number;
}

export default function Sidebar({
  isExpanded,
  onToggleExpand,
  activeTabId,
  onSelectTab,
  syncRequestsCount,
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
      badge: 'Auto',
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
      badge: 'Coming Soon',
      disabled: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
      disabled: false,
    },
  ];

  return (
    <aside
      className={`flex flex-col border-r border-slate-200 bg-slate-50 transition-all duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-950 ${
        isExpanded ? 'w-56' : 'w-16'
      }`}
      id="devsync-navigation-sidebar"
    >
      {/* Top Sidebar Badge */}
      <div className="flex h-12 items-center px-4 border-b border-slate-200/60 dark:border-slate-800/60 justify-between">
        {isExpanded ? (
          <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-indigo-600 dark:text-indigo-400">
            Workspace Engine
          </span>
        ) : (
          <span className="mx-auto text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
            DS
          </span>
        )}
      </div>

      {/* Main Nav Items List */}
      <nav className="flex-1 space-y-1.5 p-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTabId === item.id;
          const isDisabled = item.disabled;

          if (isDisabled) {
            return (
              <div
                key={item.id}
                className={`relative flex items-center rounded-sm px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-600 cursor-not-allowed group`}
                title={`${item.label} (Under Development)`}
              >
                <div className="flex items-center w-full justify-between">
                  <div className="flex items-center space-x-2.5">
                    <IconComponent className="h-4 w-4 opacity-65" />
                    {isExpanded && <span className="truncate">{item.label}</span>}
                  </div>
                  {isExpanded && item.badge && (
                    <span className="rounded-sm bg-slate-200/60 px-1.5 py-0.5 text-[8px] font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-500">
                      Soon
                    </span>
                  )}
                </div>

                {/* Collapsed Badge Indicator */}
                {!isExpanded && (
                  <div className="absolute left-14 z-50 hidden rounded-sm bg-slate-950 px-2 py-1 text-[10px] text-white shadow-xs group-hover:block whitespace-nowrap">
                    {item.label} (Coming Soon)
                  </div>
                )}
              </div>
            );
          }

          // Active Item as bordered card, general state as minimalist gray style
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex w-full items-center rounded-sm px-3 py-2 text-[11px] font-mono uppercase tracking-wider transition-all group ${
                isActive
                  ? 'bg-white border border-slate-200 text-indigo-600 dark:bg-slate-900 dark:border-slate-800 dark:text-indigo-400 font-bold shadow-xs'
                  : 'text-slate-450 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200'
              }`}
              id={`nav-item-${item.id}`}
            >
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center space-x-2.5">
                  <IconComponent
                    className={`h-4 w-4 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                    }`}
                  />
                  {isExpanded && <span className="truncate">{item.label}</span>}
                </div>

                {/* Optional Action Badge */}
                {isExpanded && item.badge && (
                  <span
                    className={`rounded-sm px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${
                      item.id === 'activity'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200/50 dark:bg-indigo-950/30 dark:text-indigo-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Hover tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-14 z-50 hidden rounded-sm bg-slate-950 px-2 py-1.5 text-xs text-white shadow-md group-hover:block whitespace-nowrap dark:bg-slate-800 border dark:border-slate-700">
                  {item.label}
                  {item.badge && <span className="ml-1.5 text-[10px] text-indigo-400">({item.badge})</span>}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Indicators in Sidebar */}
      {isExpanded && (
        <div className="mx-3 my-2 p-3.5 rounded-sm bg-white border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800 font-sans text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-2">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            <span>Local Sync daemon</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-650 dark:text-slate-350 font-mono">
            <span>Status:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded-sm text-[9px]">
              <span className="h-1 w-1 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              Active
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-650 dark:text-slate-350 font-mono">
            <span>Uptime:</span>
            <span className="font-mono text-slate-500 dark:text-slate-400">99.98%</span>
          </div>
        </div>
      )}

      {/* Toggle Expand Button and Footer info */}
      <div className="p-2 border-t border-slate-200/60 dark:border-slate-850 flex flex-col items-center">
        <button
          onClick={onToggleExpand}
          className="w-full flex justify-center items-center rounded-sm p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-600 dark:hover:text-slate-200 transition-all font-mono text-[10px] uppercase"
          title={isExpanded ? 'Collapse Navigation Bar' : 'Expand Navigation Bar'}
          id="sidebar-toggle-expand-button"
        >
          {isExpanded ? (
            <div className="flex items-center space-x-1 text-xs">
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Sidebar</span>
            </div>
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}

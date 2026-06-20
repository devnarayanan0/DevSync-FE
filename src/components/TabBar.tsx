import { X, Pin, Cloud, HardDrive, Sparkles } from 'lucide-react';
import { Tab } from '../types';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
}: TabBarProps) {
  return (
    <div
      className="flex h-10 w-full items-center border-b border-slate-200 bg-slate-100/60 px-2 select-none dark:border-slate-800 dark:bg-slate-950/50"
      id="devsync-tab-bar"
    >
      {/* List of tabs */}
      <div className="flex h-full items-end space-x-1 overflow-x-auto scrollbar-none flex-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isPinned = tab.id === 'dashboard';

          // Dynamic colors and layout depending on theme and active status
          return (
            <div
              key={tab.id}
              className={`group relative flex h-8.5 items-center justify-between rounded-t-sm border-t border-x px-3 transition-all text-[11px] font-mono uppercase tracking-wider cursor-default ${
                isActive
                  ? 'border-slate-200 bg-white text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-indigo-400 z-10 font-bold'
                  : 'border-transparent bg-slate-200/30 text-slate-500 hover:bg-slate-200/60 hover:text-slate-700 dark:bg-slate-950/20 dark:text-slate-400 dark:hover:bg-slate-950/50 dark:hover:text-slate-200'
              }`}
              id={`tab-wrapper-${tab.id}`}
              onClick={() => onTabSelect(tab.id)}
            >
              {/* Tab indicator icon */}
              <div className="flex items-center space-x-1.5 pr-2">
                {isPinned ? (
                  <Pin className="h-3 w-3 text-indigo-550 dark:text-indigo-400 fill-indigo-500/10" />
                ) : tab.requestData?.provider === 'aws-s3' ? (
                  <Cloud className="h-3 w-3 text-amber-500" />
                ) : (
                  <HardDrive className="h-3 w-3 text-sky-500" />
                )}

                {/* Tab Label */}
                <span className="truncate max-w-[120px]" title={tab.title}>
                  {tab.title}
                </span>
              </div>

              {/* Close Button or Pin Icon */}
              {!isPinned ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                  className="rounded-sm p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label={`Close tab ${tab.title}`}
                  id={`tab-close-trigger-${tab.id}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              ) : (
                <span className="w-2" />
              )}

              {/* Active Bottom Highlight bar */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 dark:bg-indigo-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

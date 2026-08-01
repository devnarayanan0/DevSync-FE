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
      className="flex h-10 w-full items-center border-b border-theme-border bg-theme-bg/30 px-3 select-none"
      id="devsync-tab-bar"
    >
      {/* List of tabs */}
      <div className="flex h-full items-end space-x-1 overflow-x-auto scrollbar-none flex-1 pt-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isPinned = tab.id === 'dashboard';

          return (
            <div
              key={tab.id}
              className={`group relative flex h-8.5 items-center justify-between rounded-t-xl border-t border-x border-theme-border px-3.5 transition-all text-[11px] font-sans font-bold uppercase tracking-wider cursor-pointer ${
                isActive
                  ? 'bg-theme-card text-black dark:text-white z-10 font-extrabold shadow-xs'
                  : 'bg-theme-bg/50 text-slate-700 hover:bg-theme-card/60 hover:text-black dark:text-slate-300 dark:hover:text-white'
              }`}
              id={`tab-wrapper-${tab.id}`}
              onClick={() => onTabSelect(tab.id)}
            >
              {/* Tab indicator icon */}
              <div className="flex items-center space-x-1.5 pr-2">
                {isPinned ? (
                  <Pin className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 fill-indigo-500/20" />
                ) : tab.requestData?.provider === 'aws-s3' ? (
                  <Cloud className="h-3.5 w-3.5 text-amber-500" />
                ) : (
                  <HardDrive className="h-3.5 w-3.5 text-sky-500" />
                )}

                {/* Tab Label */}
                <span className="truncate max-w-[130px]" title={tab.title}>
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
                  className="rounded-full p-0.5 text-slate-500 hover:bg-theme-bg hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  aria-label={`Close tab ${tab.title}`}
                  id={`tab-close-trigger-${tab.id}`}
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <span className="w-2" />
              )}

              {/* Active Bottom Highlight bar */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-lime-500 rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

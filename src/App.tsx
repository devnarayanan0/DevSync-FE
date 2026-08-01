import { useState, useEffect, FormEvent } from 'react';
import {
  LayoutDashboard,
  FolderSync,
  CalendarCheck,
  Terminal,
  Settings,
  Plus,
  Play,
  Pause,
  RotateCw,
  X,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  CloudLightning,
  ChevronRight,
  Database,
  Cpu,
  Monitor,
  ExternalLink,
  Shield,
  Gauge,
  Info,
  Clock,
  ArrowRight,
  Check,
} from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import AboutModal from './components/AboutModal';
import { Tab, Theme, SyncRequest, UserProfile } from './types';
import LoginPage from './components/LoginPage';
import FirstSyncWizard from './components/FirstSyncWizard';
import ProfilePage from './components/ProfilePage';
import SyncRequestsPage from './components/SyncRequestsPage';
import SyncRequestWorkspace from './components/SyncRequestWorkspace';
import ActivitySchedulingPage from './components/ActivitySchedulingPage';
import LogsPage from './components/LogsPage';
import SettingsPage from './components/SettingsPage';
import CreateSyncRequestWizard from './components/CreateSyncRequestWizard';
import DesktopBootLoader from './components/DesktopBootLoader';
import {
  isElectron,
  getSyncRequests,
  saveSyncRequest,
  deleteSyncRequest,
  updateSyncRequestPaths,
  updateSyncRequestStatus,
  showNotification
} from './lib/electron';


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Theme state system
  const [theme, setTheme] = useState<Theme>('light');
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Sync Requests database loaded from local SQLite/localStorage
  const [syncRequests, setSyncRequests] = useState<SyncRequest[]>([]);

  // Dyn load of connections, databases and tray status registers
  useEffect(() => {
    async function load() {
      const data = await getSyncRequests();
      setSyncRequests(data);
    }
    load();
  }, []);

  // Listen for Tray manual synchronization events
  useEffect(() => {
    if (isElectron()) {
      const unsubscribe = window.electronAPI!.onSyncTriggered((id: string) => {
        if (id === 'all') {
          setSyncRequests((prev) =>
            prev.map((r) => {
              if (r.status === 'idle' || r.status === 'failed') {
                updateSyncRequestStatus(r.id, 'syncing');
                return { ...r, status: 'syncing' as const };
              }
              return r;
            })
          );
        } else {
          handleTriggerSync(id);
        }
      });
      return unsubscribe;
    }
  }, [syncRequests]);

  // Tab State Management: Dashboard is always pinned as index 0
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'dashboard', title: 'Dashboard', type: 'dashboard' },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('dashboard');

  // Interactive Create Workspace state
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [newRequestName, setNewRequestName] = useState('');
  const [newRequestProvider, setNewRequestProvider] = useState<'aws-s3' | 'google-drive'>('aws-s3');
  const [newRequestLocalPath, setNewRequestLocalPath] = useState('/Users/david/workspace/');
  const [newRequestRemote, setNewRequestRemote] = useState('s3://my-cloud-bucket/');
  const [newRequestSchedule, setNewRequestSchedule] = useState('Every 1 Hour');

  // State for sub-tabs inside individual Sync Request workspaces
  // Key format: sync-request-id -> subtab ('overview' | 'settings' | 'analytics' | 'activity')
  const [workspaceSubTabs, setWorkspaceSubTabs] = useState<Record<string, 'overview' | 'settings' | 'analytics' | 'activity'>>({});

  // Real-time simulated logs data pool
  const [logMessages, setLogMessages] = useState<Array<{ timestamp: string; level: 'INFO' | 'WARN' | 'ERROR'; source: string; message: string }>>([]);

    // Auto-simulation timer removed.

  // Update HTML element on toggle theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
      });
    } else {
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }
  };

  // Switch tabs
  const handleTabSelect = (tabId: string) => {
    setActiveTabId(tabId);
  };

  // Close tab
  const handleTabClose = (tabId: string) => {
    // Cannot close dashboard
    if (tabId === 'dashboard') return;

    const targetIndex = tabs.findIndex((t) => t.id === tabId);
    if (targetIndex === -1) return;

    const filteredTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(filteredTabs);

    // If active tab is closed, activate the previous tab
    if (activeTabId === tabId) {
      const precedingTab = tabs[targetIndex - 1];
      setActiveTabId(precedingTab ? precedingTab.id : 'dashboard');
    }
  };

  // Open a Sync Request into its own tab (multi-tab experience!)
  const handleOpenSyncWorkspace = (reqId: string) => {
    const request = syncRequests.find((r) => r.id === reqId);
    if (!request) return;

    // Check if duplicate already exists
    const existingTab = tabs.find((t) => t.id === request.id);
    if (existingTab) {
      // Just activate the existing tab
      setActiveTabId(request.id);
    } else {
      // Open a brand-new workspace tab
      const newTab: Tab = {
        id: request.id,
        title: request.name,
        type: 'sync-request-workspace',
        requestData: request,
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(request.id);

      // Default the sub-tab to 'overview'
      if (!workspaceSubTabs[request.id]) {
        setWorkspaceSubTabs((prev) => ({ ...prev, [request.id]: 'overview' }));
      }
    }
  };

  // Sidebar navigates to corresponding domain view
  const handleSidebarTabNavigate = (tabId: string) => {
    // Sidebar acts as tabs. Check if the tab ID is already opened in the tabs list (like Settings, logs etc)
    const viewTitles: Record<string, string> = {
      dashboard: 'Dashboard',
      requests: 'Sync Requests',
      activity: 'Activity & Scheduling',
      logs: 'System Logs',
      settings: 'App Settings',
      profile: 'User Profile',
    };

    const viewType: Record<string, any> = {
      dashboard: 'dashboard',
      requests: 'tab-requests',
      activity: 'tab-activity',
      logs: 'tab-logs',
      settings: 'tab-settings',
      profile: 'tab-profile',
    };

    const title = viewTitles[tabId] || 'Workspace';
    const type = viewType[tabId] || 'dashboard';

    const existingTab = tabs.find((t) => t.id === tabId);
    if (existingTab) {
      setActiveTabId(tabId);
    } else {
      const newTab: Tab = {
        id: tabId,
        title: title,
        type: type,
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(tabId);
    }
  };

  // Handle Wizard action to create first or subsequent sync requests
  const handleCreateSyncRequestFromWizard = async (payload: {
    name: string;
    description?: string;
    provider: any;
    localPath: string;
    remoteFolder: string;
    schedule: string;
  }) => {
    const newId = `req-${Date.now()}`;
    const newReq: SyncRequest = {
      id: newId,
      name: payload.name,
      provider: payload.provider,
      status: 'idle',
      localPath: payload.localPath,
      remoteFolder: payload.remoteFolder,
      lastSync: 'Never Executed',
      schedule: payload.schedule,
      description: payload.description || `Synchronized ${payload.provider === 'aws-s3' ? 'S3 bucket' : 'Google Drive'} data pipeline`,
    };

    // Save of request to database
    await saveSyncRequest(newReq);
    setSyncRequests([newReq, ...syncRequests]);

    // Show native notification
    showNotification('Pipeline Registered', `The sync pipeline "${payload.name}" has been registered successfully in SQLite.`);

    // Cleanup state
    setIsWizardOpen(false);

    // Open workspace tab for the new creation
    handleOpenSyncWorkspace(newId);
  };

  // Simulating state controls
  const handleTriggerSync = async (reqId: string) => {
    await updateSyncRequestStatus(reqId, 'syncing');
    setSyncRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          showNotification('Sync Started', `Pipeline "${r.name}" process is initiating synchronization.`);
          return { ...r, status: 'syncing' };
        }
        return r;
      })
    );
  };

  const handlePauseSync = async (reqId: string) => {
    const found = syncRequests.find(r => r.id === reqId);
    if (found) {
      const nextStatus = found.status === 'paused' ? 'idle' : 'paused';
      await updateSyncRequestStatus(reqId, nextStatus);
      showNotification(nextStatus === 'paused' ? 'Pipeline Paused' : 'Pipeline Resumed', `Sync status of "${found.name}" is now ${nextStatus}.`);
    }

    setSyncRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          return { ...r, status: r.status === 'paused' ? 'idle' : 'paused' };
        }
        return r;
      })
    );
  };

  const handleDisconnectRequest = async (reqId: string) => {
    const found = syncRequests.find(r => r.id === reqId);
    if (found) {
      showNotification('Pipeline Terminated', `Successfully disconnected storage pipeline "${found.name}".`);
    }
    // Close tab first if open
    handleTabClose(reqId);
    await deleteSyncRequest(reqId);
    setSyncRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  const handleUpdatePaths = async (id: string, localPath: string, remoteFolder: string) => {
    await updateSyncRequestPaths(id, localPath, remoteFolder);
    setSyncRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, localPath, remoteFolder } : r))
    );
    setTabs((prev) =>
      prev.map((t) =>
        t.id === id && t.requestData
          ? { ...t, requestData: { ...t.requestData, localPath, remoteFolder } }
          : t
      )
    );
    showNotification('Paths Updated', 'Pipeline local source and remote directories updated successfully.');
  };

  const handleResetApp = async () => {
    setIsLoggedIn(false);
    localStorage.removeItem('devsync_is_logged_in');
    localStorage.removeItem('devsync_session');
    for (const r of syncRequests) {
      await deleteSyncRequest(r.id);
    }
    setSyncRequests([]);
    setTabs([{ id: 'dashboard', title: 'Dashboard', type: 'dashboard' }]);
    setActiveTabId('dashboard');
    showNotification('System Reset', 'All application pipelines, logs, and databases have been hard-reset.');
    alert('Application settings, logs, and sync pipelines successfully hard-reset.');
  };

  const handleLoginSuccess = (user: UserProfile, isNew: boolean) => {
    setUserProfile(user);
    localStorage.setItem('devsync_is_logged_in', 'true');
    localStorage.setItem('devsync_session', JSON.stringify(user));

    if (isNew) {
      setSyncRequests([]);
    } else {
      // No default configs
    }
    // Switch back to dashboard tab
    setTabs([{ id: 'dashboard', title: 'Dashboard', type: 'dashboard' }]);
    setActiveTabId('dashboard');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('devsync_is_logged_in');
    localStorage.removeItem('devsync_session');
    // Reset tabs to default Dashboard
    setTabs([{ id: 'dashboard', title: 'Dashboard', type: 'dashboard' }]);
    setActiveTabId('dashboard');
  };

  const handleWizardComplete = async (newReq: SyncRequest) => {
    await saveSyncRequest(newReq);
    setSyncRequests([newReq]);
    // Reset tabs to default Dashboard
    setTabs([{ id: 'dashboard', title: 'Dashboard', type: 'dashboard' }]);
    setActiveTabId('dashboard');
  };

  const filteredRequests = syncRequests.filter((r) => {
    if (!searchTerm) return true;
    return (
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.localPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.remoteFolder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.provider.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleBootComplete = (context: {
    theme: Theme;
    launchOnStartup: boolean;
    syncRequests: SyncRequest[];
    userProfile: UserProfile | null;
    isLoggedIn: boolean;
  }) => {
    setTheme(context.theme);
    setSyncRequests(context.syncRequests);
    if (context.isLoggedIn && context.userProfile) {
      setUserProfile(context.userProfile);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <DesktopBootLoader onComplete={handleBootComplete} />;
  }

  if (!isLoggedIn) {
    return (
      <LoginPage
        theme={theme}
        onThemeToggle={handleToggleTheme}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (syncRequests.length === 0 && userProfile?.email !== 'dev@local') {
    return (
      <FirstSyncWizard
        theme={theme}
        onThemeToggle={handleToggleTheme}
        onWizardComplete={handleWizardComplete}
        userEmail={userProfile!.email}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-theme-bg text-theme-text selection:bg-indigo-600/10">
      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden" id="main-frame-layout">
        {/* Sidebar Nav */}
        <Sidebar
          isExpanded={sidebarExpanded}
          onToggleExpand={() => setSidebarExpanded((prev) => !prev)}
          activeTabId={tabs.find((t) => t.id === activeTabId)?.type === 'sync-request-workspace' ? 'requests' : activeTabId}
          onSelectTab={handleSidebarTabNavigate}
          syncRequestsCount={syncRequests.length}
          user={userProfile!}
          theme={theme}
          onThemeToggle={handleToggleTheme}
        />

        {/* Workspace Display Area */}
        <main className="flex flex-1 flex-col overflow-hidden bg-theme-bg border-l border-theme-border transition-colors duration-150">
          {/* Layout Tab System */}
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabSelect={handleTabSelect}
            onTabClose={handleTabClose}
          />

          {/* Current view switcher based on activeTabId */}
          <div className="flex-1 overflow-y-auto p-6" id="dashboard-content-viewport">
            {/* SEARCH HIGHLIGHTING WARNING */}
            {searchTerm && (
              <div className="mb-4 rounded-sm bg-indigo-50 p-3 text-xs text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/50 flex justify-between items-center font-mono">
                <span>Active Global Filter: showing results containing "<strong>{searchTerm}</strong>" ({filteredRequests.length} matched)</span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="font-bold underline cursor-pointer hover:text-indigo-900"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* View - 1: Pinned Dashboard Tab */}
            {activeTabId === 'dashboard' && (
              <div className="space-y-6">
                {/* Header Welcome Card */}
                <div className="flex flex-col justify-between border-b border-theme-border pb-5 md:flex-row md:items-center">
                  <div>
                    <h1 className="page-title-heading">
                      Welcome, {userProfile!.name}
                    </h1>
                  </div>
                  <div className="mt-4 flex space-x-2 md:mt-0">
                    <button
                      onClick={() => setIsWizardOpen(true)}
                      className="inline-flex items-center space-x-2 rounded-xl bg-lime-500 px-4 py-2.5 text-xs font-extrabold font-sans uppercase tracking-wider text-black shadow-md hover:bg-lime-400 transform transition-all cursor-pointer"
                      id="dashboard-new-sync-btn"
                    >
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                      <span>New Sync Request</span>
                    </button>
                  </div>
                </div>

                {/* Dashboard Quick Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Stat Card 1: Sync Requests count */}
                  <div className="rounded-lg border border-theme-border bg-theme-card p-5 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                        Sync Requests
                      </span>
                      <FolderSync className="h-4.5 w-4.5 text-lime-600 dark:text-lime-400" />
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2 font-mono">
                      <span className="text-3xl font-extrabold text-black dark:text-white">
                        {syncRequests.length}
                      </span>
                      <span className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">Configured Mappings</span>
                    </div>
                  </div>

                  {/* Stat Card 2: Connected Providers count */}
                  <div className="rounded-lg border border-theme-border bg-theme-card p-5 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                        Connected Providers
                      </span>
                      <CloudLightning className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2 font-mono">
                      <span className="text-3xl font-extrabold text-black dark:text-white">
                        {new Set(syncRequests.map(r => r.provider)).size}
                      </span>
                      <span className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">Cloud Integrations</span>
                    </div>
                  </div>

                  {/* Stat Card 3: System Status */}
                  <div className="rounded-lg border border-theme-border bg-theme-card p-5 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                        Sync Status
                      </span>
                      <Database className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2 font-mono">
                      <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
                        Active
                      </span>
                      <span className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">Ready</span>
                    </div>
                  </div>
                </div>

                {/* Primary Bento Two-Column Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Left Column: Sync Requests quick overview panel */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-lg border border-theme-border bg-theme-card shadow-md overflow-hidden">
                      <div className="flex items-center justify-between border-b border-theme-border bg-theme-bg/50 px-5 py-4">
                        <div className="flex items-center space-x-2">
                          <FolderSync className="h-4.5 w-4.5 text-lime-600 dark:text-lime-400" />
                          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-black dark:text-white">
                            Sync Requests
                          </h2>
                        </div>
                        <button
                          onClick={() => handleSidebarTabNavigate('requests')}
                          className="text-xs font-mono uppercase tracking-wider text-lime-600 hover:text-lime-700 font-extrabold dark:text-lime-400 dark:hover:text-lime-300 cursor-pointer"
                        >
                          View All ({syncRequests.length})
                        </button>
                      </div>

                      {/* Sync request list items inside bento card */}
                      <div className="divide-y divide-theme-border">
                        {filteredRequests.map((req) => (
                          <div
                            key={req.id}
                            className="flex flex-col justify-between p-4 hover:bg-theme-bg/30 md:flex-row md:items-center transition-colors"
                          >
                            <div className="space-y-1 overflow-hidden pr-3">
                              <div className="flex items-center space-x-2">
                                <span className={`h-2 w-2 rounded-full ${
                                  req.status === 'syncing' ? 'bg-emerald-500 animate-ping' :
                                  req.status === 'idle' ? 'bg-lime-500' :
                                  req.status === 'paused' ? 'bg-slate-400' : 'bg-rose-500'
                                }`} />
                                <h3 className="text-xs font-bold text-black dark:text-white truncate">
                                  {req.name}
                                </h3>
                                <span className="rounded-md bg-theme-bg px-2 py-0.5 text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 border border-theme-border">
                                  {req.provider === 'aws-s3' ? 'AWS S3' : 'GDrive'}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 truncate whitespace-nowrap">
                                {req.localPath}
                              </p>
                            </div>

                            <div className="mt-3 flex items-center space-x-2.5 md:mt-0">
                              <button
                                onClick={() => handleOpenSyncWorkspace(req.id)}
                                className="rounded-lg bg-theme-bg hover:bg-theme-border text-black dark:text-white px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-theme-border"
                              >
                                <span>Open Workspace</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleTriggerSync(req.id)}
                                disabled={req.status === 'syncing'}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 ${
                                  req.status === 'syncing'
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 cursor-not-allowed border border-emerald-300'
                                    : 'bg-lime-500 hover:bg-lime-400 text-black font-extrabold cursor-pointer shadow-xs'
                                }`}
                              >
                                <Play className="h-3.5 w-3.5" />
                                <span>Sync</span>
                              </button>
                            </div>
                          </div>
                        ))}
                        {filteredRequests.length === 0 && (
                          <div className="p-8 text-center text-xs font-extrabold text-black dark:text-white">
                            No sync requests found mapping search criteria.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Simulation Engine Logs Overview snippet */}
                    <div className="rounded-lg border border-theme-border bg-theme-card shadow-md overflow-hidden">
                      <div className="flex items-center justify-between border-b border-theme-border bg-theme-bg/50 px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Terminal className="h-4.5 w-4.5 text-sky-500" />
                          <h2 className="text-sm font-bold text-black dark:text-white">
                            Recent Activity
                          </h2>
                        </div>
                      </div>
                      <div className="bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-white space-y-1.5 overflow-hidden">
                        {logMessages.length === 0 && <div className="text-white font-bold text-center py-3">No recent system logs</div>}
                        {logMessages.slice(-5).map((log, index) => (
                          <div key={index} className="flex space-x-2">
                            <span className="text-slate-400">[{log.timestamp}]</span>
                            <span className={`font-semibold ${
                              log.level === 'INFO' ? 'text-emerald-400' :
                              log.level === 'WARN' ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              [{log.level}]
                            </span>
                            <span className="text-sky-400 font-bold">[{log.source}]</span>
                            <span className="text-white truncate max-w-lg">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: API Connectivity, Statuses */}
                  <div className="space-y-4">
                    {/* Cloud Connections */}
                    <div className="rounded-xl border border-theme-border bg-theme-card p-5 shadow-md space-y-4">
                      <h2 className="text-sm font-extrabold text-black dark:text-white">
                        Connected Providers
                      </h2>
                      <div className="space-y-2.5">
                        {syncRequests.length === 0 ? (
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 py-2">No active cloud integrations.</div>
                        ) : (
                          Array.from(new Set(syncRequests.map(r => r.provider))).map(provider => (
                            <div key={String(provider)} className="flex items-center justify-between rounded-lg border border-theme-border p-3 bg-theme-bg/50">
                              <div className="flex items-center space-x-2.5 overflow-hidden">
                                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 uppercase border border-indigo-500/20">
                                  {String(provider).substring(0, 2)}
                                </div>
                                <div className="overflow-hidden">
                                  <h4 className="text-xs font-bold text-black dark:text-white truncate uppercase">{String(provider).replace('-', ' ')}</h4>
                                  <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">Configured via Pipeline</p>
                                </div>
                              </div>
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                Active
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* View - 2: Sync Requests Page */}
            {activeTabId === 'requests' && (
              <SyncRequestsPage
                syncRequests={syncRequests}
                onOpenWorkspace={handleOpenSyncWorkspace}
                onToggleStatus={handlePauseSync}
                onDeleteRequest={handleDisconnectRequest}
                onCreateClick={() => setIsWizardOpen(true)}
                onTriggerSync={handleTriggerSync}
              />
            )}

            {/* View - 3: Activity Page */}
            {activeTabId === 'activity' && (
              <ActivitySchedulingPage
                syncRequests={syncRequests}
                onTriggerSyncAll={() => syncRequests.forEach((r) => handleTriggerSync(r.id))}
              />
            )}

            {/* View - 4: Logs Page */}
            {activeTabId === 'logs' && <LogsPage />}

            {/* View - 5: Settings Page */}
            {activeTabId === 'settings' && (
              <SettingsPage
                theme={theme}
                onThemeToggle={handleToggleTheme}
                syncRequests={syncRequests}
                onResetApp={handleResetApp}
              />
            )}

            {/* View - Profile Page */}
            {activeTabId === 'profile' && (
              <ProfilePage
                user={userProfile}
                syncRequests={syncRequests}
                onLogout={handleLogout}
                onNavigateToTab={handleSidebarTabNavigate}
                onUpdatePasswordSuccess={() => {
                  setLogMessages((prev) => [
                    ...prev,
                    {
                      timestamp: new Date().toTimeString().split(' ')[0],
                      level: 'INFO',
                      source: 'client',
                      message: 'User profile configuration successfully updated.',
                    },
                  ]);
                }}
              />
            )}

            {/* View - 6: Active CUSTOM Sync Request Workspace */}
            {tabs.find((t) => t.id === activeTabId)?.type === 'sync-request-workspace' && (
              (() => {
                const currentTabObj = tabs.find((t) => t.id === activeTabId);
                const workspaceId = currentTabObj?.id || '';
                const reqData = syncRequests.find((r) => r.id === workspaceId);

                if (!reqData) {
                  return <p className="text-neutral-400 p-6 uppercase font-mono text-xs">Workspace data has been disconnected or removed.</p>;
                }

                return (
                  <SyncRequestWorkspace
                    reqData={reqData}
                    onTriggerSync={handleTriggerSync}
                    onToggleStatus={handlePauseSync}
                    onDeleteRequest={handleDisconnectRequest}
                    onUpdatePaths={handleUpdatePaths}
                  />
                );
              })()
            )}
          </div>
        </main>
      </div>

      {/* Embedded New Sync Request Wizard Modal Dialog */}
      <CreateSyncRequestWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleCreateSyncRequestFromWizard}
      />

      {/* Dialog: About DevSync client */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}

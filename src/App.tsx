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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // Theme state system
  const [theme, setTheme] = useState<Theme>('dark');
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Mock initial logged user
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'David Vance',
    email: 'david.vance@devsync.io',
    role: 'Storage Lead',
    tenant: 'Client-Org-Production',
  });

  // Mock starting Sync Requests database (local + cloud synced)
  const [syncRequests, setSyncRequests] = useState<SyncRequest[]>([
    {
      id: 'aws-s3-prod',
      name: 'AWS S3 Production Backup',
      provider: 'aws-s3',
      status: 'syncing',
      localPath: '/Users/david/workspace/devsync/prod-data',
      remoteFolder: 's3://production-vault-sync-us-east-1/backups/',
      lastSync: '2026-06-20 05:30:12',
      schedule: 'Every 30 Minutes',
    },
    {
      id: 'gdrive-design',
      name: 'Design & Brand Guidelines',
      provider: 'google-drive',
      status: 'idle',
      localPath: '/Users/david/designs/brand-vault',
      remoteFolder: 'gdrive://shared-drives/design-assets-hub/',
      lastSync: '2026-06-20 04:15:00',
      schedule: 'Daily at 02:00 AM',
    },
    {
      id: 'gdrive-budget',
      name: 'Q2 Budgeting Sync',
      provider: 'google-drive',
      status: 'failed',
      localPath: '/Users/david/finance/q2-work',
      remoteFolder: 'gdrive://my-drive/finance-archives/q2-2026/',
      lastSync: '2026-06-19 18:22:10',
      schedule: 'Manual Trigger Only',
    },
    {
      id: 'aws-s3-media',
      name: 'Client Video Assets',
      provider: 'aws-s3',
      status: 'paused',
      localPath: '/Users/david/videos/render-outputs',
      remoteFolder: 's3://client-delivery-bucket-s3/master-renders/',
      lastSync: '2026-06-18 10:45:30',
      schedule: 'Every 6 Hours',
    },
  ]);

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
  const [logMessages, setLogMessages] = useState<Array<{ timestamp: string; level: 'INFO' | 'WARN' | 'ERROR'; source: string; message: string }>>([
    { timestamp: '12:40:02', level: 'INFO', source: 'daemon', message: 'Local filesystem scan initialized successfully' },
    { timestamp: '12:40:15', level: 'INFO', source: 'aws-prov', message: 'Verifying AWS credentials for prod-vault-sync' },
    { timestamp: '12:40:18', level: 'INFO', source: 'sync-engine', message: 'Found 12 changed files in /Users/david/workspace/devsync/prod-data' },
    { timestamp: '12:40:22', level: 'INFO', source: 'sync-engine', message: 'Uploading batch AWS-32 to s3://production-vault-sync-us-east-1...' },
    { timestamp: '12:41:05', level: 'WARN', source: 'gdrive-prov', message: 'Rate limit threshold approaching for Q2 Budgeting space' },
    { timestamp: '12:42:10', level: 'ERROR', source: 'sync-engine', message: 'Failed to authenticate credential token: Google Drive connection returned HTTP 401 unauthorized' },
    { timestamp: '12:43:00', level: 'INFO', source: 'daemon', message: 'Database persistent state clean execution completed.' },
  ]);

  // Auto-simulation timer to prove live state & telemetry in "Desktop Dashboard"
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate random sync engine transfers occasionally
      setSyncRequests((prev) =>
        prev.map((req) => {
          if (req.status === 'syncing' && Math.random() > 0.7) {
            return {
              ...req,
              lastSync: new Date().toISOString().replace('T', ' ').substring(0, 19),
            };
          }
          return req;
        })
      );

      // Append random mock log statements occasionally to show dynamic activity
      if (Math.random() > 0.8) {
        const sources = ['daemon', 'aws-prov', 'gdrive-prov', 'scheduler'];
        const levels: ('INFO' | 'WARN')[] = ['INFO', 'WARN'];
        const messages = [
          'Calculated metadata hash validation matching remotely',
          'Hourly scheduled job verification executed',
          'Disk storage threshold check: 78% remaining healthy',
          'Established heartbeat communication with Spring API',
        ];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const curTime = new Date().toTimeString().split(' ')[0];

        setLogMessages((prev) => [
          ...prev,
          { timestamp: curTime, level: randomLevel, source: randomSource, message: randomMessage },
        ].slice(-40)); // keep last 40 logs
      }
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Update HTML element on toggle theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
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
  const handleCreateSyncRequest = (e: FormEvent) => {
    e.preventDefault();
    if (!newRequestName.trim()) return;

    const newId = `req-${Date.now()}`;
    const newReq: SyncRequest = {
      id: newId,
      name: newRequestName,
      provider: newRequestProvider,
      status: 'idle',
      localPath: newRequestLocalPath,
      remoteFolder: newRequestRemote,
      lastSync: 'Never Executed',
      schedule: newRequestSchedule,
    };

    // Save of request
    setSyncRequests([newReq, ...syncRequests]);

    // Cleanup state
    setNewRequestName('');
    setIsWizardOpen(false);

    // Open workspace tab for the new creation
    handleOpenSyncWorkspace(newId);
  };

  // Simulating state controls
  const handleTriggerSync = (reqId: string) => {
    setSyncRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          return { ...r, status: 'syncing' };
        }
        return r;
      })
    );
  };

  const handlePauseSync = (reqId: string) => {
    setSyncRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          return { ...r, status: r.status === 'paused' ? 'idle' : 'paused' };
        }
        return r;
      })
    );
  };

  const handleDisconnectRequest = (reqId: string) => {
    // Close tab first if open
    handleTabClose(reqId);
    setSyncRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  const handleUpdatePaths = (id: string, localPath: string, remoteFolder: string) => {
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
  };

  const handleResetApp = () => {
    setIsLoggedIn(false);
    setSyncRequests([]);
    setTabs([{ id: 'dashboard', title: 'Dashboard', type: 'dashboard' }]);
    setActiveTabId('dashboard');
    alert('Application settings, logs, and sync pipelines successfully hard-reset.');
  };

  const handleLoginSuccess = (user: UserProfile, isNew: boolean) => {
    setUserProfile(user);
    if (isNew) {
      setSyncRequests([]);
    } else {
      // Re-populate default configs if they were cleared
      if (syncRequests.length === 0) {
        setSyncRequests([
          {
            id: 'aws-s3-prod',
            name: 'AWS S3 Production Backup',
            provider: 'aws-s3',
            status: 'syncing',
            localPath: '/Users/david/workspace/devsync/prod-data',
            remoteFolder: 's3://production-vault-sync-us-east-1/backups/',
            lastSync: '2026-06-20 05:30:12',
            schedule: 'Every 30 Minutes',
          },
          {
            id: 'gdrive-design',
            name: 'Design & Brand Guidelines',
            provider: 'google-drive',
            status: 'idle',
            localPath: '/Users/david/designs/brand-vault',
            remoteFolder: 'gdrive://shared-drives/design-assets-hub/',
            lastSync: '2026-06-20 04:15:00',
            schedule: 'Daily at 02:00 AM',
          },
          {
            id: 'gdrive-budget',
            name: 'Q2 Budgeting Sync',
            provider: 'google-drive',
            status: 'failed',
            localPath: '/Users/david/finance/q2-work',
            remoteFolder: 'gdrive://my-drive/finance-archives/q2-2026/',
            lastSync: '2026-06-19 18:22:10',
            schedule: 'Manual Trigger Only',
          },
          {
            id: 'aws-s3-media',
            name: 'Client Video Assets',
            provider: 'aws-s3',
            status: 'paused',
            localPath: '/Users/david/videos/render-outputs',
            remoteFolder: 's3://client-delivery-bucket-s3/master-renders/',
            lastSync: '2026-06-18 10:45:30',
            schedule: 'Every 6 Hours',
          }
        ]);
      }
    }
    // Switch back to dashboard tab
    setTabs([{ id: 'dashboard', title: 'Dashboard', type: 'dashboard' }]);
    setActiveTabId('dashboard');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    // Reset tabs to default Dashboard
    setTabs([{ id: 'dashboard', title: 'Dashboard', type: 'dashboard' }]);
    setActiveTabId('dashboard');
  };

  const handleWizardComplete = (newReq: SyncRequest) => {
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

  if (!isLoggedIn) {
    return (
      <LoginPage
        theme={theme}
        onThemeToggle={handleToggleTheme}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (syncRequests.length === 0) {
    return (
      <FirstSyncWizard
        theme={theme}
        onThemeToggle={handleToggleTheme}
        onWizardComplete={handleWizardComplete}
        userEmail={userProfile.email}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-105 selection:bg-indigo-600/10">
      {/* Top Navigation Bar */}
      <Navbar
        theme={theme}
        onThemeToggle={handleToggleTheme}
        onOpenAbout={() => setAboutOpen(true)}
        user={userProfile}
        onLogout={handleLogout}
        onNavigateToTab={handleSidebarTabNavigate}
        onSearchChange={setSearchTerm}
        searchTerm={searchTerm}
      />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden" id="main-frame-layout">
        {/* Sidebar Nav */}
        <Sidebar
          isExpanded={sidebarExpanded}
          onToggleExpand={() => setSidebarExpanded((prev) => !prev)}
          activeTabId={tabs.find((t) => t.id === activeTabId)?.type === 'sync-request-workspace' ? 'requests' : activeTabId}
          onSelectTab={handleSidebarTabNavigate}
          syncRequestsCount={syncRequests.length}
        />

        {/* Workspace Display Area */}
        <main className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-150">
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
                <div className="flex flex-col justify-between border-b border-slate-100 pb-5 dark:border-slate-850 md:flex-row md:items-center">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 uppercase font-sans">
                      Welcome Back, {userProfile.name}
                    </h1>
                    <p className="text-[11px] font-mono tracking-wide text-slate-500 dark:text-slate-400 mt-1 uppercase">
                      Monitoring sync engine activities across your linked cloud cloud-stores.
                    </p>
                  </div>
                  <div className="mt-4 flex space-x-2 md:mt-0">
                    <button
                      onClick={() => setIsWizardOpen(true)}
                      className="inline-flex items-center space-x-1.5 rounded-sm bg-indigo-600 px-3.5 py-2 text-xs font-bold font-mono uppercase tracking-wider text-white shadow-xs hover:bg-indigo-500 transform transition-all cursor-pointer"
                      id="dashboard-new-sync-btn"
                    >
                      <Plus className="h-4 w-4" />
                      <span>New Sync Request</span>
                    </button>
                  </div>
                </div>

                {/* Dashboard Quick Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Stat Card 1: Active Sync requests count */}
                  <div className="rounded-sm border border-slate-200 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                        Connected Syncs
                      </span>
                      <FolderSync className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="mt-2.5 flex items-baseline space-x-1.5 font-mono">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {syncRequests.length}
                      </span>
                      <span className="text-[10px] uppercase text-slate-400 tracking-wider">active configs</span>
                    </div>
                  </div>

                  {/* Stat Card 2: Run status */}
                  <div className="rounded-sm border border-slate-200 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                        Active Operations
                      </span>
                      <CloudLightning className="h-4 w-4 text-emerald-500 animate-pulse" />
                    </div>
                    <div className="mt-2.5 flex items-baseline space-x-1.5 font-mono">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {syncRequests.filter((r) => r.status === 'syncing').length}
                      </span>
                      <span className="text-[10px] uppercase text-slate-400 tracking-wider">transfers running</span>
                    </div>
                  </div>

                  {/* Stat Card 3: Failed status helper */}
                  <div className="rounded-sm border border-slate-200 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                        Action Required
                      </span>
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="mt-2.5 flex items-baseline space-x-1.5 font-mono">
                      <span className="text-2xl font-bold text-red-650 dark:text-red-400">
                        {syncRequests.filter((r) => r.status === 'failed').length}
                      </span>
                      <span className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">errors reported</span>
                    </div>
                  </div>

                  {/* Stat Card 4: Dev sync engine version status */}
                  <div className="rounded-sm border border-slate-200 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                        Local DB Status
                      </span>
                      <Database className="h-4 w-4 text-sky-500" />
                    </div>
                    <div className="mt-2.5 flex items-baseline space-x-1.5 font-mono">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        100%
                      </span>
                      <span className="text-[10px] uppercase text-emerald-600 font-bold tracking-wider">Postgres OK</span>
                    </div>
                  </div>
                </div>

                {/* Primary Bento Two-Column Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Left Column: Sync Requests quick overview panel */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-sm border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/20 shadow-xs overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-250 bg-slate-50 px-4 py-3.5 dark:border-slate-850 dark:bg-slate-900/60">
                        <div className="flex items-center space-x-2">
                          <FolderSync className="h-4 w-4 text-indigo-500" />
                          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
                            Synchronization Registry
                          </h2>
                        </div>
                        <button
                          onClick={() => handleSidebarTabNavigate('requests')}
                          className="text-xs font-mono uppercase tracking-wider text-indigo-600 hover:text-indigo-800 font-bold dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          View All ({syncRequests.length})
                        </button>
                      </div>

                      {/* Sync request list items inside bento card */}
                      <div className="divide-y divide-slate-100 dark:divide-slate-850">
                        {filteredRequests.map((req) => (
                          <div
                            key={req.id}
                            className="flex flex-col justify-between p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 md:flex-row md:items-center transition-colors"
                          >
                            <div className="space-y-1 overflow-hidden pr-3">
                              <div className="flex items-center space-x-2">
                                <span className={`h-2 w-2 rounded-full ${
                                  req.status === 'syncing' ? 'bg-emerald-500 animate-ping' :
                                  req.status === 'idle' ? 'bg-indigo-400' :
                                  req.status === 'paused' ? 'bg-neutral-400' : 'bg-rose-500'
                                }`} />
                                <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-50 truncate">
                                  {req.name}
                                </h3>
                                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-mono font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                  {req.provider === 'aws-s3' ? 'AWS S3' : 'GDrive'}
                                </span>
                              </div>
                              <p className="text-[10px] font-mono text-neutral-400 truncate whitespace-nowrap">
                                {req.localPath}
                              </p>
                            </div>

                            <div className="mt-3 flex items-center space-x-2.5 md:mt-0">
                              <button
                                onClick={() => handleOpenSyncWorkspace(req.id)}
                                className="rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 dark:text-indigo-300 dark:hover:text-indigo-200 px-2.5 py-1 text-[11px] font-medium text-indigo-700 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <span>Open Workspace</span>
                                <ChevronRight className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleTriggerSync(req.id)}
                                disabled={req.status === 'syncing'}
                                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all flex items-center gap-1 ${
                                  req.status === 'syncing'
                                    ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                                }`}
                              >
                                <Play className="h-3 w-3" />
                                <span>Sync</span>
                              </button>
                            </div>
                          </div>
                        ))}
                        {filteredRequests.length === 0 && (
                          <div className="p-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
                            No sync requests found mapping search criteria.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Simulation Engine Logs Overview snippet */}
                    <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950/20 shadow-xs overflow-hidden">
                      <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-4 py-3 dark:border-neutral-800/60 dark:bg-neutral-950/30">
                        <div className="flex items-center space-x-2">
                          <Terminal className="h-4 w-4 text-sky-500" />
                          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                            Live Synchronization Telemetry
                          </h2>
                        </div>
                        <button
                          onClick={() => handleSidebarTabNavigate('logs')}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Raw Console View
                        </button>
                      </div>
                      <div className="bg-neutral-950 p-4 font-mono text-[11px] leading-relaxed text-neutral-300 space-y-1.5 overflow-hidden">
                        {logMessages.slice(-5).map((log, index) => (
                          <div key={index} className="flex space-x-2">
                            <span className="text-neutral-500">[{log.timestamp}]</span>
                            <span className={`font-semibold ${
                              log.level === 'INFO' ? 'text-emerald-400' :
                              log.level === 'WARN' ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              [{log.level}]
                            </span>
                            <span className="text-sky-450 font-bold">[{log.source}]</span>
                            <span className="text-neutral-300 truncate max-w-lg">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: API Connectivity, Statuses, and Coming Soon placeholders */}
                  <div className="space-y-4">
                    {/* Cloud Connections */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-4.5 dark:border-neutral-800 dark:bg-neutral-950/20 shadow-xs space-y-4">
                      <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                        Multi-Provider Integrations
                      </h2>

                      <div className="space-y-2.5">
                        {/* AWS Provider */}
                        <div className="flex items-center justify-between rounded-lg border border-neutral-100 p-2.5 dark:border-neutral-800/80 dark:bg-neutral-900/60">
                          <div className="flex items-center space-x-2 overflow-hidden">
                            <div className="h-7 w-7 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                              S3
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="text-xs font-semibold text-neutral-900 dark:text-white truncate">AWS S3 Integration</h4>
                              <p className="text-[10px] text-neutral-400 truncate">Token expires in 6 hours</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            Active
                          </span>
                        </div>

                        {/* Google Drive Provider */}
                        <div className="flex items-center justify-between rounded-lg border border-neutral-100 p-2.5 dark:border-neutral-800/80 dark:bg-neutral-900/60">
                          <div className="flex items-center space-x-2 overflow-hidden">
                            <div className="h-7 w-7 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                              GD
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="text-xs font-semibold text-neutral-900 dark:text-white truncate">Google Drive OAuth</h4>
                              <p className="text-[10px] text-neutral-400 truncate">Approved Tenant Scope</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            Active
                          </span>
                        </div>

                        {/* MS Azure - Coming Soon */}
                        <div className="flex items-center justify-between rounded-lg border border-neutral-200/40 p-2.5 dark:border-neutral-800/40 bg-neutral-50/20 opacity-60">
                          <div className="flex items-center space-x-2">
                            <div className="h-7 w-7 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                              AZ
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Microsoft Azure Blob</h4>
                              <p className="text-[10px] text-neutral-400">Status: Coming Soon</p>
                            </div>
                          </div>
                        </div>

                        {/* Dropbox - Coming Soon */}
                        <div className="flex items-center justify-between rounded-lg border border-neutral-200/40 p-2.5 dark:border-neutral-800/40 bg-neutral-50/20 opacity-60">
                          <div className="flex items-center space-x-2">
                            <div className="h-7 w-7 rounded bg-sky-505/10 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                              DB
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Dropbox Synclink</h4>
                              <p className="text-[10px] text-neutral-400">Status: Coming Soon</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scheduling automation quick check */}
                    <div className="rounded-xl border border-neutral-200 bg-indigo-900/5 p-4.5 dark:border-neutral-850 dark:bg-indigo-950/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-800 dark:text-indigo-400">
                          Desktop Daemon Settings
                        </span>
                        <Settings className="h-4 w-4 text-indigo-500" />
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        DevSync client is currently configured to store local replication markers in internal SQLite db. To swap to external PostgreSQL storage database, shift configure keys in Settings.
                      </p>
                      <button
                        onClick={() => handleSidebarTabNavigate('settings')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                      >
                        Navigate to Database Config <ArrowRight className="h-3 w-3" />
                      </button>
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
                      source: 'daemon',
                      message: 'User password successfully updated in SQLite user record.',
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
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs"
            onClick={() => setIsWizardOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 z-50">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FolderSync className="h-5 w-5 text-indigo-500" />
                Initialize Next cloud synchronization
              </h3>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-150 dark:hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSyncRequest} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Synchronize Name / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Production Files Replication"
                  value={newRequestName}
                  onChange={(e) => setNewRequestName(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-neutral-50 p-2 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Cloud Storage Provider
                  </label>
                  <select
                    value={newRequestProvider}
                    onChange={(e: any) => setNewRequestProvider(e.target.value)}
                    className="w-full rounded border border-neutral-300 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <option value="aws-s3">AWS S3 Integration</option>
                    <option value="google-drive">Google Drive Workspace</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Cron Schedule Frequency
                  </label>
                  <select
                    value={newRequestSchedule}
                    onChange={(e) => setNewRequestSchedule(e.target.value)}
                    className="w-full rounded border border-neutral-300 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <option value="Every 30 Minutes">Every 30 Minutes</option>
                    <option value="Every 1 Hour">Every 1 Hour</option>
                    <option value="Every 6 Hours">Every 6 Hours</option>
                    <option value="Daily at 02:00 AM">Daily at 02:00 AM</option>
                    <option value="Manual Trigger Only">Manual Trigger Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Local Folder Source Path
                </label>
                <input
                  type="text"
                  required
                  value={newRequestLocalPath}
                  onChange={(e) => setNewRequestLocalPath(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-neutral-50 p-2 font-mono dark:border-neutral-800 dark:bg-neutral-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Remote Cloud Bucket Target
                </label>
                <input
                  type="text"
                  required
                  value={newRequestRemote}
                  onChange={(e) => setNewRequestRemote(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-neutral-50 p-2 font-mono dark:border-neutral-800 dark:bg-neutral-950"
                />
              </div>

              <div className="flex items-center space-x-2 rounded-lg bg-indigo-50/50 p-3 text-[11px] text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-200/20">
                <Info className="h-4 w-4 text-indigo-500" />
                <span>Creating sync request will instantiate direct background mapping hooks using the Spring API container.</span>
              </div>

              <div className="mt-5 flex justify-end space-x-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="rounded border border-neutral-300 px-4 py-1.5 text-xs hover:bg-neutral-55 dark:border-neutral-750 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-indigo-600 px-4 py-1.5 text-xs text-white font-bold hover:bg-indigo-500"
                >
                  Initialize Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog: About DevSync client */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}

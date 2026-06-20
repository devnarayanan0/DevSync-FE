import React, { useState } from 'react';
import {
  RotateCw,
  Pause,
  Play,
  Trash2,
  FolderOpen,
  ArrowRight,
  Cloud,
  HardDrive,
  Database,
  Grid,
  TrendingUp,
  Cpu,
  BarChart2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Terminal,
  Activity,
  Calendar,
  Folder,
  Server,
  Maximize2,
  CornerDownRight,
  ShieldAlert,
} from 'lucide-react';
import { SyncRequest, ProviderType } from '../types';

interface SyncRequestWorkspaceProps {
  reqData: SyncRequest;
  onTriggerSync: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onUpdatePaths: (id: string, localPath: string, remoteFolder: string) => void;
}

const getProviderLabel = (provider: ProviderType | string) => {
  return provider === 'aws-s3' ? 'AWS S3 Cloud Link' : 'Google Drive Workspace';
};

// Simple mock activity entries for realistic terminal display
const MOCK_ACTIVITIES = [
  { id: '1', time: '10:15:30 AM', operation: 'UPLOAD', status: 'SUCCESS', message: 'budget_q2_draft.xlsx synchronized cleanly.' },
  { id: '2', time: '10:15:32 AM', operation: 'UPLOAD', status: 'SUCCESS', message: 'sales_forecast_final.pdf uploaded.' },
  { id: '3', time: '10:20:00 AM', operation: 'DOWNLOAD', status: 'SUCCESS', message: 'brand_identity_v2.zip updated locally.' },
  { id: '4', time: '10:25:12 AM', operation: 'UPLOAD', status: 'SUCCESS', message: 'index_integrity_hash.md recalculated.' },
  { id: '5', time: '10:30:15 AM', operation: 'SYNC', status: 'FAILED', message: 'Transient API rate limit throttled connection. Retrying...' },
  { id: '6', time: '10:31:00 AM', operation: 'DOWNLOAD', status: 'SUCCESS', message: 'Retried download of patch-v2.0.sh succeeded.' },
  { id: '7', time: '11:02:44 AM', operation: 'UPLOAD', status: 'SUCCESS', message: 'client_presentation_deck.pptx uploaded (34.2 MB).' },
  { id: '8', time: '11:05:00 AM', operation: 'DOWNLOAD', status: 'SUCCESS', message: 'team_meeting_notes.md downloaded.' },
  { id: '9', time: '11:15:10 AM', operation: 'SYNC', status: 'SUCCESS', message: 'Local inventory scan completed. 0 file conflicts.' },
];

export default function SyncRequestWorkspace({
  reqData,
  onTriggerSync,
  onToggleStatus,
  onDeleteRequest,
  onUpdatePaths,
}: SyncRequestWorkspaceProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'connection' | 'analytics' | 'activity'>('overview');
  const [activityFilter, setActivityFilter] = useState<'all' | 'uploads' | 'downloads' | 'errors'>('all');

  // Interactive config state
  const [editingRemote, setEditingRemote] = useState(reqData.remoteFolder);
  const [isEditingRemoteOpen, setIsEditingRemoteOpen] = useState(false);
  const [showLocalExplorer, setShowLocalExplorer] = useState(false);
  const [selectedMockLocalPath, setSelectedMockLocalPath] = useState(reqData.localPath);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // File explorer mock navigation
  const [explorerCurrentDir, setExplorerCurrentDir] = useState('Home');
  const [explorerFolders, setExplorerFolders] = useState([
    { name: 'Documents', path: '/Users/david/Documents' },
    { name: 'Downloads', path: '/Users/david/Downloads' },
    { name: 'workspace', path: '/Users/david/workspace' },
    { name: 'devsync-replicates', path: '/Users/david/workspace/devsync-replicates' },
    { name: 'local-vaults', path: '/Users/david/local-vaults' },
  ]);

  const handleApplyRemoteChange = () => {
    onUpdatePaths(reqData.id, selectedMockLocalPath, editingRemote);
    setIsEditingRemoteOpen(false);
  };

  const handleSelectMockFolder = (pathStr: string) => {
    setSelectedMockLocalPath(pathStr);
    onUpdatePaths(reqData.id, pathStr, editingRemote);
    setShowLocalExplorer(false);
  };

  const syncStatusActive = reqData.status === 'syncing' || reqData.status === 'idle';

  // Sub-metrics generators based on req name
  const isAWS = reqData.provider === 'aws-s3';
  const tenantID = `tenant-${isAWS ? 'aws' : 'gdrive'}-corp-3004`;

  // Filtered activity timeline
  const getFilteredActivities = () => {
    return MOCK_ACTIVITIES.filter((act) => {
      if (activityFilter === 'all') return true;
      if (activityFilter === 'uploads') return act.operation === 'UPLOAD';
      if (activityFilter === 'downloads') return act.operation === 'DOWNLOAD';
      if (activityFilter === 'errors') return act.status === 'FAILED';
      return true;
    });
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header Panel */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-850 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center flex-wrap gap-2.5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                reqData.status === 'syncing' ? 'bg-emerald-500 animate-ping' :
                reqData.status === 'idle' ? 'bg-sky-400' : 'bg-slate-400'
              }`}
            />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 uppercase tracking-tight font-sans">
              {reqData.name}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 font-mono">
              {isAWS ? <Cloud className="h-3 w-3 text-amber-500" /> : <HardDrive className="h-3 w-3 text-sky-500" />}
              {isAWS ? 'AWS S3 CONTAINER-LINK' : 'GOOGLE DRIVE CLOUD API'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
            Workspace context • Tenant namespace: <strong className="text-indigo-600 dark:text-indigo-400">{tenantID}</strong> • Replica state: <strong className="text-slate-705 dark:text-slate-200">{reqData.status}</strong>
          </p>
        </div>

        {/* Workspace controls */}
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          <button
            onClick={() => onTriggerSync(reqData.id)}
            disabled={reqData.status === 'syncing'}
            className={`rounded-sm px-3.5 py-2 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
              reqData.status === 'syncing'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-450 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-550 text-white shadow-xs'
            }`}
          >
            <RotateCw className={`h-4 w-4 ${reqData.status === 'syncing' ? 'animate-spin' : ''}`} />
            <span>{reqData.status === 'syncing' ? 'Syncing...' : 'Sync Now'}</span>
          </button>

          <button
            onClick={() => onToggleStatus(reqData.id)}
            className="rounded-sm border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-707 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {syncStatusActive ? (
              <>
                <Pause className="h-4 w-4 text-amber-500" />
                <span>Pause Auto-cron</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 text-emerald-500" />
                <span>Resume Auto-cron</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-sm border border-red-200 bg-red-50/20 text-red-700 hover:bg-red-55 px-3.5 py-2 font-bold uppercase tracking-wider flex items-center gap-1.5 dark:border-red-900/40 dark:bg-red-955/20 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Request</span>
          </button>
        </div>
      </div>

      {/* Workspace subtabs selection */}
      <div className="flex border-b border-slate-200 dark:border-slate-850 text-xs font-mono lowercase">
        {[
          { id: 'overview', label: 'Overview Metrics' },
          { id: 'connection', label: 'Connection & Paths' },
          { id: 'analytics', label: 'Telemetry Analytics' },
          { id: 'activity', label: 'Activity Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 border-b-2 font-bold transition-all uppercase tracking-wider cursor-pointer ${
              activeSubTab === tab.id
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW VIEW */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Information details card */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4 lg:col-span-2">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 pb-2.5 dark:border-slate-855">
              <Database className="h-4 w-4 text-indigo-500" />
              Sync Request Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono uppercase">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block font-bold">Request Namespace:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold block bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 px-2.5 py-1.5 rounded-sm truncate">
                  {reqData.name}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block font-bold">Provider Token:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold block bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 px-2.5 py-1.5 rounded-sm">
                  {getProviderLabel(reqData.provider)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block font-bold">Tenant Reference:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold block bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 px-2.5 py-1.5 rounded-sm truncate">
                  {tenantID}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block font-bold">Cron Schedule Mode:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold block bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 px-2.5 py-1.5 rounded-sm">
                  {reqData.schedule}
                </span>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-[10px] text-slate-400 block font-bold">Local replication base:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold block bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 px-2.5 py-1.5 rounded-sm truncate font-mono lower-case">
                  {reqData.localPath}
                </span>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-[10px] text-slate-400 block font-bold">Remote cloud workspace:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold block bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 px-2.5 py-1.5 rounded-sm truncate font-mono lower-case">
                  {reqData.remoteFolder}
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-855 flex flex-wrap gap-x-6 text-[10px] font-mono text-slate-450 uppercase">
              <span>CREATED: <strong>12-JUN-2026</strong></span>
              <span>LAST VERIFIED SYNC: <strong className="text-slate-705 dark:text-indigo-400">{reqData.lastSync}</strong></span>
              <span>INTEGRITY STATUS: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</strong></span>
            </div>
          </div>

          {/* Sync summary card */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 pb-2.5 dark:border-slate-855">
              <Grid className="h-4 w-4 text-indigo-500" />
              Replication Summary
            </h3>

            <div className="space-y-3 font-mono text-xs uppercase">
              <div className="flex items-center justify-between border-b pb-2 border-slate-100/60 dark:border-slate-850">
                <span className="text-slate-400 font-semibold text-[10px]">Total Files Synced:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">1,482 Files</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2 border-slate-100/60 dark:border-slate-850">
                <span className="text-slate-400 font-semibold text-[10px]">Last Upload Activity:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">12 Mins Ago</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2 border-slate-100/60 dark:border-slate-850">
                <span className="text-slate-400 font-semibold text-[10px]">Last Download Sync:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">24 Mins Ago</span>
              </div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-slate-400 font-semibold text-[10px]">Last Validation Error:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1 rounded-sm text-[10px]">
                  None (100% OK)
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 p-3 rounded-sm text-[10px] font-mono lowercase text-slate-450 dark:text-slate-400 leading-relaxed uppercase">
              <div className="flex items-center gap-1.5 text-slate-705 dark:text-slate-350 font-bold mb-1">
                <Server className="h-3.5 w-3.5 text-indigo-500" />
                <span>Spring Auth Session token</span>
              </div>
              SESSION CONTEXT VERIFIED. CLIENT ENDPOINT REGISTERED AS LIVE. PARALLEL DEGRADATION METRICS SHIELDED.
            </div>
          </div>
        </div>
      )}

      {/* 2. CONNECTION SETTINGS VIEW */}
      {activeSubTab === 'connection' && (
        <div className="space-y-6">
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 border-b border-slate-100 pb-2.5 dark:border-slate-855">
              Link Endpoint & Directories Control
            </h3>

            <div className="space-y-4">
              {/* Provider Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono uppercase">
                <div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 p-3.5 rounded-sm">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Provider Platform:</span>
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    {isAWS ? <Cloud className="h-4 w-4 text-amber-500" /> : <HardDrive className="h-4 w-4 text-sky-500" />}
                    <span>{getProviderLabel(reqData.provider)}</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 p-3.5 rounded-sm">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Target Tenant ID:</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{tenantID}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 p-3.5 rounded-sm">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Link Security Status:</span>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>VERIFIED & TOKEN SECURED</span>
                  </div>
                </div>
              </div>

              {/* Local Folder browse */}
              <div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 p-4.5 rounded-sm text-xs font-mono uppercase space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">Local Workstation Base Replication Folder</span>
                  <span className="text-[9px] text-slate-400 font-bold">Finder Directory Selection Path</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 p-2 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-sm font-semibold text-slate-705 dark:text-slate-202 truncate select-all font-mono lowercase">
                    {selectedMockLocalPath}
                  </div>
                  <button
                    onClick={() => setShowLocalExplorer(true)}
                    className="h-10 px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-sm font-bold uppercase transition-colors shrink-0 cursor-pointer"
                  >
                    Browse Workstation Finder
                  </button>
                </div>
              </div>

              {/* Remote Configuration */}
              <div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 p-4.5 rounded-sm text-xs font-mono uppercase space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">
                    {isAWS ? 'Target AWS S3 Bucket Destination URI' : 'Target Google Drive Shared Folder Identifier'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">URI Scheme Provider link</span>
                </div>

                {isEditingRemoteOpen ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={editingRemote}
                      onChange={(e) => setEditingRemote(e.target.value)}
                      className="flex-1 h-10 px-3 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-sm text-slate-850 dark:text-slate-101 outline-none text-xs font-mono lowercase"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleApplyRemoteChange}
                        className="h-10 px-4 bg-indigo-600 hover:bg-indigo-555 text-white rounded-sm font-bold uppercase cursor-pointer"
                      >
                        Apply Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditingRemote(reqData.remoteFolder);
                          setIsEditingRemoteOpen(false);
                        }}
                        className="h-10 px-4 border border-slate-250 bg-white hover:bg-slate-50 text-slate-650 dark:border-slate-800 dark:bg-slate-955 rounded-sm font-bold uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 p-2 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-sm font-semibold text-indigo-604 dark:text-indigo-402 truncate font-mono lowercase">
                      {reqData.remoteFolder}
                    </div>
                    <button
                      onClick={() => setIsEditingRemoteOpen(true)}
                      className="h-10 px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-sm font-bold uppercase transition-colors shrink-0 cursor-pointer"
                    >
                      Change Destination
                    </button>
                  </div>
                )}
              </div>

              {/* Endpoint configurations & Controls */}
              <div className="border-t border-slate-100 pt-4.5 dark:border-slate-850 flex flex-wrap gap-4 items-center justify-between text-xs font-mono uppercase">
                <div className="flex items-center gap-1.1 text-slate-405 dark:text-slate-401">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Credential keys synchronized perfectly by local SQLite engine.</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onToggleStatus(reqData.id)}
                    className={`px-4 py-2 font-bold uppercase tracking-wider rounded-sm text-white ${
                      syncStatusActive ? 'bg-amber-600 hover:bg-amber-550' : 'bg-emerald-600 hover:bg-emerald-555'
                    }`}
                  >
                    {syncStatusActive ? 'Deactivate automated replication' : 'Activate automated replication'}
                  </button>
                  <button
                    onClick={() => {
                      onUpdatePaths(reqData.id, selectedMockLocalPath, editingRemote);
                      alert('Connection Link settings saved successfully to local SQLite client database.');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-555 text-white font-bold uppercase tracking-wider rounded-sm cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TELEMETRY ANALYTICS VIEW */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cards */}
            <div className="rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-1.5 font-mono uppercase">
              <span className="text-[10px] text-slate-400 font-bold block">Total Upload Volume</span>
              <p className="text-xl font-bold font-sans text-slate-850 dark:text-slate-50 tracking-tight">41.2 GB</p>
              <div className="text-[9px] text-slate-450 dark:text-slate-401 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span>+4.2 GB since last week</span>
              </div>
            </div>

            <div className="rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-1.5 font-mono uppercase">
              <span className="text-[10px] text-slate-400 font-bold block">Total Download Volume</span>
              <p className="text-xl font-bold font-sans text-slate-850 dark:text-slate-50 tracking-tight">33.0 GB</p>
              <div className="text-[9px] text-slate-450 dark:text-slate-401 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span>+1.8 GB since last week</span>
              </div>
            </div>

            <div className="rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-1.5 font-mono uppercase">
              <span className="text-[10px] text-slate-400 font-bold block">Files indexed & synchronized</span>
              <p className="text-xl font-bold font-sans text-slate-850 dark:text-slate-50 tracking-tight">1,482 FILES</p>
              <div className="text-[9px] text-emerald-600 dark:text-emerald-450 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 px-1 py-0.2 rounded-sm w-fit font-bold font-sans text-[8px] tracking-wider">
                <span>Healthy status</span>
              </div>
            </div>

            <div className="rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-1.5 font-mono uppercase">
              <span className="text-[10px] text-slate-400 font-bold block">Allocated Cloud Quota Used</span>
              <p className="text-xl font-bold font-sans text-slate-850 dark:text-slate-50 tracking-tight">74.2%</p>
              <div className="text-[9px] text-slate-450 dark:text-slate-401">
                <span>74.2 GB out of 100 GB cap used</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visualizer charts */}
            <div className="md:col-span-2 rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4 font-mono uppercase">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 pb-2.5 dark:border-slate-855">
                <BarChart2 className="h-4 w-4 text-indigo-500" />
                Hourly Transfer Volume (MB/Hr)
              </h3>

              {/* Interactive bar graph custom layout */}
              <div className="space-y-3.5 pt-1.5 text-[10px]">
                {[
                  { hour: '08:00 AM (Sync Base)', uploads: 120, downloads: 40 },
                  { hour: '09:00 AM (Integrity scan)', uploads: 340, downloads: 180 },
                  { hour: '10:00 AM (Active worker)', uploads: 560, downloads: 540 },
                  { hour: '11:00 AM (Current active run)', uploads: 490, downloads: 350 },
                ].map((item, idx) => {
                  const total = item.uploads + item.downloads;
                  const maxPercent = (total / 1100) * 100;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-705 dark:text-slate-350">
                        <span>{item.hour}</span>
                        <span>{total} MB replication size</span>
                      </div>
                      <div className="h-4.5 bg-slate-100 dark:bg-slate-900 rounded-sm overflow-hidden flex">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all"
                          style={{ width: `${(item.uploads / 1100) * 100}%` }}
                          title={`Uploads: ${item.uploads} MB`}
                        />
                        <div
                          className="bg-sky-500 dark:bg-sky-400 h-full transition-all"
                          style={{ width: `${(item.downloads / 1100) * 100}%` }}
                          title={`Downloads: ${item.downloads} MB`}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-[9px] text-slate-450">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-indigo-600 block" /> Uploads {item.uploads} MB
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-sky-500 block" /> Downloads {item.downloads} MB
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Health indicators */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4 font-mono uppercase">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 pb-2.5 dark:border-slate-855">
                <Cpu className="h-4 w-4 text-indigo-500" />
                Pipeline Engine Diagnostics
              </h3>

              <div className="space-y-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-bold uppercase">Success Rate:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-450">99.8% Perfect</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[99.8%]" />
                  </div>
                </div>

                <div className="space-y-1.1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Failed replication ops:</span>
                  <div className="font-bold text-red-650 dark:text-red-400 bg-red-50/15 dark:bg-red-955/20 px-2 py-1 rounded-sm w-fit">
                    1 File Interrupted (Hash Mismatch retry successful)
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Average sync duration:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-205">
                    12.4 SECONDS / SYNC TRIGGER
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-850 text-[10px] text-slate-405 leading-relaxed">
                  DIAGNOSTICS CHECKS PERFORMED THROUGH LOCAL DAEMON CRONTAB. LATENCY RATE AND SECTOR LINKAGE TEST PASSING.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACTIVITY VIEW */}
      {activeSubTab === 'activity' && (
        <div className="space-y-6">
          <div className="rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase">
            <div className="flex items-center gap-1.5 font-bold text-slate-805 dark:text-slate-101">
              <Activity className="h-4 w-4 text-indigo-500" />
              <span>Target Sync Workspace Activity Feed</span>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-1 border border-slate-250 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950/40 rounded-sm">
              <span className="text-[10px] text-slate-400 px-2 font-bold uppercase">Chronology Level:</span>
              {(['all', 'uploads', 'downloads', 'errors'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setActivityFilter(lvl)}
                  className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase transition-all ${
                    activityFilter === lvl
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-250'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Activity timeline terminal layout */}
          {getFilteredActivities().length === 0 ? (
            <div className="p-10 border border-dashed border-slate-200 rounded-sm text-center bg-white dark:border-slate-850 dark:bg-slate-955 gap-1 uppercase font-mono text-xs">
              <AlertTriangle className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">No Activity Available</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Please check your timeline filters or trigger a manual sync now.</p>
            </div>
          ) : (
            <div className="rounded-sm border border-slate-200 bg-slate-950 p-5 font-mono text-xs text-neutral-300 shadow-xl space-y-3 max-h-[480px] overflow-y-auto">
              <div className="border-b border-neutral-800 pb-2 mb-2 text-neutral-500 flex justify-between uppercase text-[10px] font-bold">
                <span>STDOUT Stream for: {reqData.name} - Filter: {activityFilter}</span>
                <span>Active Link Connection verified</span>
              </div>
              <div className="space-y-2 leading-relaxed font-mono">
                {getFilteredActivities().map((act) => (
                  <div key={act.id} className="flex flex-col sm:flex-row gap-x-3.5 hover:bg-neutral-900/60 p-1 rounded-sm">
                    <span className="text-neutral-550 shrink-0 font-bold">[{act.time}]</span>
                    <span
                      className={`font-bold shrink-0 uppercase tracking-wide bg-neutral-900 border border-neutral-800 px-1 py-0.2 rounded text-[10px] text-center min-w-[75px] h-fit ${
                        act.status === 'FAILED'
                          ? 'text-red-500 border-red-950'
                          : act.operation === 'UPLOAD'
                          ? 'text-indigo-400 border-indigo-950'
                          : 'text-sky-400 border-sky-950'
                      }`}
                    >
                      {act.operation}
                    </span>
                    <span
                      className={`shrink-0 font-bold uppercase tracking-widest text-[9px] ${
                        act.status === 'FAILED' ? 'text-red-500' : 'text-emerald-500'
                      }`}
                    >
                      [{act.status}]
                    </span>
                    <span className="text-neutral-201 text-[11px] font-mono lowercase tracking-wide font-medium">
                      {act.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation delete item modal overlay dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-50 z-50 shadow-xl space-y-4 font-mono text-xs uppercase">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-855 pb-2.5">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="font-bold">Delete Sync Request?</h3>
            </div>
            <p className="text-[11px] text-slate-500 lowercase leading-relaxed">
              Confirm entirely removing sync pipeline "{reqData.name}" from your local machine. This irreversibly purges replicated scheduling logs and credentials.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-2 border border-slate-200 bg-white text-slate-705 dark:border-slate-800 dark:bg-slate-955 rounded-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteRequest(reqData.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-550 text-white rounded-sm font-bold transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WINDOWS FINDER / MAC FINDER EXPLORER Mock Modal Overlay dialog */}
      {showLocalExplorer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setShowLocalExplorer(false)}
          />
          <div className="relative w-full max-w-md rounded-sm border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-slate-105 z-50 shadow-2xl p-4 font-mono text-xs uppercase space-y-4">
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-850 text-slate-900 dark:text-slate-101">
              <h3 className="font-bold flex items-center gap-2">
                <FolderOpen className="h-4.5 w-4.5 text-indigo-500" />
                Desktop Workstation Explorer Finder
              </h3>
              <button
                onClick={() => setShowLocalExplorer(false)}
                className="p-1 hover:bg-slate-100 rounded-sm dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-950/80 border dark:border-slate-850 rounded-sm text-[10px] text-slate-505 dark:text-slate-400 font-bold lowercase">
              <CornerDownRight className="h-3.5 w-3.5 text-slate-400" />
              <span>Current Finder Scope: {explorerCurrentDir}</span>
            </div>

            <div className="space-y-1.5 text-slate-808 dark:text-slate-202 max-h-[180px] overflow-y-auto">
              {explorerFolders.map((fd, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectMockFolder(fd.path)}
                  className="flex items-center justify-between p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-sm border border-slate-100 hover:border-indigo-200 dark:border-slate-850/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <Folder className="h-4 w-4 text-indigo-500 fill-indigo-500/10" />
                    <span className="font-mono lowercase text-[11px] font-medium text-slate-805 dark:text-slate-101">
                      {fd.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.2 rounded-sm lowercase font-mono">
                    {fd.path}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-101 pt-3.5 dark:border-slate-850 flex items-center justify-between text-[10px] text-slate-405 lowercase leading-relaxed">
              <span>Select the desired workstation directory root to map file synchronization.</span>
              <button
                onClick={() => setShowLocalExplorer(false)}
                className="px-3 py-1.5 border border-slate-200 bg-white text-slate-705 dark:border-slate-800 dark:bg-slate-955 rounded-sm hover:bg-slate-50 uppercase text-[10px] font-bold"
              >
                Close Finder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Close standard icon helper
function X({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onClick={onClick}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

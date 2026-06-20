import React, { useState } from 'react';
import {
  RotateCw,
  Pause,
  Play,
  Trash2,
  FolderOpen,
  Cloud,
  HardDrive,
  Database,
  BarChart4,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Folder,
  Sliders,
  TrendingUp,
  X
} from 'lucide-react';
import { SyncRequest, ProviderType } from '../types';

interface SyncRequestWorkspaceProps {
  reqData: SyncRequest;
  onTriggerSync: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onUpdatePaths: (id: string, localPath: string, remoteFolder: string) => void;
}

// Simple human-readable mock activities
const WORKSPACE_ACTIVITIES = [
  { id: '1', time: '10:15:30 AM', operation: 'UPLOAD', status: 'SUCCESS', message: 'budget_q2_draft.xlsx synchronized successfully.' },
  { id: '2', time: '10:15:32 AM', operation: 'UPLOAD', status: 'SUCCESS', message: 'sales_forecast_final.pdf uploaded.' },
  { id: '3', time: '10:20:00 AM', operation: 'DOWNLOAD', status: 'SUCCESS', message: 'brand_identity_v2.zip updated locally.' },
  { id: '4', time: '10:25:12 AM', operation: 'UPLOAD', status: 'SUCCESS', message: 'index_integrity_hash.md recalculated.' },
  { id: '5', time: '10:30:15 AM', operation: 'SYNC', status: 'FAILED', message: 'Connection timed out. Retrying automatically...' },
  { id: '6', time: '10:31:00 AM', operation: 'DOWNLOAD', status: 'SUCCESS', message: 'Retried download of team_guidelines.pdf succeeded.' },
  { id: '7', time: '11:02:44 AM', operation: 'UPLOAD', status: 'SUCCESS', message: 'client_deck.pptx uploaded (12.4 MB).' },
  { id: '8', time: '11:05:00 AM', operation: 'DOWNLOAD', status: 'SUCCESS', message: 'meeting_notes.md downloaded.' },
  { id: '9', time: '11:15:10 AM', operation: 'SYNC', status: 'SUCCESS', message: 'Local scan completed. 0 file conflicts.' },
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

  // Input States
  const [editingRemote, setEditingRemote] = useState(reqData.remoteFolder);
  const [isEditingRemoteOpen, setIsEditingRemoteOpen] = useState(false);
  const [selectedLocalPath, setSelectedLocalPath] = useState(reqData.localPath);
  const [showLocalExplorer, setShowLocalExplorer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Directory browse options
  const mockDirectories = [
    '/Users/david/Documents/Work',
    '/Users/david/Documents/Marketing',
    '/Users/david/Downloads',
    '/Users/david/workspace/project-sync',
    '/Users/david/local-vaults/backups'
  ];

  const handleApplyPaths = (newLocal: string, newRemote: string) => {
    onUpdatePaths(reqData.id, newLocal, newRemote);
    setIsEditingRemoteOpen(false);
  };

  const isActive = reqData.status === 'syncing' || reqData.status === 'idle';

  return (
    <div className="space-y-5">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${reqData.status === 'syncing' ? 'bg-emerald-500 animate-pulse' : isActive ? 'bg-sky-500' : 'bg-slate-400'}`} />
            <h1 className="text-xl font-bold text-theme-text">{reqData.name}</h1>
            <span className="inline-flex items-center gap-1 rounded bg-theme-bg border border-theme-border px-2 py-0.5 text-[10px] font-bold text-theme-text">
              {reqData.provider === 'aws-s3' ? 'AWS S3 Container' : 'Google Drive'}
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-mono">
            Provider Link: {reqData.provider === 'aws-s3' ? 'AWS S3 Storage' : 'Google Drive Workspace File Share'}
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Sync Now */}
          <button
            onClick={() => onTriggerSync(reqData.id)}
            disabled={reqData.status === 'syncing'}
            className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold select-none cursor-pointer transition-colors ${
              reqData.status === 'syncing'
                ? 'bg-theme-bg text-slate-400 cursor-not-allowed border border-theme-border'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
            }`}
          >
            <RotateCw className={`h-3.5 w-3.5 ${reqData.status === 'syncing' ? 'animate-spin' : ''}`} />
            <span>{reqData.status === 'syncing' ? 'Syncing...' : 'Sync Now'}</span>
          </button>

          {/* Pause Sync / Resume Sync */}
          <button
            onClick={() => onToggleStatus(reqData.id)}
            className="inline-flex items-center gap-1.5 rounded border border-theme-border bg-theme-bg hover:bg-theme-border px-3 py-1.5 text-xs font-semibold text-theme-text transition-colors cursor-pointer select-none"
          >
            {isActive ? (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-500" />
                <span>Pause Sync</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-500" />
                <span>Resume Sync</span>
              </>
            )}
          </button>

          {/* Delete Request */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded border border-red-205 bg-red-50/10 hover:bg-red-50 text-red-655 px-3 py-1.5 text-xs font-semibold dark:text-red-400 transition-colors cursor-pointer select-none"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Request</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-theme-border">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'connection', label: 'Connection Settings' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'activity', label: 'Activity' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 border-b-2 font-medium text-xs transition-colors cursor-pointer ${
              activeSubTab === tab.id
                ? 'border-indigo-650 text-indigo-650 font-semibold'
                : 'border-transparent text-slate-500 hover:text-theme-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1 - Overview */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Information Card */}
          <div className="lg:col-span-2 rounded border border-theme-border bg-theme-card p-5 shadow-xs space-y-4 text-theme-text">
            <h3 className="text-sm font-bold text-theme-text flex items-center gap-1.5 border-b border-theme-border pb-2">
              <Database className="h-4 w-4 text-indigo-500" />
              Information Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-theme-text">
              <div className="space-y-0.5">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Sync Request Name:</span>
                <span className="font-semibold text-theme-text block">{reqData.name}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Provider:</span>
                <span className="font-semibold text-theme-text block">{reqData.provider === 'aws-s3' ? 'AWS S3' : 'Google Drive'}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Tenant ID:</span>
                <span className="font-mono text-theme-text block">tenant_123_corporate</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Status:</span>
                <span className="font-semibold text-theme-text block uppercase">{isActive ? 'ACTIVE' : 'INACTIVE'}</span>
              </div>
              <div className="space-y-0.5 sm:col-span-2">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Remote Target Folder:</span>
                <span className="font-mono text-theme-text block bg-theme-bg p-1.5 rounded border border-theme-border truncate">
                  {reqData.remoteFolder}
                </span>
              </div>
              <div className="space-y-0.5 sm:col-span-2">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Local Folder Location:</span>
                <span className="font-mono text-theme-text block bg-theme-bg p-1.5 rounded border border-theme-border truncate">
                  {reqData.localPath}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Created Date:</span>
                <span className="font-medium text-theme-text block">12-Jun-2026</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Last Sync Time:</span>
                <span className="font-medium text-theme-text block">{reqData.lastSync || 'Never'}</span>
              </div>
            </div>
          </div>

          {/* Sync Summary */}
          <div className="rounded border border-theme-border bg-theme-card p-5 shadow-xs space-y-4 text-theme-text">
            <h3 className="text-sm font-bold text-theme-text flex items-center gap-1.5 border-b border-theme-border pb-2">
              <Clock className="h-4 w-4 text-indigo-505" />
              Sync Summary
            </h3>

            <div className="space-y-3 text-xs text-theme-text">
              <div className="flex justify-between pb-1.5 border-b border-theme-border">
                <span className="text-slate-500">Files Synced:</span>
                <span className="font-semibold text-theme-text">1,482 Files</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-theme-border">
                <span className="text-slate-550">Last Upload:</span>
                <span className="font-semibold text-theme-text">12 minutes ago</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-theme-border">
                <span className="text-slate-550">Last Download:</span>
                <span className="font-semibold text-theme-text">24 minutes ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-550">Last Error:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/10 px-1.5 py-0.5 rounded text-[10px]">
                  None (100% Ok)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 - Connection Settings */}
      {activeSubTab === 'connection' && (
        <div className="rounded border border-theme-border bg-theme-card p-5 shadow-xs space-y-5 text-theme-text">
          <h3 className="text-sm font-bold text-theme-text border-b border-theme-border pb-2">
            Source & Destination Settings
          </h3>

          <div className="space-y-4">
            {/* Provider Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-theme-bg border border-theme-border rounded">
                <span className="text-slate-400 font-semibold block uppercase text-[10px] mb-1">Provider:</span>
                <div className="font-semibold text-theme-text flex items-center gap-1">
                  {reqData.provider === 'aws-s3' ? <Cloud className="h-4 w-4 text-amber-500" /> : <HardDrive className="h-4 w-4 text-sky-500" />}
                  <span>{reqData.provider === 'aws-s3' ? 'AWS S3' : 'Google Drive'}</span>
                </div>
              </div>
              <div className="p-3 bg-theme-bg border border-theme-border rounded">
                <span className="text-slate-400 font-semibold block uppercase text-[10px] mb-1">Tenant ID:</span>
                <span className="font-mono text-theme-text block font-semibold">tenant_123_corporate</span>
              </div>
              <div className="p-3 bg-theme-bg border border-theme-border rounded">
                <span className="text-slate-400 font-semibold block uppercase text-[10px] mb-1">Link Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle className="h-3.5 w-3.5" /> VERIFIED
                </span>
              </div>
            </div>

            {/* Remote Configuration */}
            <div className="p-4 bg-theme-bg border border-theme-border rounded text-xs space-y-2">
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                {reqData.provider === 'aws-s3' ? 'AWS Bucket Name' : 'Google Drive Folder Name / Path'}
              </span>
              {isEditingRemoteOpen ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingRemote}
                    onChange={(e) => setEditingRemote(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-theme-card border border-theme-border rounded outline-none text-xs font-mono text-theme-text"
                  />
                  <button
                    onClick={() => {
                      handleApplyPaths(selectedLocalPath, editingRemote);
                    }}
                    className="bg-indigo-600 text-white px-3.5 py-1.5 rounded font-semibold text-xs hover:bg-indigo-500 cursor-pointer"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setEditingRemote(reqData.remoteFolder);
                      setIsEditingRemoteOpen(false);
                    }}
                    className="border border-theme-border bg-theme-bg hover:bg-theme-border text-theme-text px-3 py-1.5 rounded text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-theme-card border border-theme-border p-2 rounded">
                  <span className="font-mono text-theme-text truncate pr-4">{reqData.remoteFolder}</span>
                  <button
                    onClick={() => setIsEditingRemoteOpen(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Change Destination
                  </button>
                </div>
              )}
            </div>

            {/* Local Folder */}
            <div className="p-4 bg-theme-bg border border-theme-border rounded text-xs space-y-2">
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Current Local Folder</span>
              <div className="flex justify-between items-center bg-theme-card border border-theme-border p-2 rounded">
                <span className="font-mono text-theme-text truncate pr-4">{selectedLocalPath}</span>
                <button
                  onClick={() => setShowLocalExplorer(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded text-xs font-semibold cursor-pointer shrink-0"
                >
                  Browse
                </button>
              </div>
            </div>

            {/* Request Controls */}
            <div className="pt-4 border-t border-theme-border flex justify-between items-center flex-wrap gap-3">
              <p className="text-[11px] text-slate-400">Settings saved directly in local config cache.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onToggleStatus(reqData.id)}
                  className={`px-3 py-1.5 rounded font-semibold text-xs text-white cursor-pointer ${
                    isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {isActive ? 'Deactivate Sync' : 'Activate Sync'}
                </button>
                <button
                  onClick={() => {
                    handleApplyPaths(selectedLocalPath, editingRemote);
                    alert('Folders configuration saved successfully.');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-505 text-white px-4 py-1.5 rounded text-xs font-semibold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3 - Analytics (simplified placeholder cards) */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-5 text-theme-text">
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded border border-theme-border bg-theme-card p-4 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Uploads</span>
              <p className="text-lg font-bold text-theme-text">4,124 Files</p>
              <span className="text-[10px] text-slate-500 font-mono">41.2 GB of data</span>
            </div>
            <div className="rounded border border-theme-border bg-theme-card p-4 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Downloads</span>
              <p className="text-lg font-bold text-theme-text">3,308 Files</p>
              <span className="text-[10px] text-slate-500 font-mono">33.0 GB of data</span>
            </div>
            <div className="rounded border border-theme-border bg-theme-card p-4 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Files Synced</span>
              <p className="text-lg font-bold text-theme-text">1,482 Files</p>
              <span className="text-[10px] text-emerald-500 font-semibold">100% matched</span>
            </div>
            <div className="rounded border border-theme-border bg-theme-card p-4 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Storage Used</span>
              <p className="text-lg font-bold text-theme-text">74.2 GB</p>
              <span className="text-[10px] text-slate-500 font-mono">Out of 100 GB cloud limit</span>
            </div>
          </div>

          {/* Simple Charts & Health Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Charts Card */}
            <div className="md:col-span-2 rounded border border-theme-border bg-theme-card p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-theme-text border-b pb-2 border-theme-border flex items-center gap-1.5">
                <BarChart4 className="h-4 w-4 text-indigo-505" />
                Transfer Volume & Activity Over Time
              </h3>

              <div className="space-y-3.5 pt-1 text-xs">
                {[
                  { label: 'Uploads Over Time', amount: '41.2 GB UPLOADED', percent: 65, color: 'bg-indigo-600' },
                  { label: 'Downloads Over Time', amount: '33.0 GB DOWNLOADED', percent: 45, color: 'bg-sky-550' },
                  { label: 'Transfer Volume (Daily)', amount: '1.2 GB ACTIVE', percent: 25, color: 'bg-emerald-500' },
                ].map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span>{item.label}</span>
                      <span className="text-slate-500">{item.amount}</span>
                    </div>
                    <div className="h-3 bg-theme-bg border border-theme-border rounded overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sync Health Card */}
            <div className="rounded border border-theme-border bg-theme-card p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-theme-text border-b pb-2 border-theme-border">
                Sync Health
              </h3>

              <div className="space-y-4 text-xs text-theme-text">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Success Rate</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-450">99.8%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Failed Operations</span>
                  <div className="font-semibold text-theme-text">
                    0 Failed
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Average Sync Duration</span>
                  <div className="font-semibold text-theme-text">
                    12.4 seconds
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4 - Activity */}
      {activeSubTab === 'activity' && (
        <div className="space-y-4">
          <div className="rounded border border-theme-border bg-theme-card p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-theme-text font-sans">Activity Timeline Tracker</span>

            {/* Filters */}
            <div className="flex gap-1 bg-theme-bg p-1 border border-theme-border rounded">
              {(['all', 'uploads', 'downloads', 'errors'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActivityFilter(filter)}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase transition-all cursor-pointer ${
                    activityFilter === filter
                      ? 'bg-indigo-650 text-white shadow-xs'
                      : 'text-slate-500 hover:text-theme-text font-medium'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Activity list */}
          {WORKSPACE_ACTIVITIES.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-theme-border rounded bg-theme-card text-xs">
              <AlertTriangle className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <h4 className="font-bold text-theme-text">No Activity Available</h4>
            </div>
          ) : (
            <div className="border border-theme-border rounded overflow-hidden">
              <table className="w-full text-left text-xs bg-theme-card border-collapse">
                <thead>
                  <tr className="bg-theme-bg border-b border-theme-border text-slate-400">
                    <th className="p-3 font-semibold text-[10px]">Time</th>
                    <th className="p-3 font-semibold text-[10px]">Operation</th>
                    <th className="p-3 font-semibold text-[10px]">Status</th>
                    <th className="p-3 font-semibold text-[10px]">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {WORKSPACE_ACTIVITIES.filter((act) => {
                    if (activityFilter === 'all') return true;
                    if (activityFilter === 'uploads') return act.operation === 'UPLOAD';
                    if (activityFilter === 'downloads') return act.operation === 'DOWNLOAD';
                    if (activityFilter === 'errors') return act.status === 'FAILED';
                    return true;
                  }).map((item) => (
                    <tr key={item.id} className="hover:bg-theme-border/30 text-[11px] font-mono select-none text-theme-text transition-colors">
                      <td className="p-3 text-slate-450 dark:text-slate-405">{item.time}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          item.operation === 'UPLOAD' ? 'bg-indigo-50/10 text-indigo-400 border border-indigo-900/30' :
                          item.operation === 'DOWNLOAD' ? 'bg-sky-50/10 text-sky-400 border border-sky-950/20' :
                          'bg-theme-bg border border-theme-border text-theme-text'
                        }`}>
                          {item.operation}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold uppercase text-[9px] ${
                          item.status === 'SUCCESS' ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-theme-text lowercase">{item.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-955/40 backdrop-blur-xs" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-sm rounded border border-theme-border bg-theme-card p-5 text-theme-text z-50 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b pb-2 border-theme-border">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="font-bold text-sm">Delete Sync Request?</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Are you sure you want to delete <strong className="text-theme-text">"{reqData.name}"</strong>? This will detach the workstation folder mapping.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 border border-theme-border bg-theme-bg text-theme-text rounded hover:bg-theme-border transition-colors text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteRequest(reqData.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-3 py-1.5 bg-red-605 hover:bg-red-550 text-white rounded font-bold transition-colors text-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Browser Dialog */}
      {showLocalExplorer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-955/40 backdrop-blur-xs" onClick={() => setShowLocalExplorer(false)} />
          <div className="relative w-full max-w-md rounded border border-theme-border bg-theme-card p-4 text-theme-text z-50 shadow-xl space-y-3.5">
            <div className="flex justify-between items-center border-b pb-2 border-theme-border">
              <span className="font-bold text-xs uppercase text-theme-text font-sans">Select Local Folder</span>
              <button onClick={() => setShowLocalExplorer(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {mockDirectories.map((dir, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedLocalPath(dir);
                    handleApplyPaths(dir, editingRemote);
                    setShowLocalExplorer(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded border border-theme-border hover:bg-theme-border cursor-pointer font-mono lowercase text-xs"
                >
                  <Folder className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span className="truncate">{dir}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowLocalExplorer(false)}
                className="px-3 py-1.5 bg-theme-bg hover:bg-theme-border text-theme-text border border-theme-border text-xs font-semibold rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

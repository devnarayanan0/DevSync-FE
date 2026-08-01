import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  FolderOpen,
  Play,
  Pause,
  AlertTriangle,
  RefreshCw,
  FolderDot,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SyncRequest, ProviderType } from '../types';

interface SyncRequestsPageProps {
  syncRequests: SyncRequest[];
  onOpenWorkspace: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onCreateClick: () => void;
  onTriggerSync?: (id: string) => void;
}

// AWS Logo SVG wrapper according to guidelines
const AWSLogo = () => (
  <span className="flex items-center gap-1.5 font-sans font-medium text-slate-700 dark:text-slate-200">
    <svg className="h-4.5 w-7 text-slate-800 dark:text-white shrink-0" viewBox="0 0 28 16" fill="currentColor">
      <path d="M3.5 11.5h1.2l-.7-3.2-.5 3.2zm-1.8 1.5l1.6-6h1.5l1.6 6H5.9l-.3-1.6h-1.6l-.3 1.6H1.7zm7.5-6h1.2l.6 3.5.7-3.5h1.1l.7 3.5.6-3.5h1.2l-1.1 6h-1.1l-.8-3.7-.8 3.7H9.2zm8.5 4.8c.6.4 1.1.2 1.4-.2.2-.3.3-.7.3-1.1v-.5c-.3.4-.8.7-1.4.7-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8c.6 0 1.1.3 1.4.7v-.5c0-.6-.4-.9-1.1-.9-.6 0-1.1.2-1.4.4l-.4-.8c.5-.4 1.2-.6 1.9-.6 1.4 0 2.1.8 2.1 2v3.7c0 .8.2 1.1.5 1.2v.3h-1.3c-.2-.2-.3-.5-.4-.8-.4.5-.9.9-1.6.9-.9 0-1.6-.5-1.6-1.4s.6-1.5 1.6-1.5zm.9-.9c-.6 0-.9.3-.9.7s.3.7.9.7c.6 0 .9-.3.9-.7s-.3-.7-.9-.7z" />
      <path d="M1.5 13.5c4.5 2.5 12.5 2.5 16.5 .2 .3-.2.6 0 .4.3-1.2 1.2-4.5 2.5-8.5 2.5-4.5 0-7.2-1.2-8.8-2.5-.2-.2-.1-.4 .4-.5" fill="#FF9900" />
      <path d="M17.5 12.8c-.2-.5 0-.7 .5-.4 1.1 .6 2 .5 2.1-.3l.1-.6-.8 .1c-.5 .1-.7-.2-.4-.6l1.2-1.4c.3-.3 .6-.2 .5 .3l-.3 2.1c-.1 .5-.4 .4-.6 .1" fill="#FF9900" />
    </svg>
    <span className="text-xs">AWS S3</span>
  </span>
);

// Google Drive Logo SVG wrapper according to guidelines
const GoogleDriveLogo = () => (
  <span className="flex items-center gap-1.5 font-sans font-medium text-slate-800 dark:text-slate-200">
    <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24" fill="none">
      <path d="M14.7 2h-5.4L2 14.5l2.7 4.7z" fill="#FFC107" />
      <path d="M22 14.5H11.2l-5.4 9.5H21.2z" fill="#1976D2" />
      <path d="M14.7 2L9.3 11.5 3.9 21h5.4z" fill="#4CAF50" />
    </svg>
    <span className="text-xs">Google Drive</span>
  </span>
);

export default function SyncRequestsPage({
  syncRequests,
  onOpenWorkspace,
  onToggleStatus,
  onDeleteRequest,
  onCreateClick,
  onTriggerSync,
}: SyncRequestsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Top 3 draft sync requests loaded from local storage
  const [draftRequests, setDraftRequests] = useState<Array<{ id: string; name: string; provider: string; updatedAt: string }>>(() => {
    try {
      const saved = localStorage.getItem('devsync_draft_sync_requests');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Filter requests
  const filteredRequests = syncRequests.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.description && req.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProvider =
      providerFilter === 'all' || req.provider === providerFilter;

    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const isSyncing = req.status === 'syncing';
      const isActive = req.status === 'idle' || isSyncing;
      
      if (statusFilter === 'active') {
        matchesStatus = req.status === 'idle' || isSyncing;
      } else if (statusFilter === 'inactive') {
        matchesStatus = req.status === 'paused';
      } else if (statusFilter === 'error') {
        matchesStatus = req.status === 'failed';
      }
    }

    return matchesSearch && matchesProvider && matchesStatus;
  });

  const getProviderDetail = (provider: ProviderType) => {
    switch (provider) {
      case 'aws-s3':
        return <AWSLogo />;
      case 'google-drive':
        return <GoogleDriveLogo />;
      default:
        return (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="font-medium text-theme-text text-xs uppercase">{provider}</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    const val = (status || 'idle').toLowerCase();
    switch (val) {
      case 'syncing':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-1 text-xs font-semibold border border-emerald-100/60 dark:border-emerald-900/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Syncing
          </span>
        );
      case 'idle':
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 px-2.5 py-1 text-xs font-semibold border border-blue-100/60 dark:border-blue-900/20">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Active
          </span>
        );
      case 'paused':
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 px-2.5 py-1 text-xs font-semibold border border-slate-200/50 dark:border-slate-800/50">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Inactive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 px-2.5 py-1 text-xs font-semibold border border-red-100/60 dark:border-red-900/20">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Error
          </span>
        );
    }
  };

  const displayLastSync = (lastSync: string) => {
    if (!lastSync || lastSync.toLowerCase().includes('never')) {
      return (
        <div className="flex flex-col text-slate-450 text-[11px] font-mono select-none leading-normal">
          <span className="font-sans font-bold text-slate-400">Never</span>
          <span className="text-[10px] text-slate-400 lowercase italic">Executed</span>
        </div>
      );
    }
    
    try {
      const parts = lastSync.split(' ');
      if (parts.length >= 2) {
        // Formats are like '2026-06-20 05:30:12'
        const datePart = parts[0];
        const timePart = parts[1];
        
        const dateObj = new Date(datePart + 'T' + timePart);
        if (!isNaN(dateObj.getTime())) {
          // Format date: '20 Jun 2026'
          const dateStr = dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
          
          // Format time: '02:06 PM'
          const timeStr = dateObj.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          
          return (
            <div className="flex flex-col text-[11px] font-mono leading-tight">
              <span className="font-sans font-extrabold text-theme-text">{dateStr}</span>
              <span className="text-slate-400 mt-0.5">{timeStr}</span>
            </div>
          );
        }
      }
    } catch (err) {
      // safe fallback
    }
    
    return (
      <div className="flex flex-col text-[11px] font-mono leading-tight">
        <span className="font-sans font-bold text-theme-text">{lastSync}</span>
      </div>
    );
  };

  const handleDeleteConfirm = (id: string) => {
    onDeleteRequest(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-5">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme-border">
        <div>
          <h1 className="page-title-heading">
            Sync Requests
          </h1>
        </div>
        <button
          onClick={onCreateClick}
          id="requests-btn-create"
          className="inline-flex items-center gap-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-black px-4 py-2.5 text-xs font-extrabold shadow-md transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Create Sync Request
        </button>
      </div>

      {/* Modern Filter Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-1">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search sync requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded border border-theme-border bg-theme-bg pl-9 pr-3 text-xs transition-colors focus:border-indigo-650 focus:outline-none text-theme-text placeholder-slate-400 font-medium"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-5">
          {/* Provider Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Provider:</span>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="h-8 rounded border border-theme-border bg-theme-bg px-2.5 text-xs text-theme-text font-medium focus:border-indigo-600 focus:outline-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="aws-s3">AWS S3</option>
              <option value="google-drive">Google Drive</option>
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded border border-theme-border bg-theme-bg px-2.5 text-xs text-theme-text font-medium focus:border-indigo-600 focus:outline-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Request Table Card */}
      {filteredRequests.length === 0 ? (
        <div className="p-10 text-center rounded-lg border border-theme-border bg-theme-card shadow-md text-xs text-theme-text space-y-2">
          <FolderOpen className="mx-auto h-10 w-10 text-black dark:text-white" />
          <h3 className="font-extrabold text-sm text-black dark:text-white">No Sync Requests</h3>
          <p className="text-slate-800 dark:text-slate-200 font-semibold">
            Create a sync request to see
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-theme-border bg-theme-card overflow-hidden shadow-md text-theme-text">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-theme-text">
              <thead>
                <tr className="bg-theme-bg/50 border-b border-theme-border text-black dark:text-white uppercase text-[10px] tracking-wider font-extrabold">
                  <th className="p-4 font-bold">Request Name</th>
                  <th className="p-4 font-bold">Provider</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Last Sync</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border text-theme-text font-medium">
                {filteredRequests.map((req) => {
                  const isActive = req.status === 'syncing' || req.status === 'idle';

                  return (
                    <tr
                      key={req.id}
                      onClick={() => onOpenWorkspace(req.id)}
                      className="hover:bg-theme-bg/40 transition-colors cursor-pointer"
                    >
                      {/* Name with navigation click */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-lime-500/15 text-lime-600 dark:text-lime-400 shrink-0 shadow-xs border border-lime-500/30">
                            <FolderDot className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-sm text-black dark:text-white font-sans tracking-tight hover:text-lime-600 dark:hover:text-lime-400 hover:underline">
                              {req.name}
                            </span>
                            <span className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 max-w-sm sm:max-w-md truncate" title={req.description}>
                              {req.description || 'Synchronized Cloud Bucket Mapping'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Provider Detail badge */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        {getProviderDetail(req.provider)}
                      </td>

                      {/* Compact Status Badge */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        {getStatusBadge(req.status)}
                      </td>

                      {/* Last Sync stacked times */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        {displayLastSync(req.lastSync)}
                      </td>

                      {/* Responsive Action Buttons (No text labels, just icons) */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Open Button with text */}
                          <button
                            onClick={() => onOpenWorkspace(req.id)}
                            className="px-3.5 py-1.5 rounded-lg border border-theme-border bg-theme-bg hover:bg-theme-border text-black dark:text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                          >
                            Open
                          </button>
                          
                          {/* Sync Now button */}
                          <button
                            onClick={() => onTriggerSync && onTriggerSync(req.id)}
                            disabled={req.status === 'syncing'}
                            className={`p-1.5 rounded-lg border border-theme-border transition-all cursor-pointer shadow-xs ${
                              req.status === 'syncing'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 cursor-not-allowed'
                                : 'bg-lime-500 text-black font-extrabold hover:bg-lime-400'
                            }`}
                            title="Trigger Sync Now"
                          >
                            <Play className="h-4 w-4" />
                          </button>

                          {/* Pause / Resume button */}
                          <button
                            onClick={() => onToggleStatus(req.id)}
                            className="p-1.5 rounded-lg border border-theme-border bg-theme-bg hover:bg-theme-border text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs"
                            title={isActive ? 'Pause' : 'Activate'}
                          >
                            {isActive ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => setDeletingId(req.id)}
                            className="p-1.5 rounded-lg border border-theme-border bg-theme-bg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-700 dark:text-slate-300 hover:text-red-600 transition-all cursor-pointer shadow-xs"
                            title="Delete Configuration"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Desktop/Docker Desktop/GitHub Desktop inspired pagination footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-theme-border bg-theme-bg/50 px-4 py-3 gap-3">
            <span className="text-[11px] text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider select-none">
              Showing 1 to {filteredRequests.length} of {filteredRequests.length} requests
            </span>
            
            <div className="flex items-center gap-1 select-none">
              <button 
                className="p-1 h-7 w-7 flex items-center justify-center rounded-lg border border-theme-border bg-theme-card text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white cursor-pointer transition-colors disabled:opacity-30" 
                disabled
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="h-7 w-7 flex items-center justify-center rounded-lg text-xs font-bold leading-none bg-indigo-50/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                1
              </button>
              <button 
                className="p-1 h-7 w-7 flex items-center justify-center rounded-lg border border-theme-border bg-theme-card text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white cursor-pointer transition-colors disabled:opacity-30" 
                disabled
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft Sync Requests Section */}
      <div className="rounded-2xl border border-theme-border bg-theme-card p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-theme-border pb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-black dark:text-white font-sans">
            Draft Sync Requests
          </h3>
          <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 font-bold">Local Top 3</span>
        </div>

        {draftRequests.length === 0 ? (
          <div className="py-3 text-center text-xs font-extrabold text-black dark:text-white">
            No Draft Sync Requests
          </div>
        ) : (
          <div className="space-y-2">
            {draftRequests.slice(0, 3).map((draft) => (
              <div key={draft.id} className="flex items-center justify-between p-3 rounded-lg border border-theme-border bg-theme-bg/50 text-xs font-mono">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="font-bold text-black dark:text-white truncate">{draft.name}</span>
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase">({draft.provider})</span>
                </div>
                <button
                  onClick={onCreateClick}
                  className="px-3.5 py-1.5 rounded-lg bg-lime-500 hover:bg-lime-400 text-black font-extrabold text-xs cursor-pointer shadow-xs"
                >
                  Resume Draft
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal overlay */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-955/40 backdrop-blur-xs"
            onClick={() => setDeletingId(null)}
          />
          <div className="relative w-full max-w-sm rounded border border-theme-border bg-theme-card p-5 text-theme-text z-50 shadow-xl space-y-4 font-sans">
            <div className="flex items-center gap-2 border-b border-theme-border pb-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="font-bold text-sm">Delete Sync Request?</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete the configuration <strong className="text-theme-text">"{syncRequests.find((r) => r.id === deletingId)?.name}"</strong>? This will remove the configuration from local storage.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 border border-theme-border bg-theme-bg text-theme-text rounded hover:bg-theme-border transition-colors text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingId)}
                className="px-3 py-1.5 bg-red-650 hover:bg-red-500 text-white rounded font-bold transition-colors text-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

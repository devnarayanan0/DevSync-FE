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
  FolderDot
} from 'lucide-react';
import { SyncRequest, ProviderType } from '../types';

interface SyncRequestsPageProps {
  syncRequests: SyncRequest[];
  onOpenWorkspace: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onCreateClick: () => void;
  onTriggerSync?: (id: string) => void; // Added for Sync Now action
}

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

  // Filter requests
  const filteredRequests = syncRequests.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.remoteFolder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.localPath.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProvider =
      providerFilter === 'all' || req.provider === providerFilter;

    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const isActive = req.status === 'syncing' || req.status === 'idle';
      if (statusFilter === 'active') {
        matchesStatus = isActive;
      } else if (statusFilter === 'inactive') {
        matchesStatus = !isActive || req.status === 'paused';
      }
    }

    return matchesSearch && matchesProvider && matchesStatus;
  });

  const getProviderLabel = (provider: ProviderType) => {
    switch (provider) {
      case 'aws-s3':
        return 'AWS S3';
      case 'google-drive':
        return 'Google Drive';
      default:
        return provider;
    }
  };

  const getStatusBadge = (status: string) => {
    const uppercaseStatus = (status || 'idle').toUpperCase();
    switch (uppercaseStatus) {
      case 'SYNCING':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SYNCING
          </span>
        );
      case 'IDLE':
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:bg-sky-950/30 dark:text-sky-400">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            ACTIVE
          </span>
        );
      case 'PAUSED':
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-450">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            INACTIVE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            ERROR
          </span>
        );
    }
  };

  const handleDeleteConfirm = (id: string) => {
    onDeleteRequest(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Sync Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure folders linked to cloud storage buckets.
          </p>
        </div>
        <button
          onClick={onCreateClick}
          id="requests-btn-create"
          className="inline-flex items-center gap-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 text-xs font-medium shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Sync Request
        </button>
      </div>

      {/* Modern Filter Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search sync requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400"
          />
        </div>

        {/* Provider Filter */}
        <div className="flex items-center space-x-1.5 rounded border border-slate-200 bg-slate-55/10 p-1 dark:border-slate-800 text-xs">
          <span className="text-[10px] text-slate-400 px-1 font-semibold uppercase">Provider:</span>
          <div className="flex gap-1 flex-1">
            {['all', 'aws-s3', 'google-drive'].map((name) => (
              <button
                key={name}
                onClick={() => setProviderFilter(name)}
                className={`flex-1 py-1 text-[10px] font-medium rounded transition-all ${
                  providerFilter === name
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {name === 'all' ? 'All' : name === 'aws-s3' ? 'AWS' : 'Google Drive'}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1.5 rounded border border-slate-200 bg-slate-55/10 p-1 dark:border-slate-800 text-xs">
          <span className="text-[10px] text-slate-400 px-1 font-semibold uppercase">Status:</span>
          <div className="flex gap-1 flex-1">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 py-1 text-[10px] font-medium rounded transition-all ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {status === 'all' ? 'All' : status === 'active' ? 'Active' : 'Inactive'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Request Table Card */}
      {filteredRequests.length === 0 ? (
        <div className="p-10 text-center rounded border border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/45 text-xs">
          <FolderOpen className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300">No Sync Requests Found</h3>
          <p className="text-slate-400 mt-1">
            {syncRequests.length === 0
              ? 'Get started by creating your first folders synchronization mapping.'
              : 'Try running a different search query or matching rule.'}
          </p>
          {syncRequests.length === 0 && (
            <button
              onClick={onCreateClick}
              className="mt-3.5 inline-flex items-center gap-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 font-semibold text-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Create your first Sync Request
            </button>
          )}
        </div>
      ) : (
        <div className="rounded border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/30 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-400">
                  <th className="p-3 font-semibold text-[11px] tracking-wide">Request Name</th>
                  <th className="p-3 font-semibold text-[11px] tracking-wide">Provider</th>
                  <th className="p-3 font-semibold text-[11px] tracking-wide">Remote Folder</th>
                  <th className="p-3 font-semibold text-[11px] tracking-wide">Status</th>
                  <th className="p-3 font-semibold text-[11px] tracking-wide">Last Sync</th>
                  <th className="p-3 font-semibold text-[11px] tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRequests.map((req) => {
                  const isActive = req.status === 'syncing' || req.status === 'idle';

                  return (
                    <tr
                      key={req.id}
                      onClick={() => onOpenWorkspace(req.id)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors cursor-pointer"
                    >
                      {/* Name with navigation click */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-650 dark:hover:text-indigo-400 hover:underline">
                          {req.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 select-all" onClick={(e) => e.stopPropagation()}>
                          {req.localPath}
                        </div>
                      </td>

                      {/* Provider Label */}
                      <td className="p-3">
                        <span className="rounded bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-350">
                          {getProviderLabel(req.provider)}
                        </span>
                      </td>

                      {/* Remote Folder */}
                      <td className="p-3">
                        <span className="font-mono text-slate-500 text-[11px] break-all truncate max-w-xs block" title={req.remoteFolder}>
                          {req.remoteFolder}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        {getStatusBadge(req.status)}
                      </td>

                      {/* Last Sync */}
                      <td className="p-3">
                        <span className="text-slate-500 text-[11px]">
                          {req.lastSync || 'Never'}
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenWorkspace(req.id)}
                            className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors"
                          >
                            Open
                          </button>
                          
                          <button
                            onClick={() => onTriggerSync && onTriggerSync(req.id)}
                            disabled={req.status === 'syncing'}
                            className="p-1 px-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            title="Sync Now"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${req.status === 'syncing' ? 'animate-spin text-indigo-500' : ''}`} />
                          </button>

                          <button
                            onClick={() => onToggleStatus(req.id)}
                            className="p-1 px-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                            title={isActive ? 'Pause' : 'Activate'}
                          >
                            {isActive ? (
                              <Pause className="h-3.5 w-3.5 text-amber-500" />
                            ) : (
                              <Play className="h-3.5 w-3.5 text-emerald-500" />
                            )}
                          </button>

                          <button
                            onClick={() => setDeletingId(req.id)}
                            className="p-1 px-1.5 rounded border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-400 transition-colors"
                            title="Delete Configuration"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal overlay */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            onClick={() => setDeletingId(null)}
          />
          <div className="relative w-full max-w-sm rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-50 z-50 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-805 pb-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="font-bold text-sm">Delete Sync Request?</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete the configuration <strong className="text-slate-800 dark:text-slate-200">"{syncRequests.find((r) => r.id === deletingId)?.name}"</strong>? This will remove the configuration from local storage.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded hover:bg-slate-50 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingId)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold transition-colors text-xs"
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

import { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  FolderOpen,
  ArrowRight,
  Play,
  Pause,
  ExternalLink,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { SyncRequest, ProviderType } from '../types';

interface SyncRequestsPageProps {
  syncRequests: SyncRequest[];
  onOpenWorkspace: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onCreateClick: () => void;
}

export default function SyncRequestsPage({
  syncRequests,
  onOpenWorkspace,
  onToggleStatus,
  onDeleteRequest,
  onCreateClick,
}: SyncRequestsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter logic
  const filteredRequests = syncRequests.filter((req) => {
    // Search
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.remoteFolder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.localPath.toLowerCase().includes(searchQuery.toLowerCase());

    // Provider filter
    let matchesProvider = true;
    if (providerFilter !== 'all') {
      matchesProvider = req.provider === providerFilter;
    }

    // Status filter
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const isActive = req.status === 'syncing' || req.status === 'idle';
      if (statusFilter === 'active') {
        matchesStatus = isActive;
      } else if (statusFilter === 'inactive') {
        matchesStatus = !isActive;
      }
    }

    return matchesSearch && matchesProvider && matchesStatus;
  });

  const getProviderIcon = (provider: ProviderType) => {
    switch (provider) {
      case 'aws-s3':
        return <Cloud className="h-4 w-4 text-amber-500" />;
      case 'google-drive':
        return <HardDrive className="h-4 w-4 text-sky-500" />;
      default:
        return <Cloud className="h-4 w-4 text-indigo-500" />;
    }
  };

  const getProviderLabel = (provider: ProviderType) => {
    switch (provider) {
      case 'aws-s3':
        return 'AWS S3';
      case 'google-drive':
        return 'Google Drive';
      case 'azure':
        return 'Azure Blob';
      case 'dropbox':
        return 'Dropbox';
      default:
        return provider;
    }
  };

  const handleDeleteConfirm = (id: string) => {
    onDeleteRequest(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 uppercase font-sans tracking-tight">
            Sync Requests Directory
          </h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 font-mono uppercase tracking-wide">
            Inspect, search and manage synchronization pipelines linked to your machine.
          </p>
        </div>
        <button
          onClick={onCreateClick}
          id="requests-btn-create-request"
          className="inline-flex items-center gap-1.5 rounded-sm bg-indigo-600 hover:bg-indigo-550 text-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Sync Request
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-3.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Request Name, Provider, Remote Folder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250 placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-3.5">
            {/* Provider Filters */}
            <div className="flex items-center space-x-2 rounded-sm border border-slate-250 bg-slate-50/50 p-1 dark:border-slate-800 dark:bg-slate-950/40 text-xs font-mono">
              <span className="text-[10px] text-slate-400 px-2 font-bold uppercase">Provider:</span>
              <button
                onClick={() => setProviderFilter('all')}
                className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase transition-all ${
                  providerFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setProviderFilter('aws-s3')}
                className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase transition-all ${
                  providerFilter === 'aws-s3'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                AWS S3
              </button>
              <button
                onClick={() => setProviderFilter('google-drive')}
                className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase transition-all ${
                  providerFilter === 'google-drive'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                G-Drive
              </button>
            </div>

            {/* Status Filters */}
            <div className="flex items-center space-x-2 rounded-sm border border-slate-250 bg-slate-50/50 p-1 dark:border-slate-800 dark:bg-slate-950/40 text-xs font-mono">
              <span className="text-[10px] text-slate-400 px-2 font-bold uppercase">Status:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase transition-all ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase transition-all ${
                  statusFilter === 'active'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase transition-all ${
                  statusFilter === 'inactive'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Directory List Area */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center rounded-sm border border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/40 text-xs font-mono uppercase">
          <FolderOpen className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300">No Sync Requests Found</h3>
          <p className="text-[10px] text-slate-400 mt-1">
            {syncRequests.length === 0
              ? 'Your database is currently empty. Get started by building an active target.'
              : 'Try adjusting your search queries or category filters.'}
          </p>
          {syncRequests.length === 0 && (
            <button
              onClick={onCreateClick}
              className="mt-4 rounded-sm bg-indigo-600 hover:bg-indigo-550 text-white px-4 py-2 font-bold uppercase tracking-wider text-[11px] cursor-pointer"
            >
              Create Your First Sync Request
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-sm border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/40 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs font-mono uppercase">
              <thead>
                <tr className="bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-850 text-slate-450 dark:text-slate-400 text-left">
                  <th className="p-3.5 font-bold tracking-wider text-[10px]">Request Details</th>
                  <th className="p-3.5 font-bold tracking-wider text-[10px]">Cloud Link</th>
                  <th className="p-3.5 font-bold tracking-wider text-[10px]">Local ↔ Remote Mappings</th>
                  <th className="p-3.5 font-bold tracking-wider text-[10px]">Automation</th>
                  <th className="p-3.5 font-bold tracking-wider text-[10px]">Replication Status</th>
                  <th className="p-3.5 font-bold tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                {filteredRequests.map((req) => {
                  const isActive = req.status === 'syncing' || req.status === 'idle';

                  return (
                    <tr
                      key={req.id}
                      onClick={() => onOpenWorkspace(req.id)}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors cursor-pointer"
                    >
                      {/* Name and ID */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenWorkspace(req.id);
                            }}
                            className="font-bold text-slate-850 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 font-sans tracking-wide text-xs hover:underline uppercase text-left"
                          >
                            {req.name}
                          </button>
                          <p className="text-[9px] text-slate-400 font-mono lower-case">ID: {req.id}</p>
                        </div>
                      </td>

                      {/* Provider Badge */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                          {getProviderIcon(req.provider)}
                          <span>{getProviderLabel(req.provider)}</span>
                        </span>
                      </td>

                      {/* Paths Mapping */}
                      <td className="p-3.5">
                        <div className="space-y-1.5 max-w-[280px]">
                          <div className="flex items-center gap-1 text-[10px] text-slate-650 dark:text-slate-350 bg-slate-100/40 dark:bg-slate-900/40 px-2 py-0.5 rounded-sm">
                            <span className="text-[9px] font-bold text-slate-400 min-w-[45px]">LOCAL:</span>
                            <span className="truncate font-mono lowercase" title={req.localPath}>
                              {req.localPath}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-indigo-700 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20 px-2 py-0.5 rounded-sm">
                            <span className="text-[9px] font-bold text-indigo-500 min-w-[45px]">REMOTE:</span>
                            <span className="truncate font-mono lowercase" title={req.remoteFolder}>
                              {req.remoteFolder}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Schedule type */}
                      <td className="p-3.5">
                        <span className="font-bold text-slate-650 dark:text-slate-350 text-[10px]">
                          {req.schedule}
                        </span>
                      </td>

                      {/* Pill status */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[10px] font-bold ${
                            req.status === 'syncing'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/25 dark:text-emerald-400 dark:border-emerald-900/50'
                              : req.status === 'idle'
                              ? 'bg-sky-50 text-sky-700 border border-sky-150 dark:bg-sky-950/25 dark:text-sky-400 dark:border-sky-900/50'
                              : req.status === 'paused'
                              ? 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                              : 'bg-red-50 text-red-700 border border-red-150 dark:bg-red-950/25 dark:text-red-400 dark:border-red-900/50'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              req.status === 'syncing' ? 'bg-emerald-500 animate-pulse' :
                              req.status === 'idle' ? 'bg-sky-500' :
                              req.status === 'paused' ? 'bg-slate-400' : 'bg-red-500'
                            }`}
                          />
                          <span>{req.status}</span>
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenWorkspace(req.id)}
                            className="px-2.5 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-205 transition-colors text-[10px] font-bold"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => onToggleStatus(req.id)}
                            className={`p-1.5 rounded-sm border transition-colors ${
                              isActive
                                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/25 dark:border-amber-900 dark:text-amber-400'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/25 dark:border-emerald-900 dark:text-emerald-400'
                            }`}
                            title={isActive ? 'Deactivate automated cron' : 'Activate automated cron'}
                          >
                            {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => setDeletingId(req.id)}
                            className="p-1.5 rounded-sm border border-slate-200 bg-white hover:bg-red-50 hover:text-red-650 hover:border-red-200 text-slate-405 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-red-955 dark:hover:text-red-400 dark:hover:border-red-900 transition-colors"
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

      {/* Confirmation Modal Overlays */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setDeletingId(null)}
          />
          <div className="relative w-full max-w-sm rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-50 z-50 shadow-xl space-y-4 font-mono text-xs uppercase">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2.5">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="font-bold">Delete Sync Request?</h3>
            </div>
            <p className="text-[11px] text-slate-500 lowercase leading-relaxed">
              Are you sure you want to completely remove request config "{syncRequests.find((r) => r.id === deletingId)?.name}"? This action cannot be undone on the local database index.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-2 border border-slate-200 bg-white text-slate-705 dark:border-slate-800 dark:bg-slate-955 rounded-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingId)}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-sm font-bold transition-colors"
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

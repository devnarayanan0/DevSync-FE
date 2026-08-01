import React, { useState } from 'react';
import {
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  Calendar,
  Layers,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Clock,
  Sliders,
  Settings,
  X
} from 'lucide-react';
import { SyncRequest } from '../types';

interface ActivitySchedulingPageProps {
  syncRequests: SyncRequest[];
  onTriggerSyncAll?: () => void;
}

interface SyncGroup {
  id: string;
  name: string;
  requestCount: number;
  schedule: string;
  status: 'ACTIVE' | 'INACTIVE';
  requestsMappedRef: string[];
}

interface ScheduleItem {
  id: string;
  requestName: string;
  scheduleType: string;
  nextRun: string;
  status: 'ACTIVE' | 'DISABLED';
}

export default function ActivitySchedulingPage({
  syncRequests,
  onTriggerSyncAll,
}: ActivitySchedulingPageProps) {
  // Global Sync Rules
  const [syncOnStartup, setSyncOnStartup] = useState(true);
  const [syncOnInternet, setSyncOnInternet] = useState(true);
  const [autoRetry, setAutoRetry] = useState(true);
  const [retryInterval, setRetryInterval] = useState('5 Minutes');

  // Groups
  const [syncGroups, setSyncGroups] = useState<SyncGroup[]>([]);

  // Scheduled requests
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Recent Activity timeline
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  const [filterType, setFilterType] = useState<'all' | 'success' | 'failed' | 'uploads' | 'downloads'>('all');

  // Modal State
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSchedule, setNewGroupSchedule] = useState('Every 15 Minutes');
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: SyncGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName,
      requestCount: selectedRequestIds.length,
      schedule: newGroupSchedule,
      status: 'ACTIVE',
      requestsMappedRef: selectedRequestIds,
    };

    setSyncGroups([...syncGroups, newGroup]);
    setCreateGroupModalOpen(false);

    // Automatically register a schedule entry
    const newSched: ScheduleItem = {
      id: `sched-${Date.now()}`,
      requestName: `${newGroupName} (Grouped)`,
      scheduleType: newGroupSchedule,
      nextRun: 'Next Cycle',
      status: 'ACTIVE',
    };
    setSchedules([...schedules, newSched]);
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules(
      schedules.map((s) => (s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' } : s))
    );
  };

  const handleToggleGroup = (id: string) => {
    setSyncGroups(
      syncGroups.map((g) => (g.id === id ? { ...g, status: g.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : g))
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-theme-border pb-3">
        <div>
          <h1 className="page-title-heading">
            Activity & Scheduling
          </h1>
        </div>
        {onTriggerSyncAll && (
          <button
            onClick={onTriggerSyncAll}
            className="rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-extrabold text-xs px-4 py-2.5 cursor-pointer shadow-md transition-all uppercase tracking-wider"
          >
            Trigger All Schedules
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left Column: Rules & Groups */}
        <div className="space-y-5">
          {/* Section 1 - Global Sync Rules */}
          <div className="rounded-lg border border-theme-border bg-theme-card p-5 shadow-md space-y-4 text-theme-text">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white border-b border-theme-border pb-3 flex items-center gap-2">
              <Sliders className="h-4.5 w-4.5 text-lime-600 dark:text-lime-400" />
              Global Sync Rules
            </h3>

            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between">
                <div className="group relative cursor-help" title="Automatically trigger sync when opening DevSync.">
                  <span className="font-bold text-black dark:text-white block text-xs hover:text-lime-500 transition-colors">
                    Sync on Startup
                  </span>
                  <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-20 rounded bg-slate-900 px-2 py-1 text-[10px] text-white shadow-md whitespace-nowrap dark:bg-slate-800 border dark:border-slate-700">
                    Automatically trigger sync when opening DevSync.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSyncOnStartup(!syncOnStartup)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    syncOnStartup ? 'bg-lime-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle Sync on Startup"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-xs ring-0 transition duration-200 ease-in-out ${
                      syncOnStartup ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="group relative cursor-help" title="Resume transfer when internet is restored.">
                  <span className="font-bold text-black dark:text-white block text-xs hover:text-lime-500 transition-colors">
                    Sync on Internet Connect
                  </span>
                  <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-20 rounded bg-slate-900 px-2 py-1 text-[10px] text-white shadow-md whitespace-nowrap dark:bg-slate-800 border dark:border-slate-700">
                    Resume transfer when internet is restored.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSyncOnInternet(!syncOnInternet)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    syncOnInternet ? 'bg-lime-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle Sync on Internet Connect"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-xs ring-0 transition duration-200 ease-in-out ${
                      syncOnInternet ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="group relative cursor-help" title="Re-attempt failing downloads/uploads.">
                  <span className="font-bold text-black dark:text-white block text-xs hover:text-lime-500 transition-colors">
                    Automatic Retry
                  </span>
                  <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-20 rounded bg-slate-900 px-2 py-1 text-[10px] text-white shadow-md whitespace-nowrap dark:bg-slate-800 border dark:border-slate-700">
                    Re-attempt failing downloads/uploads.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoRetry(!autoRetry)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoRetry ? 'bg-lime-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle Automatic Retry"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-xs ring-0 transition duration-200 ease-in-out ${
                      autoRetry ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {autoRetry && (
                <div className="pt-2 border-t border-theme-border space-y-1.5">
                  <label className="text-[10px] text-slate-800 dark:text-slate-200 font-bold uppercase block">Retry Interval</label>
                  <select
                    value={retryInterval}
                    onChange={(e) => setRetryInterval(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-theme-border bg-theme-bg/60 text-black dark:text-white outline-none font-semibold cursor-pointer"
                  >
                    <option value="1 Minute">1 Minute</option>
                    <option value="5 Minutes">5 Minutes</option>
                    <option value="15 Minutes">15 Minutes</option>
                    <option value="30 Minutes">30 Minutes</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section 2 - Sync Groups */}
          <div className="rounded-lg border border-theme-border bg-theme-card p-5 shadow-md space-y-4 text-theme-text">
            <div className="flex justify-between items-center border-b border-theme-border pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-lime-600 dark:text-lime-400" />
                Sync Groups
              </h3>
              <button
                onClick={() => setCreateGroupModalOpen(true)}
                className="text-[11px] bg-lime-500 text-black hover:bg-lime-400 font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-all uppercase shadow-xs"
              >
                + Create Group
              </button>
            </div>

            <div className="space-y-3">
              {syncGroups.length === 0 ? <div className="text-center text-xs font-extrabold text-black dark:text-white py-6">No Sync Groups</div> : syncGroups.map((g) => {
                const isGroupActive = g.status === 'ACTIVE';
                return (
                  <div key={g.id} className="p-3 border rounded-xl border-theme-border bg-theme-bg/50 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-black dark:text-white">{g.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isGroupActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-theme-border text-slate-700 dark:text-slate-300'}`}>
                        {g.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold space-y-0.5 mt-1.5 font-mono uppercase">
                      <div>Mapped Context: {g.requestCount} nodes</div>
                      <div className="lowercase">Period: {g.schedule}</div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-theme-border">
                      <button
                        onClick={() => handleToggleGroup(g.id)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {isGroupActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => setSyncGroups(syncGroups.filter((sg) => sg.id !== g.id))}
                        className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Scheduled Requests & Recent Activity */}
        <div className="xl:col-span-2 space-y-5">
          {/* Section 3 - Scheduled Requests */}
          <div className="rounded-lg border border-theme-border bg-theme-card p-5 shadow-md space-y-4 text-theme-text">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white border-b border-theme-border pb-3 flex items-center gap-2 font-sans">
              <Calendar className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
              Schedules
            </h3>

            <div className="overflow-x-auto border border-theme-border bg-theme-card rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-theme-bg/50 font-bold border-b border-theme-border text-black dark:text-white uppercase text-[10px]">
                    <th className="p-3">Sync Request</th>
                    <th className="p-3">Schedule Type</th>
                    <th className="p-3">Next Run</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                {schedules.length === 0 ? <tr><td colSpan={5} className="text-center text-xs font-extrabold text-black dark:text-white py-6">No Schedules Configured</td></tr> : schedules.map((s) => {
                    const isSchedActive = s.status === 'ACTIVE';
                    return (
                      <tr key={s.id} className="hover:bg-theme-bg/40 text-[11px] select-none text-theme-text font-mono transition-colors">
                        <td className="p-3 font-sans font-extrabold text-black dark:text-white">{s.requestName}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">{s.scheduleType}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">{s.nextRun}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${isSchedActive ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300' : 'bg-theme-bg border border-theme-border text-slate-700 dark:text-slate-300'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right space-x-2">
                          <button
                            onClick={() => handleToggleSchedule(s.id)}
                            className="text-indigo-550 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                          >
                            {isSchedActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => setSchedules(schedules.filter((sch) => sch.id !== s.id))}
                            className="text-red-500 hover:underline text-[10px] cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4 - Recent Activity */}
          <div className="rounded border border-theme-border bg-theme-card p-5 shadow-xs space-y-4 text-theme-text">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-theme-border pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-theme-text flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-505" />
                Recent Activity
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Filter:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="h-8 rounded border border-theme-border bg-theme-bg px-2.5 text-xs text-theme-text font-semibold uppercase focus:border-indigo-600 focus:outline-none cursor-pointer"
                >
                  <option value="all">ALL</option>
                  <option value="success">SUCCESS</option>
                  <option value="failed">FAILED</option>
                  <option value="uploads">UPLOADS</option>
                  <option value="downloads">DOWNLOADS</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs max-h-[190px] overflow-y-auto">
              {recentEvents.length === 0 ? <div className="text-center text-xs text-neutral-500 py-6">No Activity Recorded</div> : recentEvents
                .filter((ev) => {
                  if (filterType === 'all') return true;
                  if (filterType === 'success') return ev.status === 'SUCCESS';
                  if (filterType === 'failed') return ev.status === 'FAILED';
                  if (filterType === 'uploads') return ev.operation === 'UPLOAD';
                  if (filterType === 'downloads') return ev.operation === 'DOWNLOAD';
                  return true;
                })
                .map((ev) => (
                  <div key={ev.id} className="flex justify-between hover:bg-theme-border/20 p-1.5 rounded-sm border-b border-dashed border-theme-border text-[11px] transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-450 font-medium">[{ev.time}]</span>
                        <span className="font-semibold text-theme-text font-sans">{ev.request}</span>
                        <span className={`px-1 py-0.1 text-[9px] font-bold rounded ${ev.status === 'SUCCESS' ? 'text-emerald-500 bg-emerald-500/5' : 'text-red-500 bg-red-500/5'}`}>
                          {ev.status}
                        </span>
                      </div>
                      <p className="text-slate-450 lowercase italic">{ev.msg}</p>
                    </div>
                    <span className="text-indigo-400 font-bold tracking-wider text-[10px] bg-indigo-500/5 px-1 py-0.5 rounded border border-indigo-900/10 self-start shrink-0 uppercase">
                      {ev.operation}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Create Sync Group */}
      {createGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-955/40 backdrop-blur-xs" onClick={() => setCreateGroupModalOpen(false)} />
          <form onSubmit={handleCreateGroup} className="relative w-full max-w-sm rounded border border-theme-border bg-theme-card p-5 text-theme-text z-50 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b pb-2 border-theme-border">
              <span className="font-bold text-xs uppercase text-theme-text font-sans">Create Sync Group</span>
              <button type="button" onClick={() => setCreateGroupModalOpen(false)} className="text-slate-400 hover:text-slate-205 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1 font-sans">
                <label className="text-slate-450 block font-semibold">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Daily Reports Backup"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full p-2 bg-theme-bg border border-theme-border rounded outline-none text-theme-text font-medium"
                  required
                />
              </div>

              <div className="space-y-1 font-sans">
                <label className="text-slate-450 block font-semibold">Schedule Period</label>
                <select
                  value={newGroupSchedule}
                  onChange={(e) => setNewGroupSchedule(e.target.value)}
                  className="w-full p-2 bg-theme-bg border border-theme-border rounded outline-none text-theme-text font-medium cursor-pointer"
                >
                  <option value="Every 5 Minutes">Every 5 Minutes</option>
                  <option value="Every 15 Minutes">Every 15 Minutes</option>
                  <option value="Every 30 Minutes">Every 30 Minutes</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>

              <div className="space-y-1 font-sans">
                <label className="text-slate-450 block font-semibold">Select Mapped Connections</label>
                <div className="space-y-1 max-h-[100px] overflow-y-auto border border-theme-border p-2 rounded bg-theme-bg">
                  {syncRequests.map((req) => (
                    <label key={req.id} className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={selectedRequestIds.includes(req.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedRequestIds([...selectedRequestIds, req.id]);
                          else setSelectedRequestIds(selectedRequestIds.filter((id) => id !== req.id));
                        }}
                        className="rounded accent-indigo-600"
                      />
                      <span className="text-theme-text">{req.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-theme-border font-sans">
              <button
                type="button"
                onClick={() => setCreateGroupModalOpen(false)}
                className="px-3 py-1.5 border border-theme-border bg-theme-bg text-theme-text text-xs font-semibold rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-605 hover:bg-indigo-500 text-white font-bold text-xs rounded shadow-xs cursor-pointer"
              >
                Save Group
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

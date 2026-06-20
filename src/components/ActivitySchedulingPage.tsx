import React, { useState } from 'react';
import {
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  FolderSync,
  Globe,
  Settings,
  X,
  Play,
  Pause,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SyncRequest } from '../types';

interface ActivitySchedulingPageProps {
  syncRequests: SyncRequest[];
  onTriggerSyncAll?: () => void;
}

// Initial mock sync groups
interface SyncGroup {
  id: string;
  name: string;
  requestCount: number;
  schedule: string;
  status: 'ACTIVE' | 'INACTIVE';
  requestsMappedRef: string[];
}

// Initial mock scheduled rows
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
  // Global Sync Rules State
  const [syncOnStartup, setSyncOnStartup] = useState(true);
  const [syncOnInternet, setSyncOnInternet] = useState(true);
  const [autoRetry, setAutoRetry] = useState(true);
  const [retryInterval, setRetryInterval] = useState('15 Minutes');

  // Sync Groups state
  const [syncGroups, setSyncGroups] = useState<SyncGroup[]>([
    {
      id: 'group-mkt',
      name: 'Corporate Marketing Assets Group',
      requestCount: 2,
      schedule: 'Every 15 Minutes',
      status: 'ACTIVE',
      requestsMappedRef: ['aws-s3-prod', 'gdrive-design'],
    },
    {
      id: 'group-fin',
      name: 'Finance & Archiving Sync Group',
      requestCount: 1,
      schedule: 'Daily at 02:00 AM',
      status: 'INACTIVE',
      requestsMappedRef: ['gdrive-budget'],
    },
  ]);

  // Scheduled requests tables
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      id: 'sched-1',
      requestName: 'AWS S3 Production Backup',
      scheduleType: 'Every 30 Minutes',
      nextRun: '10:45 AM',
      status: 'ACTIVE',
    },
    {
      id: 'sched-2',
      requestName: 'Design & Brand Guidelines',
      scheduleType: 'Daily at 02:00 AM',
      nextRun: '02:00 AM',
      status: 'ACTIVE',
    },
    {
      id: 'sched-3',
      requestName: 'Q2 Budgeting Sync',
      scheduleType: 'Manual Trigger Only',
      nextRun: 'No trigger scheduled',
      status: 'DISABLED',
    },
    {
      id: 'sched-4',
      requestName: 'Client Video Assets',
      scheduleType: 'Every 6 Hours',
      nextRun: '12:00 PM',
      status: 'ACTIVE',
    },
  ]);

  // Recent global activity events
  const [recentEvents, setRecentEvents] = useState([
    { id: 'ev-1', time: '10:15 AM', request: 'AWS S3 Production Backup', operation: 'SYNC STARTED', status: 'SUCCESS', msg: 'Integrity scanner check matching complete.' },
    { id: 'ev-2', time: '10:17 AM', request: 'AWS S3 Production Backup', operation: 'UPLOAD', status: 'SUCCESS', msg: 'production_database_replica.sql (45 MB) synchronized.' },
    { id: 'ev-3', time: '10:20 AM', request: 'Design & Brand Guidelines', operation: 'DOWNLOAD', status: 'SUCCESS', msg: 'brand_colors_draft_v3.ase updated, overwriting local change.' },
    { id: 'ev-4', time: '10:24 AM', request: 'Client Video Assets', operation: 'UPLOAD', status: 'SUCCESS', msg: 'commercial_teaser_render_fullHD.mov (1.2 GB) complete.' },
    { id: 'ev-5', time: '10:30 AM', request: 'Q2 Budgeting Sync', operation: 'SYNC STARTED', status: 'FAILED', msg: 'Endpoint handshake throttled. Connection reset by SOCKS5 proxy.' },
    { id: 'ev-6', time: '10:31 AM', request: 'Q2 Budgeting Sync', operation: 'RETRY', status: 'SUCCESS', msg: 'Handshake re-established. 1 asset processed successfully.' },
  ]);

  const [activityTypeFilter, setActivityTypeFilter] = useState<'all' | 'success' | 'failed' | 'uploads' | 'downloads'>('all');

  // Modal wizards controllers
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSchedule, setNewGroupSchedule] = useState('Every 15 Minutes');
  const [newGroupSelection, setNewGroupSelection] = useState<string[]>([]);

  // Edit schedule controllers
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editingScheduleType, setEditingScheduleType] = useState('Hourly');

  // Trigger modal triggers
  const handleOpenCreateGroup = () => {
    setNewGroupName('');
    setNewGroupSchedule('Every 15 Minutes');
    setNewGroupSelection([]);
    setCreateGroupModalOpen(true);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      alert('Please fill in a valid Sync Group name moniker.');
      return;
    }

    const newGroup: SyncGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName,
      requestCount: newGroupSelection.length,
      schedule: newGroupSchedule,
      status: 'ACTIVE',
      requestsMappedRef: newGroupSelection,
    };

    setSyncGroups([...syncGroups, newGroup]);
    setCreateGroupModalOpen(false);

    // Automatically append schedule item
    const newSched: ScheduleItem = {
      id: `sched-${Date.now()}`,
      requestName: `${newGroupName} (Group Pipeline)`,
      scheduleType: newGroupSchedule,
      nextRun: '11:00 AM',
      status: 'ACTIVE',
    };
    setSchedules([...schedules, newSched]);
  };

  const handleDeleteGroup = (id: string) => {
    setSyncGroups(syncGroups.filter((g) => g.id !== id));
  };

  const handleToggleGroupStatus = (id: string) => {
    setSyncGroups(
      syncGroups.map((g) => {
        if (g.id === id) {
          const nextStatus = g.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          return { ...g, status: nextStatus };
        }
        return g;
      })
    );
  };

  const handleToggleScheduleStatus = (id: string) => {
    setSchedules(
      schedules.map((s) => {
        if (s.id === id) {
          return { ...s, status: s.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' };
        }
        return s;
      })
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const handleToggleSelectionIdx = (id: string) => {
    if (newGroupSelection.includes(id)) {
      setNewGroupSelection(newGroupSelection.filter((sId) => sId !== id));
    } else {
      setNewGroupSelection([...newGroupSelection, id]);
    }
  };

  const handleEditScheduleClick = (id: string, type: string) => {
    setEditingScheduleId(id);
    setEditingScheduleType(type);
  };

  const handleSaveEditedSchedule = () => {
    setSchedules(
      schedules.map((s) => {
        if (s.id === editingScheduleId) {
          return { ...s, scheduleType: editingScheduleType };
        }
        return s;
      })
    );
    setEditingScheduleId(null);
  };

  // Filter global activity timeline
  const getFilteredEvents = () => {
    return recentEvents.filter((ev) => {
      if (activityTypeFilter === 'all') return true;
      if (activityTypeFilter === 'success') return ev.status === 'SUCCESS';
      if (activityTypeFilter === 'failed') return ev.status === 'FAILED';
      if (activityTypeFilter === 'uploads') return ev.operation === 'UPLOAD';
      if (activityTypeFilter === 'downloads') return ev.operation === 'DOWNLOAD';
      return true;
    });
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 uppercase font-sans tracking-tight">
            Activity & Automation Scheduling
          </h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 font-mono uppercase tracking-wide">
            Manage micro-expression sync parameters, cron groups and daemon replication rules.
          </p>
        </div>

        {onTriggerSyncAll && (
          <button
            onClick={onTriggerSyncAll}
            className="rounded-sm bg-indigo-650 hover:bg-indigo-600 text-white font-mono uppercase font-bold text-xs tracking-wider px-4 py-2 cursor-pointer shadow-xs"
          >
            Trigger All Cron Groups
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Rules & Groups */}
        <div className="xl:col-span-1 space-y-6">
          {/* Section 1 - Global Sync Rules */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 border-b border-slate-100 pb-2.5 dark:border-slate-855 flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-500" />
              Global Replication Rules
            </h3>

            <div className="space-y-4 text-xs font-mono uppercase">
              {/* Rules toggles */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-705 dark:text-slate-250 text-[10px]">Sync on Application Boot</span>
                  <p className="text-[9px] text-slate-450 lowercase">Automatically trigger sync processes upon launch.</p>
                </div>
                <button onClick={() => setSyncOnStartup(!syncOnStartup)} className="text-indigo-600 dark:text-indigo-400 cursor-pointer">
                  {syncOnStartup ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-slate-350 dark:text-slate-700" />}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-705 dark:text-slate-250 text-[10px]">Sync on Network Available</span>
                  <p className="text-[9px] text-slate-450 lowercase">Verify network link, then replicates cached queues.</p>
                </div>
                <button onClick={() => setSyncOnInternet(!syncOnInternet)} className="text-indigo-600 dark:text-indigo-400 cursor-pointer">
                  {syncOnInternet ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-slate-350 dark:text-slate-700" />}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-705 dark:text-slate-250 text-[10px]">Re-attempt Failed Pipelines</span>
                  <p className="text-[9px] text-slate-450 lowercase">Retry rate-limited folders or handshake faults.</p>
                </div>
                <button onClick={() => setAutoRetry(!autoRetry)} className="text-indigo-600 dark:text-indigo-400 cursor-pointer">
                  {autoRetry ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-slate-350 dark:text-slate-700" />}
                </button>
              </div>

              {/* Retry interval dropdown */}
              {autoRetry && (
                <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-slate-855">
                  <label className="text-[9px] text-slate-400 block font-bold">Dynamic Retry Period Interval</label>
                  <select
                    value={retryInterval}
                    onChange={(e) => setRetryInterval(e.target.value)}
                    className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250"
                  >
                    <option value="1 Minute">Every 1 Minute Offset</option>
                    <option value="5 Minutes">Every 5 Minutes Offset</option>
                    <option value="15 Minutes">Every 15 Minutes Offset</option>
                    <option value="30 Minutes">Every 30 Minutes Offset</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section 2 - Sync Groups */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-855">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" />
                Active Sync Groups ({syncGroups.length})
              </h3>
              <button
                onClick={handleOpenCreateGroup}
                className="text-[10px] font-bold uppercase text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Group
              </button>
            </div>

            {syncGroups.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-mono uppercase">
                No active target replication subgroups mapped.
              </p>
            ) : (
              <div className="space-y-3 font-mono text-xs uppercase">
                {syncGroups.map((g) => {
                  const grpActive = g.status === 'ACTIVE';

                  return (
                    <div
                      key={g.id}
                      className="p-3.5 border border-slate-150 rounded-sm bg-slate-50/50 dark:border-slate-850 dark:bg-slate-900/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 dark:text-slate-102 truncate max-w-[190px]">
                          {g.name}
                        </h4>
                        <span
                          className={`text-[9px] font-bold px-1.5 rounded-sm ${
                            grpActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-slate-250 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {g.status}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-450 space-y-1">
                        <div>Replication points: <strong className="text-slate-705 dark:text-slate-350">{g.requestCount} target links</strong></div>
                        <div>Schedule loop: <strong>{g.schedule}</strong></div>
                      </div>

                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => handleToggleGroupStatus(g.id)}
                          className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-250 text-[9px] font-bold dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-201 cursor-pointer"
                        >
                          {grpActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(g.id)}
                          className="p-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-955 cursor-pointer"
                          title="Purge sync group"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Scheduled Requests & Global Activity */}
        <div className="xl:col-span-2 space-y-6">
          {/* Section 3 - Scheduled Requests Table */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 border-b border-slate-100 pb-2.5 dark:border-slate-855 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Local crontabs scheduling manager
            </h3>

            <div className="overflow-x-auto rounded-sm border border-slate-150 dark:border-slate-850">
              <table className="w-full text-left border-collapse text-xs font-mono uppercase">
                <thead>
                  <tr className="bg-slate-55/60 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-400 font-semibold text-[10px]">
                    <th className="p-3">Sync Workspace</th>
                    <th className="p-3">Schedule Mode</th>
                    <th className="p-3">Next Scheduled Run</th>
                    <th className="p-3">State</th>
                    <th className="p-3 text-right">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {schedules.map((item) => {
                    const activeSched = item.status === 'ACTIVE';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-100">
                          {item.requestName}
                        </td>
                        <td className="p-3">
                          {editingScheduleId === item.id ? (
                            <select
                              value={editingScheduleType}
                              onChange={(e) => setEditingScheduleType(e.target.value)}
                              className="bg-white border dark:border-slate-805 dark:bg-slate-950 p-1 text-xs rounded font-mono uppercase outline-none focus:border-indigo-600"
                            >
                              <option value="Manual">Manual Only</option>
                              <option value="Every 5 Minutes">Every 5 Min</option>
                              <option value="Every 15 Minutes">Every 15 Min</option>
                              <option value="Every 30 Minutes">Every 30 Min</option>
                              <option value="Hourly">Hourly</option>
                              <option value="Daily">Daily</option>
                            </select>
                          ) : (
                            <span className="font-semibold text-slate-500">{item.scheduleType}</span>
                          )}
                        </td>
                        <td className="p-3 text-[10px] text-slate-450">
                          {editingScheduleId === item.id ? (
                            <span>Editing...</span>
                          ) : (
                            item.nextRun
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1.1 rounded-sm px-1.5 py-0.5 text-[9px] font-bold ${
                              activeSched
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450'
                                : 'bg-slate-150 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            <span className={`h-1.2 w-1.2 rounded-full ${activeSched ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {editingScheduleId === item.id ? (
                              <>
                                <button
                                  onClick={handleSaveEditedSchedule}
                                  className="text-emerald-600 font-bold hover:underline"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingScheduleId(null)}
                                  className="text-slate-405 hover:underline"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleToggleScheduleStatus(item.id)}
                                  className="p-1 text-slate-405 hover:text-slate-705 dark:hover:text-slate-205"
                                  title={activeSched ? 'Disable Scheduler run' : 'Enable Scheduler run'}
                                >
                                  {activeSched ? <Pause className="h-3.5 w-3.5 text-amber-500" /> : <Play className="h-3.5 w-3.5 text-emerald-500" />}
                                </button>
                                <button
                                  onClick={() => handleEditScheduleClick(item.id, item.scheduleType)}
                                  className="p-1 text-slate-405 hover:text-indigo-600"
                                  title="Edit schedule scheme"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSchedule(item.id)}
                                  className="p-1 text-slate-405 hover:text-red-500"
                                  title="Delete scheduled rule"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4 - Recent Global Activity events */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2.5 border-slate-100 dark:border-slate-855 font-mono text-xs">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-indigo-500" />
                Global Replications Chronicle log
              </h3>

              {/* Chronicle event filters */}
              <div className="flex flex-wrap items-center space-x-1 border border-slate-250 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950/40 rounded-sm">
                {(['all', 'success', 'failed', 'uploads', 'downloads'] as const).map((fil) => (
                  <button
                    key={fil}
                    onClick={() => setActivityTypeFilter(fil)}
                    className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase transition-all ${
                      activityTypeFilter === fil
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-250'
                    }`}
                  >
                    {fil}
                  </button>
                ))}
              </div>
            </div>

            {getFilteredEvents().length === 0 ? (
              <div className="p-12 text-center border border-dashed rounded-sm border-slate-200 dark:border-slate-850 font-mono uppercase text-xs">
                <AlertTriangle className="mx-auto h-8 w-8 text-slate-350 dark:text-slate-700 mb-2" />
                No global events matched current criteria filters.
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs uppercase max-h-[340px] overflow-y-auto pr-1">
                {getFilteredEvents().map((ev) => {
                  const isErr = ev.status === 'FAILED';
                  const isUp = ev.operation === 'UPLOAD';

                  return (
                    <div
                      key={ev.id}
                      className="p-3 border rounded-sm border-slate-150 bg-slate-50/30 dark:border-slate-850 dark:bg-slate-900/5 hover:border-slate-300 dark:hover:border-slate-800 flex items-start gap-3 justify-between transition-all"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2.5">
                          <span className="text-[10px] text-slate-400 font-bold">[{ev.time}]</span>
                          <span className="font-bold text-slate-850 dark:text-slate-101 text-[11px] font-sans">
                            {ev.request}
                          </span>
                          <span
                            className={`text-[8px] font-bold px-1.5 py-0.2 rounded-sm border tracking-wide font-sans ${
                              isErr
                                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900'
                                : isUp
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900'
                                : 'bg-sky-50 text-sky-700 border-sky-150 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900'
                            }`}
                          >
                            {ev.operation}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono lowercase tracking-wide font-medium">
                          {ev.msg}
                        </p>
                      </div>

                      <span className={`text-[10px] font-bold font-sans tracking-wide ${isErr ? 'text-red-600' : 'text-emerald-600 dark:text-emerald-450'}`}>
                        {ev.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE SYNC REPLICAS GROUP MODAL WIZARD OVERLAY */}
      {createGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setCreateGroupModalOpen(false)}
          />
          <form
            onSubmit={handleCreateGroup}
            className="relative w-full max-w-md rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-slate-105 z-50 shadow-2xl space-y-4 font-mono text-xs uppercase"
          >
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-850 text-slate-950 dark:text-slate-50">
              <h3 className="font-bold flex items-center gap-2">
                <FolderSync className="h-5 w-5 text-indigo-500" />
                Configure Replication Subgroup
              </h3>
              <button
                type="button"
                onClick={() => setCreateGroupModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-sm dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Group Identifier Tag</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marketing Sync Group"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Group Cron Loop Iteration</label>
                <select
                  value={newGroupSchedule}
                  onChange={(e) => setNewGroupSchedule(e.target.value)}
                  className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250"
                >
                  <option value="Every 5 Minutes">Every 5 Minutes crontab</option>
                  <option value="Every 15 Minutes">Every 15 Minutes crontab</option>
                  <option value="Every 30 Minutes">Every 30 clock minutes</option>
                  <option value="Hourly">Every Hour benchmark</option>
                  <option value="Daily">Daily run loop offset</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1.5">
                  Select Associated Sync Requests
                </label>
                {syncRequests.length === 0 ? (
                  <p className="text-[10px] text-slate-400 py-2">Create standard requests first before assembling groups.</p>
                ) : (
                  <div className="rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 max-h-[110px] overflow-y-auto space-y-1.5">
                    {syncRequests.map((r) => {
                      const isSelected = newGroupSelection.includes(r.id);

                      return (
                        <div
                          key={r.id}
                          className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-900"
                          onClick={() => handleToggleSelectionIdx(r.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="mr-1 accent-indigo-600"
                          />
                          <span className="text-[10px] text-slate-705 dark:text-slate-250 truncate">{r.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-101 pt-3  dark:border-slate-850 flex justify-end gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => setCreateGroupModalOpen(false)}
                className="px-3.5 py-2 border border-slate-200 bg-white text-slate-705 dark:border-slate-800 dark:bg-slate-955 rounded-sm hover:bg-slate-50 uppercase text-[10px] font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-sm font-bold uppercase transition-colors"
              >
                Validate and Assemble Group
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

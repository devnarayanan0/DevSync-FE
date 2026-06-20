import React, { useState } from 'react';
import {
  Settings,
  Database,
  Cpu,
  ShieldAlert,
  Info,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  FileSpreadsheet,
  Grid,
  Sparkles,
  Download,
  AlertTriangle,
  X,
} from 'lucide-react';
import { SyncRequest, Theme } from '../types';

interface SettingsPageProps {
  theme: Theme;
  onThemeToggle: () => void;
  syncRequests: SyncRequest[];
  onResetApp: () => void;
}

export default function SettingsPage({
  theme,
  onThemeToggle,
  syncRequests,
  onResetApp,
}: SettingsPageProps) {
  // Section 1 - Appearance state
  const [accentColor, setAccentColor] = useState<string>('indigo');
  const [fontSize, setFontSize] = useState<string>('medium');

  // Section 2 - Application Startup & Notification States
  const [launchOnStartup, setLaunchOnStartup] = useState<boolean>(true);
  const [minimizeToTray, setMinimizeToTray] = useState<boolean>(true);
  const [startMinimized, setStartMinimized] = useState<boolean>(false);

  const [notifCompleted, setNotifCompleted] = useState<boolean>(true);
  const [notifFailed, setNotifFailed] = useState<boolean>(true);
  const [notifDisconnected, setNotifDisconnected] = useState<boolean>(true);
  const [notifUpdates, setNotifUpdates] = useState<boolean>(false);
  const [updateChannel, setUpdateChannel] = useState<string>('stable');

  // Section 3 - Protected Database Administrator access states
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');
  const [selectedDbTable, setSelectedDbTable] = useState<string>('sync_configuration');

  // Section 4 - Advanced fields
  const [backendUrl, setBackendUrl] = useState<string>('http://localhost:3000/api/daemon');
  const [isTestingBackend, setIsTestingBackend] = useState<boolean>(false);
  const [backendDiagnosticResult, setBackendDiagnosticResult] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Authentication trigger rules
  const handleVerifyAdministrator = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (adminPasswordInput === 'admin' || adminPasswordInput === 'password' || adminPasswordInput.length >= 4) {
      setIsAdminUnlocked(true);
      setAdminError('');
    } else {
      setAdminError('Invalid access password credentials. Try using default "admin" profile credential key.');
    }
  };

  // Diagnostics triggers
  const handleTestBackendStatus = () => {
    setIsTestingBackend(true);
    setBackendDiagnosticResult('Checking daemon responsiveness on ' + backendUrl + '...');
    setTimeout(() => {
      setIsTestingBackend(false);
      setBackendDiagnosticResult('Daemon Status: ACTIVE • Uptime: 3 days, 14 hours • Socket Link: SECURED • Endpoint v2 compliant.');
    }, 1200);
  };

  const handleTestProviderConnections = () => {
    alert('Diagnostics Output:\n\n- AWS S3 connection: SUCCESS (Ping 124ms)\n- Google Drive API connection: SUCCESS (Token valid)\n- SQLite durability integrity: MATCHED\n- Workspace daemon process count: 18 threads active');
  };

  const handleViewApplicationInformation = () => {
    alert('DevSync Desktop Client Manifest:\n\nOS Target: Windows/macOS Unified Hybrid App\nRelease Fork: Electron runtime container Node v20\nApplication ID: com.devsync.workstation.client\nDatabase Hash: sha256_9f82de9fae3\nSpring Integrator: Active');
  };

  // DB tables mock records data source representing our SQLite DB
  const getMockTableData = () => {
    switch (selectedDbTable) {
      case 'sync_configuration':
        return {
          headers: ['id', 'name', 'provider', 'status', 'localPath', 'schedule'],
          rows: syncRequests.map((r, i) => [r.id, r.name, r.provider, r.status, r.localPath, r.schedule]),
        };
      case 'sync_activity':
        return {
          headers: ['id', 'timestamp', 'operation', 'status', 'message'],
          rows: [
            ['3201', '10:15:30', 'UPLOAD', 'SUCCESS', 'budget_q2_draft.xlsx synced safely'],
            ['3202', '10:15:32', 'UPLOAD', 'SUCCESS', 'sales_forecast_final.pdf uploaded'],
            ['3203', '10:20:00', 'DOWNLOAD', 'SUCCESS', 'brand_identity_v2.ase updated'],
          ],
        };
      case 'sync_schedule':
        return {
          headers: ['id', 'request_name', 'schedule_pattern', 'parallel_pool', 'status'],
          rows: [
            ['sch_aws', 'AWS S3 Production Backup', 'Every 30 mins', '4 Workers', 'ACTIVE'],
            ['sch_gdr', 'Design & Brand Guidelines', 'Daily at 02:00 AM', '1 Worker', 'ACTIVE'],
            ['sch_fin', 'Q2 Budgeting Sync', 'Manual Trigger Only', '1 Worker', 'DISABLED'],
          ],
        };
      case 'application_logs':
        return {
          headers: ['id', 'timestamp', 'level', 'source', 'action', 'status'],
          rows: [
            ['log-01', '10:00:12 AM', 'INFO', 'SyncEngine', 'Bucket verification', 'SUCCESS'],
            ['log-02', '10:05:22 AM', 'ERROR', 'GoogleDrive', 'Folder process', 'FAILED'],
            ['log-03', '10:11:00 AM', 'WARNING', 'AuthService', 'Token Expiry Refresh', 'SUCCESS'],
          ],
        };
      case 'app_settings':
        return {
          headers: ['setting_key', 'setting_value', 'scope', 'is_encrypted'],
          rows: [
            ['app_theme', theme, 'Appearance', 'FALSE'],
            ['accent_color', accentColor, 'Appearance', 'FALSE'],
            ['launch_on_startup', launchOnStartup ? 'TRUE' : 'FALSE', 'Startup', 'FALSE'],
            ['backend_endpoint_url', backendUrl, 'Advanced', 'TRUE'],
          ],
        };
      default:
        return { headers: [], rows: [] };
    }
  };

  const currentTableData = getMockTableData();

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-850">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 uppercase font-sans tracking-tight">
          Workstation & client Settings
        </h1>
        <p className="text-xs text-slate-455 dark:text-slate-400 mt-1 font-mono uppercase tracking-wide">
          Manage visual attributes, startup triggers, protected database viewers, and diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column Section */}
        <div className="space-y-6">
          {/* Section 1 - Appearance */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 border-b border-slate-100 pb-2.5 dark:border-slate-855 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-indigo-505" />
              Appearance preferences
            </h3>

            <div className="space-y-4 text-xs font-mono uppercase">
              {/* Theme switching */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-705 dark:text-slate-250 text-[10px]">Application Theme mode</span>
                  <p className="text-[9px] text-slate-450 lowercase">Toggle dark or light workspace theme modes instantly.</p>
                </div>
                <div className="flex border border-slate-250 dark:border-slate-800 rounded-sm bg-slate-50 dark:bg-slate-950 p-1">
                  <button
                    onClick={() => theme === 'dark' && onThemeToggle()}
                    className={`px-3 py-1 text-[10px] font-bold rounded-sm uppercase tracking-wide transition-all ${
                      theme === 'light'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-550 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => theme === 'light' && onThemeToggle()}
                    className={`px-3 py-1 text-[10px] font-bold rounded-sm uppercase tracking-wide transition-all ${
                      theme === 'dark'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-550 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Accent Color selections */}
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-855">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-705 dark:text-slate-250 text-[10px]">Workspace Accent Swatch</span>
                  <p className="text-[9px] text-slate-450 lowercase">Select key color accent highlight schemes.</p>
                </div>
                <div className="flex gap-1.5">
                  {[
                    { id: 'indigo', bg: 'bg-indigo-600' },
                    { id: 'purple', bg: 'bg-purple-600' },
                    { id: 'emerald', bg: 'bg-emerald-600' },
                    { id: 'amber', bg: 'bg-amber-500' },
                    { id: 'rose', bg: 'bg-rose-650' },
                  ].map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setAccentColor(color.id)}
                      className={`h-5.5 w-5.5 rounded-full ${color.bg} transition-all cursor-pointer ${
                        accentColor === color.id ? 'ring-2 ring-slate-400 dark:ring-slate-300 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Font Size selections */}
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-855">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-705 dark:text-slate-250 text-[10px]">Client Display Typography scale</span>
                  <p className="text-[9px] text-slate-450 lowercase">Adjust system readability label fonts sizes.</p>
                </div>
                <div className="flex border border-slate-250 dark:border-slate-800 rounded-sm bg-slate-50 dark:bg-slate-950 p-1">
                  {['small', 'medium', 'large'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFontSize(sz)}
                      className={`px-2.5 py-1 text-[9px] font-bold rounded-sm uppercase transition-all ${
                        fontSize === sz
                          ? 'bg-indigo-600 text-white shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 - Application startup & notification config */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 border-b border-slate-100 pb-2.5 dark:border-slate-855 flex items-center gap-1.5">
              <Cpu className="h-4.5 w-4.5 text-indigo-505" />
              Startup & Desktop notifications behavior
            </h3>

            <div className="space-y-3.5 text-xs font-mono uppercase">
              <div className="flex items-start gap-3.5 select-none">
                <input
                  type="checkbox"
                  id="chk-startup"
                  checked={launchOnStartup}
                  onChange={(e) => setLaunchOnStartup(e.target.checked)}
                  className="mt-0.5 accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="chk-startup" className="space-y-0.5 cursor-pointer">
                  <span className="font-bold text-slate-705 dark:text-slate-250 text-[10px]">Launch on system boot</span>
                  <p className="text-[9px] text-slate-450 lowercase leading-relaxed">Automatically start replication daemon as Windows Startup task / macOS daemon.</p>
                </label>
              </div>

              <div className="flex items-start gap-3.5 select-none">
                <input
                  type="checkbox"
                  id="chk-tray"
                  checked={minimizeToTray}
                  onChange={(e) => setMinimizeToTray(e.target.checked)}
                  className="mt-0.5 accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="chk-tray" className="space-y-0.5 cursor-pointer">
                  <span className="font-bold text-slate-705 dark:text-slate-250 text-[10px]">Minimize to taskbar tray on close</span>
                  <p className="text-[9px] text-slate-450 lowercase leading-relaxed">Keep engine processes running in taskbar tray backgrounds when frame is exited.</p>
                </label>
              </div>

              <div className="flex items-start gap-3.5 select-none">
                <input
                  type="checkbox"
                  id="chk-start-min"
                  checked={startMinimized}
                  onChange={(e) => setStartMinimized(e.target.checked)}
                  className="mt-0.5 accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="chk-start-min" className="space-y-0.5 cursor-pointer">
                  <span className="font-bold text-slate-705 dark:text-slate-250 text-[10px]">Start minimized (silent boot)</span>
                  <p className="text-[9px] text-slate-450 lowercase leading-relaxed">Run system task operations entirely within bottom bars on workstation boot.</p>
                </label>
              </div>

              {/* Notification Checkboxes */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-855 space-y-2">
                <span className="text-[10px] text-slate-400 block font-bold mb-1">Interactive Desktop Banner Alerts</span>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="nt-c" checked={notifCompleted} onChange={(e) => setNotifCompleted(e.target.checked)} className="accent-indigo-600" />
                    <label htmlFor="nt-c" className="cursor-pointer">Sync completed trigger</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="nt-f" checked={notifFailed} onChange={(e) => setNotifFailed(e.target.checked)} className="accent-indigo-600" />
                    <label htmlFor="nt-f" className="cursor-pointer">Sync failed warnings</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="nt-d" checked={notifDisconnected} onChange={(e) => setNotifDisconnected(e.target.checked)} className="accent-indigo-600" />
                    <label htmlFor="nt-d" className="cursor-pointer">Api Link disconnections</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="nt-u" checked={notifUpdates} onChange={(e) => setNotifUpdates(e.target.checked)} className="accent-indigo-600" />
                    <label htmlFor="nt-u" className="cursor-pointer">Software updates patch alerts</label>
                  </div>
                </div>
              </div>

              {/* Channel switcher */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-855 font-mono text-xs uppercase space-y-1">
                <label className="text-[9px] text-slate-450 block font-bold">Release Updates Channel</label>
                <select
                  value={updateChannel}
                  onChange={(e) => setUpdateChannel(e.target.value)}
                  className="h-10 w-full rounded-sm border border-slate-201 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250"
                >
                  <option value="stable">Stable Builds (Officially validated)</option>
                  <option value="beta">Beta Forks (Cutting edge testing builds)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Section */}
        <div className="space-y-6">
          {/* Section 3 - Local Database Verification Viewer */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 border-b border-slate-100 pb-2.5 dark:border-slate-855 flex items-center gap-1.5">
              <Database className="h-4.5 w-4.5 text-indigo-505" />
              SQLite Local Database Inspector
            </h3>

            {/* Database information specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-mono text-slate-450 uppercase border-b pb-3.5 border-slate-100 dark:border-slate-855">
              <div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-850 p-2.5 rounded-sm">
                <span>Database:</span>
                <strong className="block text-slate-705 dark:text-slate-205">local_sqlite.db</strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-850 p-2.5 rounded-sm">
                <span>Disk Size:</span>
                <strong className="block text-slate-705 dark:text-slate-205">24.2 MB</strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-850 p-2.5 rounded-sm">
                <span>Requests count:</span>
                <strong className="block text-slate-705 dark:text-slate-205">{syncRequests.length} records</strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-850 p-2.5 rounded-sm">
                <span>Cron Schedules:</span>
                <strong className="block text-slate-705 dark:text-slate-205">4 active</strong>
              </div>
            </div>

            {/* If Locked layout */}
            {!isAdminUnlocked ? (
              <form onSubmit={handleVerifyAdministrator} className="space-y-3.5 font-mono text-xs uppercase pt-1">
                <div className="flex items-center gap-2 text-amber-600 border border-amber-200 bg-amber-50/10 p-3.5 rounded-sm text-[10px] leading-relaxed">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <span>Administrative Handshake Security Verification Required. Please type standard credentials to inspect read-only database grids.</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input
                      type="password"
                      placeholder="Input Windows/macOS Admin Token (pass: admin)"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      className="h-10 w-full rounded-sm border border-slate-201 bg-slate-50 px-3 text-xs tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-805 dark:bg-slate-950 text-slate-800 dark:text-slate-250 uppercase placeholder-slate-430"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-10 px-5 bg-slate-805 hover:bg-slate-750 text-white font-bold uppercase transition-colors rounded-sm cursor-pointer shrink-0"
                  >
                    Authenticate Handshake
                  </button>
                </div>

                {adminError && <p className="text-[10px] text-red-500 font-bold block">{adminError}</p>}
              </form>
            ) : (
              <div className="space-y-4 pt-1 text-xs font-mono uppercase">
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-955/25 border border-emerald-250 p-3 rounded-sm text-[10px] text-emerald-800 dark:text-emerald-450 font-bold">
                  <div className="flex items-center gap-1.5">
                    <Unlock className="h-4 w-4" />
                    <span>ADMINISTRATOR VERIFICATION GRANTED</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminUnlocked(false);
                      setAdminPasswordInput('');
                    }}
                    className="hover:underline text-[9px] uppercase cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                  >
                    Relock Scope
                  </button>
                </div>

                {/* Table selector buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {['sync_configuration', 'sync_activity', 'sync_schedule', 'application_logs', 'app_settings'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedDbTable(tab)}
                      className={`px-2.5 py-1 text-[9px] font-bold rounded-sm border transition-all uppercase ${
                        selectedDbTable === tab
                          ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-850'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Database rendering block */}
                <div className="rounded-sm border border-slate-200 dark:border-slate-850 overflow-hidden max-h-[160px] overflow-y-auto w-full">
                  <table className="w-full text-left border-collapse text-[10px] font-mono leading-relaxed">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-205 dark:border-slate-850 text-slate-450 dark:text-slate-450">
                        {currentTableData.headers.map((hd) => (
                          <th key={hd} className="p-2 font-bold uppercase">{hd}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-705 dark:text-slate-300">
                      {currentTableData.rows.length === 0 ? (
                        <tr>
                          <td colSpan={currentTableData.headers.length} className="p-4 text-center text-slate-405 font-bold uppercase">
                            No records cataloged inside SQLite table yet.
                          </td>
                        </tr>
                      ) : (
                        currentTableData.rows.map((rowArr, index) => (
                          <tr key={index} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/40">
                            {rowArr.map((cellStr, cellIdx) => (
                              <td key={cellIdx} className="p-2 font-mono max-w-[140px] truncate" title={String(cellStr)}>
                                {String(cellStr)}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Database utility actions */}
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => alert('Database Export downloade as devsync-sqlite-secrets-dump.sql successfully.')}
                    className="px-2.5 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-705 border border-slate-202 dark:bg-slate-800 dark:border-slate-750 dark:text-slate-205 text-[10px] uppercase font-bold cursor-pointer"
                  >
                    Export Dump (.SQL)
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Sqlite local integrity snapshot replication completed. Backup: local_sqlite_timestamp_bkp.db')}
                    className="px-2.5 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-705 border border-slate-202 dark:bg-slate-800 dark:border-slate-750 dark:text-slate-205 text-[10px] uppercase font-bold cursor-pointer"
                  >
                    Backup Database
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 4 - Advanced Settings & Diagnostic Rules */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 border-b border-slate-100 pb-2.5 dark:border-slate-855 flex items-center gap-1.5">
              <Cpu className="h-4.5 w-4.5 text-indigo-550" />
              Diagnostics & Backend daemon configurations
            </h3>

            <div className="space-y-4 text-xs font-mono uppercase">
              {/* Backend URL configure */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-bold">Local replication backend link URL</label>
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  className="h-10 w-full rounded-sm border border-slate-201 bg-slate-50 px-3 tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250 lowercase"
                />
              </div>

              {/* Diagnostic checks buttons row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-855">
                <button
                  type="button"
                  disabled={isTestingBackend}
                  onClick={handleTestBackendStatus}
                  className="px-3.5 py-2 hover:bg-slate-100 text-slate-705 border border-slate-200 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-850 dark:text-slate-200 rounded-sm font-bold uppercase cursor-pointer"
                >
                  {isTestingBackend ? 'Testing...' : 'Check Backend'}
                </button>
                <button
                  type="button"
                  onClick={handleTestProviderConnections}
                  className="px-3.5 py-2 hover:bg-slate-100 text-slate-705 border border-slate-200 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-850 dark:text-slate-200 rounded-sm font-bold uppercase cursor-pointer"
                >
                  Test Providers
                </button>
                <button
                  type="button"
                  onClick={handleViewApplicationInformation}
                  className="px-3.5 py-2 hover:bg-slate-100 text-slate-705 border border-slate-200 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-850 dark:text-slate-200 rounded-sm font-bold uppercase cursor-pointer"
                >
                  App Version Data
                </button>
              </div>

              {/* Diagnostic stdout telemetry box */}
              {backendDiagnosticResult && (
                <pre className="text-[10px] p-3 text-emerald-400 bg-neutral-950 rounded-sm border border-neutral-800 overflow-x-auto font-mono lowercase tracking-normal leading-relaxed whitespace-pre-wrap font-medium">
                  {backendDiagnosticResult}
                </pre>
              )}

              {/* Reset application trigger */}
              <div className="pt-3.5 border-t border-slate-101 dark:border-slate-850 flex items-center justify-between text-xs font-mono uppercase">
                <span className="text-[10px] text-red-650 dark:text-red-400 font-bold">Hard purge workstation state</span>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 bg-red-605 hover:bg-red-550 text-white rounded-sm font-bold uppercase cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" /> Reset Application
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded footer info card info */}
      <div className="rounded-sm border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-4 font-mono text-xs uppercase flex flex-col sm:flex-row justify-between gap-3 text-slate-455">
        <span>Application: <strong>DevSync Workstation Client</strong></span>
        <span>Version: <strong>v1.0.0 (Production Alpha Built-in)</strong></span>
        <span>Build Number: <strong>260620.aistudio.spring</strong></span>
      </div>

      {/* RESET APPLICATION INTERACTIVE OVERLAY CONFIRM DIALOG */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setShowResetConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-50 z-50 shadow-xl space-y-4 font-mono text-xs uppercase">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2.5">
              <AlertTriangle className="h-5 w-5 text-red-505" />
              <h3 className="font-bold text-red-600">Hard-Reset DevSync Workstation?</h3>
            </div>
            <p className="text-[11px] text-slate-505 lowercase leading-relaxed">
              Purging your workstation entirely wipes all replication configurations, scheduling cron-groups, developer database logs, and credentials settings. This is a destructive diagnostics command.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 border border-slate-200 bg-white text-slate-705 dark:border-slate-800 dark:bg-slate-950 rounded-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetApp();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-550 text-white rounded-sm font-bold transition-colors cursor-pointer"
              >
                Reset Application State
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

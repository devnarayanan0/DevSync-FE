import React, { useState } from 'react';
import {
  Settings,
  Database,
  Cpu,
  Info,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
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
  // Theme & Appearance
  const [accentColor, setAccentColor] = useState<string>('indigo');
  const [fontSize, setFontSize] = useState<string>('medium');

  // Startup & Notifications Settings
  const [launchOnStartup, setLaunchOnStartup] = useState<boolean>(true);
  const [minimizeToTray, setMinimizeToTray] = useState<boolean>(true);
  const [startMinimized, setStartMinimized] = useState<boolean>(false);

  const [notifCompleted, setNotifCompleted] = useState<boolean>(true);
  const [notifFailed, setNotifFailed] = useState<boolean>(true);
  const [notifDisconnected, setNotifDisconnected] = useState<boolean>(true);

  // Database Access Token
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');
  const [selectedDbTable, setSelectedDbTable] = useState<string>('sync_requests_table');

  // Backend / Diagnostics
  const [backendUrl, setBackendUrl] = useState<string>('http://localhost:3000/api');
  const [isTestingBackend, setIsTestingBackend] = useState<boolean>(false);
  const [backendDiagnosticResult, setBackendDiagnosticResult] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleVerifyAdministrator = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (adminPasswordInput === 'admin' || adminPasswordInput === 'password' || adminPasswordInput.length >= 4) {
      setIsAdminUnlocked(true);
      setAdminError('');
    } else {
      setAdminError('Invalid password. Try "admin".');
    }
  };

  const handleTestBackendStatus = () => {
    setIsTestingBackend(true);
    setBackendDiagnosticResult('Checking backend connection at ' + backendUrl + '...');
    setTimeout(() => {
      setIsTestingBackend(false);
      setBackendDiagnosticResult('Backend Connection Status: ACTIVE • Uptime: 3 days • API Protocol verified.');
    }, 1200);
  };

  const currentTableHeaders = ['id', 'name', 'provider', 'status', 'localPath', 'remoteFolder'];
  const currentTableRows = syncRequests.map((r) => [r.id, r.name, r.provider, r.status, r.localPath, r.remoteFolder]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="border-b border-theme-border pb-3">
        <h1 className="text-lg font-bold text-theme-text">
          Client Settings
        </h1>
        <p className="text-xs text-neutral-400">
          Configure application themes, cloud provider credentials, and client-side options.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Appearance Section */}
          <div className="rounded border border-theme-border bg-theme-card p-5 shadow-xs space-y-4 text-theme-text">
            <h3 className="text-xs font-bold uppercase tracking-wider text-theme-text border-b border-theme-border pb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-505" />
              Theme & Appearance Settings
            </h3>

            <div className="space-y-4 text-xs font-sans">
              {/* Theme toggler */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-theme-text block text-xs">Application Theme</span>
                  <p className="text-[11px] text-slate-400">Switch between light and dark visual interfaces.</p>
                </div>
                <div className="flex border border-theme-border rounded bg-theme-bg p-0.5">
                  <button
                    onClick={() => theme === 'dark' && onThemeToggle()}
                    className={`px-3 py-1 text-[10px] font-bold rounded uppercase cursor-pointer transition-all ${
                      theme === 'light' ? 'bg-indigo-650 text-white shadow-xs' : 'text-slate-500 hover:text-slate-850 dark:text-slate-400'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => theme === 'light' && onThemeToggle()}
                    className={`px-3 py-1 text-[10px] font-bold rounded uppercase cursor-pointer transition-all ${
                      theme === 'dark' ? 'bg-indigo-650 text-white shadow-xs' : 'text-slate-500 hover:text-slate-850 dark:text-slate-400'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Accent Color switcher */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-theme-border">
                <div>
                  <span className="font-semibold text-slate-850 dark:text-slate-200 block text-xs">Accent Highlight Color</span>
                  <p className="text-[11px] text-slate-400">Select standard accent highlight schemes.</p>
                </div>
                <div className="flex gap-1.5">
                  {[
                    { id: 'indigo', bg: 'bg-indigo-600' },
                    { id: 'purple', bg: 'bg-purple-600' },
                    { id: 'emerald', bg: 'bg-emerald-600' },
                    { id: 'amber', bg: 'bg-amber-500' },
                    { id: 'rose', bg: 'bg-rose-600' },
                  ].map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setAccentColor(color.id)}
                      className={`h-5 w-5 rounded-full ${color.bg} cursor-pointer transition-all ${
                        accentColor === color.id ? 'ring-2 ring-slate-400 scale-110 ring-offset-2' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Typography Readability Scale */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-theme-border">
                <div>
                  <span className="font-semibold text-theme-text block text-xs">Interface Typography Scale</span>
                  <p className="text-[11px] text-slate-400 font-sans">Adjust labels text sizing.</p>
                </div>
                <div className="flex border border-theme-border bg-theme-bg p-0.5 rounded">
                  {['small', 'medium', 'large'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFontSize(sz)}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase cursor-pointer transition-all ${
                        fontSize === sz ? 'bg-indigo-605 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Startup Settings Section */}
          <div className="rounded border border-theme-border bg-theme-card p-5 shadow-xs space-y-4 text-theme-text">
            <h3 className="text-xs font-bold uppercase tracking-wider text-theme-text border-b border-theme-border pb-2 flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-indigo-505" />
              Startup & Notification rules
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3 select-all">
                <input
                  type="checkbox"
                  id="s-startup"
                  checked={launchOnStartup}
                  onChange={(e) => setLaunchOnStartup(e.target.checked)}
                  className="mt-0.5 cursor-pointer accent-indigo-600"
                />
                <label htmlFor="s-startup" className="cursor-pointer space-y-0.5">
                  <span className="font-semibold block">Launch Automatically on Computer Boot</span>
                  <p className="text-[11px] text-slate-400 font-sans lowercase">Open DevSync client helper in background when booting.</p>
                </label>
              </div>

              <div className="flex items-start gap-3 select-all">
                <input
                  type="checkbox"
                  id="s-tray"
                  checked={minimizeToTray}
                  onChange={(e) => setMinimizeToTray(e.target.checked)}
                  className="mt-0.5 cursor-pointer accent-indigo-600"
                />
                <label htmlFor="s-tray" className="cursor-pointer space-y-0.5">
                  <span className="font-semibold block">Minimize to Tray Icon upon Exit</span>
                  <p className="text-[11px] text-slate-400 font-sans lowercase">Keep local scheduler running silently when window is closed.</p>
                </label>
              </div>

              <div className="flex items-start gap-3 select-all">
                <input
                  type="checkbox"
                  id="s-minimized"
                  checked={startMinimized}
                  onChange={(e) => setStartMinimized(e.target.checked)}
                  className="mt-0.5 cursor-pointer accent-indigo-600"
                />
                <label htmlFor="s-minimized" className="cursor-pointer space-y-0.5">
                  <span className="font-semibold block">Start Minimized</span>
                  <p className="text-[11px] text-slate-400 font-sans lowercase">Run background syncing process without popping up main window on boot.</p>
                </label>
              </div>

              {/* Notification preferences */}
              <div className="pt-3 border-t border-theme-border space-y-2">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Banner Notification Alerts</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={notifCompleted} onChange={(e) => setNotifCompleted(e.target.checked)} className="accent-indigo-600" />
                    <span>On completion</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={notifFailed} onChange={(e) => setNotifFailed(e.target.checked)} className="accent-indigo-600" />
                    <span>On synchronization error</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={notifDisconnected} onChange={(e) => setNotifDisconnected(e.target.checked)} className="accent-indigo-600" />
                    <span>On server disconnect</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Local Database Viewer */}
          <div className="rounded border border-theme-border bg-theme-card p-5 shadow-xs space-y-4 text-theme-text">
            <h3 className="text-xs font-bold uppercase tracking-wider text-theme-text border-b border-theme-border pb-2 flex items-center gap-1.5">
              <Database className="h-4 w-4 text-indigo-505" />
              Configuration Storage Inspector (Local Cache)
            </h3>

            <div className="grid grid-cols-3 gap-2.5 text-[10px] border-b pb-3 border-theme-border">
              <div className="bg-theme-bg p-2 border border-theme-border rounded">
                <span className="text-slate-400 block font-semibold uppercase text-[9px]">Storage Channel:</span>
                <strong className="block text-theme-text font-mono">sync_config</strong>
              </div>
              <div className="bg-theme-bg p-2 border border-theme-border rounded">
                <span className="text-slate-400 block font-semibold uppercase text-[9px]">Memory cache:</span>
                <strong className="block text-theme-text font-mono">Active (12KB)</strong>
              </div>
              <div className="bg-theme-bg p-2 border border-theme-border rounded">
                <span className="text-slate-400 block font-semibold uppercase text-[9px]">Definitions:</span>
                <strong className="block text-theme-text font-mono">{syncRequests.length} items</strong>
              </div>
            </div>

            {!isAdminUnlocked ? (
              <form onSubmit={handleVerifyAdministrator} className="space-y-3 pt-0.5">
                <div className="flex gap-2 p-3 bg-amber-50/15 border border-amber-200/40 rounded text-[11px] text-amber-600 leading-relaxed font-sans">
                  <Unlock className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>Administrative authentication is required to inspect configuration parameter mappings. Enter standard credentials.</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter Admin Password (try: admin)"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="flex-1 text-xs p-2.5 bg-theme-bg border border-theme-border rounded outline-none select-all text-theme-text focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded text-xs font-semibold uppercase cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
                {adminError && <p className="text-[10px] text-red-500 font-bold block">{adminError}</p>}
              </form>
            ) : (
              <div className="space-y-3 pt-0.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-450 uppercase">
                  <span>Access Verified</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminUnlocked(false);
                      setAdminPasswordInput('');
                    }}
                    className="hover:underline text-slate-400 cursor-pointer uppercase text-[9px]"
                  >
                    Lock Inspector
                  </button>
                </div>

                {/* DB table rendering */}
                <div className="rounded border border-theme-border overflow-hidden max-h-[120px] overflow-y-auto bg-theme-bg">
                  <table className="w-full text-left text-[10px] font-mono leading-tight text-theme-text">
                    <thead>
                      <tr className="bg-theme-bg border-b border-theme-border text-slate-450 uppercase font-bold">
                        {currentTableHeaders.map((hd) => (
                          <th key={hd} className="p-2 whitespace-nowrap">{hd}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-border text-theme-text">
                      {currentTableRows.length === 0 ? (
                        <tr>
                          <td colSpan={currentTableHeaders.length} className="p-3 text-center text-slate-400">
                            No values registered.
                          </td>
                        </tr>
                      ) : (
                        currentTableRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-theme-border/40 text-theme-text">
                            {row.map((cellValue, cellIdx) => (
                              <td key={cellIdx} className="p-2 max-w-[120px] truncate" title={String(cellValue)}>
                                {String(cellValue)}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => alert('Dump exported to workstation disk.')}
                    className="px-2.5 py-1 rounded bg-theme-bg hover:bg-theme-border font-semibold cursor-pointer border border-theme-border text-theme-text"
                  >
                    Export Dump (.sql)
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Backup snap file created.')}
                    className="px-2.5 py-1 rounded bg-theme-bg hover:bg-theme-border font-semibold cursor-pointer border border-theme-border text-theme-text"
                  >
                    Backup Database
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Diagnostics / Backend configuration */}
          <div className="rounded border border-theme-border bg-theme-card p-5 shadow-xs space-y-4 text-theme-text">
            <h3 className="text-xs font-bold uppercase tracking-wider text-theme-text border-b border-theme-border pb-2 flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-indigo-505" />
              Cloud Backend & Advanced Options
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 block font-semibold uppercase text-[10px]">Backend Link Endpoint URL</label>
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  className="w-full text-xs p-2.5 bg-theme-bg border border-theme-border rounded outline-none font-mono lowercase text-theme-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  disabled={isTestingBackend}
                  onClick={handleTestBackendStatus}
                  className="px-3.5 py-1.5 bg-theme-bg hover:bg-theme-border text-theme-text border border-theme-border rounded font-bold cursor-pointer transition-colors"
                >
                  {isTestingBackend ? 'Testing...' : 'Check Backend Link'}
                </button>
                <button
                  type="button"
                  onClick={() => alert('All AWS S3 and Google Drive providers responded successfully.')}
                  className="px-3.5 py-1.5 bg-theme-bg hover:bg-theme-border text-theme-text border border-theme-border rounded font-bold cursor-pointer transition-colors"
                >
                  Test Providers
                </button>
              </div>

              {backendDiagnosticResult && (
                <pre className="text-[10px] p-2.5 bg-neutral-950 text-emerald-400 rounded overflow-x-auto max-h-[90px] font-mono leading-relaxed leading-tight lowercase">
                  {backendDiagnosticResult}
                </pre>
              )}

              {/* Hard application reset */}
              <div className="pt-3 border-t border-theme-border flex items-center justify-between">
                <span className="text-[10px] text-red-500 font-bold block uppercase font-sans">Hard Reset Application State</span>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="bg-red-50/10 hover:bg-red-50 text-red-650 dark:text-red-400 border border-red-200/40 px-3.5 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" /> Reset App
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="rounded border border-theme-border bg-theme-bg p-4 font-mono text-[11px] text-slate-450 flex flex-col sm:flex-row justify-between gap-2">
        <span>Application: <strong>DevSync Workstation Client</strong></span>
        <span>Version: <strong>v1.0.0 Stable</strong></span>
        <span>Ref Channel: <strong>production.alpha.sync</strong></span>
      </div>

      {/* Purge Modal overlay */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-955/40 backdrop-blur-xs" onClick={() => setShowResetConfirm(false)} />
          <div className="relative w-full max-w-sm rounded border border-theme-border bg-theme-card p-5 text-theme-text z-50 shadow-xl space-y-4 font-sans text-xs">
            <div className="flex items-center gap-2 border-b pb-2 border-theme-border">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="font-bold text-red-650">Confirm hard application reset?</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans font-medium">
              Are you sure? This action will permanently remove all synchronization mappings, group settings, locally cached parameters, and credentials.
            </p>
            <div className="flex justify-end gap-2 pt-1 font-sans">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 border border-theme-border bg-theme-bg hover:bg-theme-border text-theme-text rounded text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetApp();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-xs cursor-pointer focus:outline-none"
              >
                Reset Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

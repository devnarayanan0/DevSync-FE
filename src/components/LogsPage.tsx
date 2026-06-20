import { useState } from 'react';
import {
  Search,
  Terminal,
  Activity,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  Database,
  ExternalLink,
  SlidersHorizontal,
  X,
  FileCode,
  Info,
  Bug,
  AlertTriangle,
} from 'lucide-react';

interface ApplicationLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  source: string;
  action: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  provider: string;
  tenantId: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  statusCode: string;
  duration: string;
  requestPayload: string;
  responsePayload: string;
  errorMessage?: string;
  stackTrace?: string;
}

const INITIAL_LOGS: ApplicationLog[] = [
  {
    id: 'log-001',
    timestamp: '10:00:12 AM',
    level: 'INFO',
    source: 'SyncEngine',
    action: 'Bucket Configuration Check',
    status: 'SUCCESS',
    provider: 'AWS S3',
    tenantId: 'tenant-aws-corp-3004',
    endpoint: '/api/v1/tenant/aws/verify',
    method: 'POST',
    statusCode: '200 OK',
    duration: '245 ms',
    requestPayload: JSON.stringify({ bucketName: 'production-vault-sync', region: 'us-east-1', accessKey: 'AKIA**********' }, null, 2),
    responsePayload: JSON.stringify({ status: 'VERIFIED', accountId: '123456789012', region: 'us-east-1' }, null, 2),
  },
  {
    id: 'log-002',
    timestamp: '10:05:22 AM',
    level: 'ERROR',
    source: 'GoogleDriveAPI',
    action: 'Folder Synchronization Run',
    status: 'FAILED',
    provider: 'Google Drive',
    tenantId: 'gdrive-marketing-hub',
    endpoint: '/api/v2/gdrive/upload-chunk',
    method: 'POST',
    statusCode: '401 Unauthorized',
    duration: '112 ms',
    requestPayload: JSON.stringify({ chunkId: 'chk_9f823a', sizeBytes: 15402 }, null, 2),
    responsePayload: JSON.stringify({ error: 'Auth credentials expired', code: 'TOKEN_EXPIRATION' }, null, 2),
    errorMessage: 'OAuth refresh token failed to resolve securely. Desktop client was unauthorized.',
    stackTrace: 'Error: OAuth refresh token failed\n  at GoogleOAuth.resolveToken (auth.ts:42:15)\n  at GoogleDriveAPI.uploadChunk (gdrive.ts:102:4)\n  at SyncManager.processItem (sync.ts:241:10)',
  },
  {
    id: 'log-003',
    timestamp: '10:11:00 AM',
    level: 'WARNING',
    source: 'AuthManager',
    action: 'Token Expiry Refresh Event',
    status: 'WARNING',
    provider: 'Google Drive',
    tenantId: 'gdrive-marketing-hub',
    endpoint: '/api/v1/auth/refresh-session',
    method: 'GET',
    statusCode: '429 Too Many Requests',
    duration: '450 ms',
    requestPayload: '{}',
    responsePayload: JSON.stringify({ message: 'Rate limit tripped on provider check', delayMs: 2000 }, null, 2),
  },
  {
    id: 'log-004',
    timestamp: '10:15:30 AM',
    level: 'DEBUG',
    source: 'Database',
    action: 'Local SQLite Write Operation',
    status: 'SUCCESS',
    provider: 'System',
    tenantId: 'default',
    endpoint: 'local://sqlite/sync_configuration',
    method: 'PUT',
    statusCode: 'OK',
    duration: '14 ms',
    requestPayload: JSON.stringify({ id: 'aws-s3-prod', lastSync: '2026-06-20 10:15:30' }, null, 2),
    responsePayload: JSON.stringify({ rowsAffected: 1 }, null, 2),
  },
  {
    id: 'log-005',
    timestamp: '10:20:44 AM',
    level: 'INFO',
    source: 'SyncEngine',
    action: 'Checksum Integrity Validate',
    status: 'SUCCESS',
    provider: 'AWS S3',
    tenantId: 'tenant-aws-corp-3004',
    endpoint: '/api/v1/tenant/aws/checksum',
    method: 'POST',
    statusCode: '200 OK',
    duration: '312 ms',
    requestPayload: JSON.stringify({ path: '/Users/david/designs', hashAlg: 'SHA-256' }, null, 2),
    responsePayload: JSON.stringify({ match: true, remoteCount: 1482 }, null, 2),
  },
  {
    id: 'log-006',
    timestamp: '10:25:01 AM',
    level: 'ERROR',
    source: 'AWS S3 API',
    action: 'File Upload Multipart Commit',
    status: 'FAILED',
    provider: 'AWS S3',
    tenantId: 'tenant-aws-corp-3004',
    endpoint: '/api/v1/s3/multipart/commit',
    method: 'POST',
    statusCode: '500 Server Error',
    duration: '854 ms',
    requestPayload: JSON.stringify({ uploadId: 'mp_s3_9481aa', parts: 12 }, null, 2),
    responsePayload: JSON.stringify({ error: 'Internal AWS link disconnection', code: 'AWS_FAIL_TRANSIENT' }, null, 2),
    errorMessage: 'AWS S3 Gateway Timeout committing final parts of asset backup.',
    stackTrace: 'AWS.S3Exception: Gateway Timeout\n  at AWS.S3Client.commitMultipart (aws.ts:24)\n  at SyncEngine.finishReplication (engine.ts:205)',
  },
];

export default function LogsPage() {
  const [logs, setLogs] = useState<ApplicationLog[]>(INITIAL_LOGS);
  const [selectedLogId, setSelectedLogId] = useState<string | null>('log-001');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering states
  const [logTypeFilter, setLogTypeFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');

  // Payload collapsing panel states
  const [requestPayloadOpen, setRequestPayloadOpen] = useState(true);
  const [responsePayloadOpen, setResponsePayloadOpen] = useState(false);

  // Clear logs action
  const handleClearTerminal = () => {
    setLogs([]);
    setSelectedLogId(null);
  };

  // Export as format helpers
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `devsync_stdout_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    let csvRows = ['ID,Timestamp,Level,Source,Action,Status,Provider,Endpoint,Method,StatusCode\n'];
    logs.forEach((log) => {
      csvRows.push(`"${log.id}","${log.timestamp}","${log.level}","${log.source}","${log.action}","${log.status}","${log.provider}","${log.endpoint}","${log.method}","${log.statusCode}"\n`);
    });
    const blob = new Blob(csvRows, { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `devsync_stdout_logs_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Perform full search + filter query resolution rules
  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(query) ||
      log.source.toLowerCase().includes(query) ||
      log.endpoint.toLowerCase().includes(query) ||
      log.provider.toLowerCase().includes(query) ||
      (log.errorMessage && log.errorMessage.toLowerCase().includes(query));

    // Log Type (API Request / Response / Authentication / Synchronization etc.)
    let matchesType = true;
    if (logTypeFilter !== 'all') {
      if (logTypeFilter === 'api_requests') {
        matchesType = log.source.includes('API') || log.endpoint.startsWith('/api');
      } else if (logTypeFilter === 'authentication') {
        matchesType = log.source.includes('Auth') || log.action.includes('Refresh') || log.action.includes('Token');
      } else if (logTypeFilter === 'sync') {
        matchesType = log.source.includes('Sync') || log.action.includes('Synchroniz');
      } else if (logTypeFilter === 'errors') {
        matchesType = log.level === 'ERROR';
      } else if (logTypeFilter === 'warnings') {
        matchesType = log.level === 'WARNING';
      }
    }

    // Provider filter
    let matchesProvider = true;
    if (providerFilter !== 'all') {
      matchesProvider = log.provider === providerFilter;
    }

    // Status filter
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = log.status === statusFilter;
    }

    return matchesSearch && matchesType && matchesProvider && matchesStatus;
  });

  // Selected Log Obj computation
  const selectedLog = logs.find((l) => l.id === selectedLogId) || null;

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-205 pb-4 dark:border-slate-850">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 uppercase font-sans tracking-tight">
            System Diagnostics console (STDOUT)
          </h1>
          <p className="text-xs text-slate-455 dark:text-slate-400 mt-1 font-mono uppercase tracking-wide">
            Technical SQLite, MCP handshake triggers, AWS bucket headers, and gateway endpoints execution audits.
          </p>
        </div>

        <div className="flex gap-2 font-mono text-xs uppercase">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 rounded-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 px-3 py-2 font-bold cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-sm border border-slate-205 bg-white hover:bg-slate-50 text-slate-705 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 px-3 py-2 font-bold cursor-pointer"
          >
            <FileCode className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={handleClearTerminal}
            className="inline-flex items-center gap-1.5 rounded-sm bg-slate-800 text-white hover:bg-slate-750 dark:bg-slate-900 dark:hover:bg-slate-800 px-3.5 py-2 font-bold cursor-pointer"
          >
            <Trash2 className="h-4 w-4" /> Clear Console
          </button>
        </div>
      </div>

      {/* Sliders filter settings card */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row gap-3.5">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-405" />
            <input
              type="text"
              placeholder="Search stderr stacktraces, endpoints, sources, errors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-805 dark:text-slate-250 placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {/* Filter 1: Log type */}
            <select
              value={logTypeFilter}
              onChange={(e) => setLogTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-sm border border-slate-200 bg-slate-50 text-[10px] font-bold uppercase dark:border-slate-800 dark:bg-slate-950 dark:text-slate-250 outline-none"
            >
              <option value="all">Category: All logs</option>
              <option value="api_requests">API Handshakes Only</option>
              <option value="authentication">Auth Refresh sessions</option>
              <option value="sync">Daemon replication crons</option>
              <option value="errors">Critical Stack Errors</option>
              <option value="warnings">System Warnings</option>
            </select>

            {/* Filter 2: Cloud Provider */}
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="px-3 py-1.5 rounded-sm border border-slate-200 bg-slate-50 text-[10px] font-bold uppercase dark:border-slate-800 dark:bg-slate-950 dark:text-slate-250 outline-none"
            >
              <option value="all">Platform: All providers</option>
              <option value="AWS S3">AWS S3 link</option>
              <option value="Google Drive">Google Drive API</option>
              <option value="System">Local SQLite host</option>
            </select>

            {/* Filter 3: Status check */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-sm border border-slate-200 bg-slate-50 text-[10px] font-bold uppercase dark:border-slate-800 dark:bg-slate-950 dark:text-slate-250 outline-none"
            >
              <option value="all">Status: Checked-All</option>
              <option value="SUCCESS">Success (200 OK)</option>
              <option value="FAILED">Failure Exceptions</option>
              <option value="WARNING">Warnings Throttled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Double View Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: Logs List Area */}
        <div className="lg:col-span-3 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center rounded-sm border border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/40 text-xs font-mono uppercase">
              <Terminal className="mx-auto h-11 w-11 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="font-bold text-slate-700 dark:text-slate-350">No Application Logs Found</h3>
              <p className="text-[10px] text-slate-400 mt-1">Console is sleeping or active search matches zero indices.</p>
            </div>
          ) : (
            <div className="rounded-sm border border-slate-200 bg-slate-950 text-neutral-300 shadow-xl overflow-y-auto max-h-[580px]">
              <div className="border-b border-neutral-800 p-3.5 text-neutral-500 uppercase text-[9px] font-bold flex justify-between tracking-wide">
                <span>STDOUT STREAM • SELECT ROW TO EXPOSE PARAMETERS</span>
                <span>POOL COUNT: {filteredLogs.length} LOG LINES</span>
              </div>

              <div className="divide-y divide-neutral-900 font-mono text-[11px] leading-relaxed">
                {filteredLogs.map((log) => {
                  const isErr = log.level === 'ERROR';
                  const isWarn = log.level === 'WARNING';
                  const isSelected = selectedLogId === log.id;

                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      className={`p-3 select-none flex items-start gap-3 cursor-pointer hover:bg-neutral-900/60 transition-colors ${
                        isSelected ? 'bg-neutral-900 border-l-[3px] border-indigo-500 pl-2.2' : ''
                      }`}
                    >
                      <span className="text-neutral-550 shrink-0 font-bold">[{log.timestamp}]</span>
                      <span
                        className={`font-semibold uppercase tracking-widest text-[9px] px-1.5 py-0.2 rounded-sm ${
                          isErr ? 'bg-rose-955 text-rose-400 border border-rose-900' :
                          isWarn ? 'bg-amber-955 text-amber-400 border border-amber-900' :
                          log.level === 'DEBUG' ? 'bg-purple-955 text-purple-400 border border-purple-900' :
                          'bg-emerald-955 text-emerald-400 border border-emerald-900Item'
                        }`}
                      >
                        {log.level}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-neutral-101 shrink-0 text-xs">
                          <span className="text-indigo-400">[{log.source}]</span>
                          <span className="truncate">{log.action}</span>
                        </div>
                        <p className="text-neutral-450 text-[10px] transition-all truncate lowercase">
                          {log.method} {log.endpoint} → {log.statusCode} ({log.duration})
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold text-right shrink-0 uppercase tracking-widest ${
                          log.status === 'FAILED' ? 'text-red-500 animate-pulse' :
                          log.status === 'WARNING' ? 'text-amber-500' : 'text-emerald-500'
                        }`}
                      >
                        {log.status === 'SUCCESS' ? 'OK' : log.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Log Detailed Inspector Panel */}
        <div className="lg:col-span-2">
          {!selectedLog ? (
            <div className="h-full rounded-sm border border-slate-205 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-950/20 flex flex-col items-center justify-center text-center font-mono text-xs uppercase text-slate-404">
              <SlidersHorizontal className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
              <span>Diagnostic Inspector Empty</span>
              <p className="text-[9px] text-slate-400 mt-0.5">Choose an active log row index on the left to review metrics.</p>
            </div>
          ) : (
            <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4 font-mono text-xs uppercase">
              {/* Box Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-855 text-slate-900 dark:text-slate-50">
                <h3 className="font-bold flex items-center gap-2">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-indigo-500" />
                  STDOUT Trace Inspector
                </h3>
                <span className="text-[10px] font-bold text-slate-400 font-mono">ID: {selectedLog.id}</span>
              </div>

              {/* Log Level Banner */}
              <div className={`p-3 rounded-sm border flex items-center gap-2.5 ${
                selectedLog.level === 'ERROR'
                  ? 'bg-red-50 border-red-200 text-red-750 dark:bg-red-955/20 dark:border-red-900/60 dark:text-red-400'
                  : selectedLog.level === 'WARNING'
                  ? 'bg-amber-50 border-amber-200 text-amber-705 dark:bg-amber-955/20 dark:border-amber-905/60 dark:text-amber-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-750 dark:bg-emerald-955/20 dark:border-emerald-905/60 dark:text-emerald-450'
              }`}>
                {selectedLog.level === 'ERROR' ? <AlertOctagon className="h-5 w-5 pointer-events-none" /> : <Info className="h-5 w-5 pointer-events-none" />}
                <div className="space-y-0.5">
                  <span className="font-bold text-[11px] block">{selectedLog.action}</span>
                  <p className="text-[9px] lowercase tracking-wide font-mono">timestamp epoch clock • {selectedLog.timestamp}</p>
                </div>
              </div>

              {/* Scope spec fields */}
              <div className="space-y-3 pt-1">
                {/* Section API Info */}
                <div className="rounded-sm bg-slate-50 dark:bg-slate-900/80 border dark:border-slate-850 p-3 space-y-2 text-[10px]">
                  <span className="text-[9px] text-slate-400 font-bold block mb-1">Trace Session Metadata</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-semibold text-slate-705 dark:text-slate-205 uppercase">
                    <div>PROVIDER: <strong className="text-slate-805 dark:text-slate-100">{selectedLog.provider}</strong></div>
                    <div>SOURCE: <strong className="text-slate-805 dark:text-slate-100">{selectedLog.source}</strong></div>
                    <div className="col-span-2 truncate">NAMESPACE: <strong className="text-slate-805 dark:text-slate-100">{selectedLog.tenantId}</strong></div>
                  </div>
                </div>

                {/* Section Technical Protocol */}
                <div className="rounded-sm bg-slate-50 dark:bg-slate-900/80 border dark:border-slate-850 p-3 space-y-2 text-[10px]">
                  <span className="text-[9px] text-slate-400 font-bold block mb-1">Gateway API Protocol</span>
                  <div className="space-y-1 text-slate-705 dark:text-slate-205">
                    <div className="flex justify-between">
                      <span>ENDPOINT:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 lower-case font-mono">{selectedLog.method} {selectedLog.endpoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>STATUS CODE:</span>
                      <span className="font-bold text-slate-858 dark:text-slate-100">{selectedLog.statusCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>REPLICATION LATENCY:</span>
                      <span className="font-bold text-slate-858 dark:text-slate-105">{selectedLog.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Exception blocks on fail */}
                {selectedLog.errorMessage && (
                  <div className="rounded-sm bg-red-50/15 border border-red-200/40 p-3.5 space-y-2 text-[10px]">
                    <span className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> TRACE EXCEPTION INFO
                    </span>
                    <p className="text-slate-800 dark:text-red-400 font-bold lowercase tracking-wide">
                      {selectedLog.errorMessage}
                    </p>
                    {selectedLog.stackTrace && (
                      <pre className="text-[9px] text-red-700/80 dark:text-red-550 lowercase tracking-normal overflow-x-auto bg-red-50/5 dark:bg-neutral-950 p-2 border dark:border-red-955 rounded font-mono leading-relaxed max-h-[120px]">
                        {selectedLog.stackTrace}
                      </pre>
                    )}
                  </div>
                )}

                {/* Nested JSON payloads collapse panels */}
                <div className="space-y-2">
                  {/* Panel Request Payload */}
                  <div className="border border-slate-200 dark:border-slate-850 rounded-sm">
                    <button
                      type="button"
                      onClick={() => setRequestPayloadOpen(!requestPayloadOpen)}
                      className="w-full flex items-center justify-between p-2.5 bg-slate-100/60 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-[10px] font-bold"
                    >
                      <span>REPLICATOR REQUEST BODY (MASKED KEYS)</span>
                      {requestPayloadOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                    </button>
                    {requestPayloadOpen && (
                      <pre className="text-[10px] p-2.5 bg-neutral-950 text-emerald-400 overflow-x-auto max-h-[110px] leading-relaxed font-mono font-medium tracking-normal whitespace-pre">
                        {selectedLog.requestPayload}
                      </pre>
                    )}
                  </div>

                  {/* Panel Response Payload */}
                  <div className="border border-slate-200 dark:border-slate-850 rounded-sm">
                    <button
                      type="button"
                      onClick={() => setResponsePayloadOpen(!responsePayloadOpen)}
                      className="w-full flex items-center justify-between p-2.5 bg-slate-100/60 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-[10px] font-bold"
                    >
                      <span>GATEWAY RESPONSE PAYLOAD</span>
                      {responsePayloadOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                    </button>
                    {responsePayloadOpen && (
                      <pre className="text-[10px] p-2.5 bg-neutral-950 text-emerald-400 overflow-x-auto max-h-[110px] leading-relaxed font-mono font-medium tracking-normal whitespace-pre">
                        {selectedLog.responsePayload}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

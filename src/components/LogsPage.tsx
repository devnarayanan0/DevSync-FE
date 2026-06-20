import { useState } from 'react';
import {
  Search,
  Terminal,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  Info,
  AlertTriangle,
  SlidersHorizontal,
  FileCode
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
  method: string;
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
    endpoint: 's3://production-vault-sync',
    method: 'CHECK',
    statusCode: '200 OK',
    duration: '245 ms',
    requestPayload: JSON.stringify({ bucketName: 'production-vault-sync', region: 'us-east-1' }, null, 2),
    responsePayload: JSON.stringify({ status: 'VERIFIED', region: 'us-east-1' }, null, 2),
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
    endpoint: 'gdrive://marketing-assets-v2',
    method: 'UPLOAD',
    statusCode: '401 Unauthorized',
    duration: '112 ms',
    requestPayload: JSON.stringify({ folder: 'marketing-assets-v2', sizeBytes: 15402 }, null, 2),
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
    endpoint: 'auth://token/refresh',
    method: 'AUTH',
    statusCode: '429 Too Many Requests',
    duration: '450 ms',
    requestPayload: '{}',
    responsePayload: JSON.stringify({ message: 'Rate limit tripped on provider check', retryAfterSeconds: 2 }, null, 2),
  },
  {
    id: 'log-004',
    timestamp: '10:15:30 AM',
    level: 'DEBUG',
    source: 'ClientConfig',
    action: 'Cache Parameter Write',
    status: 'SUCCESS',
    provider: 'System',
    tenantId: 'default',
    endpoint: 'local://cache/sync_requests',
    method: 'WRITE',
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
    action: 'Folder Hash Comparison Check',
    status: 'SUCCESS',
    provider: 'AWS S3',
    tenantId: 'tenant-aws-corp-3004',
    endpoint: 's3://production-vault-sync',
    method: 'COMPARE',
    statusCode: '200 OK',
    duration: '312 ms',
    requestPayload: JSON.stringify({ path: '/Users/david/designs', hashAlg: 'SHA-256' }, null, 2),
    responsePayload: JSON.stringify({ match: true, remoteCount: 1482 }, null, 2),
  },
];

export default function LogsPage() {
  const [logs, setLogs] = useState<ApplicationLog[]>(INITIAL_LOGS);
  const [selectedLogId, setSelectedLogId] = useState<string | null>('log-001');
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Payload collapse state
  const [requestPayloadOpen, setRequestPayloadOpen] = useState(true);
  const [responsePayloadOpen, setResponsePayloadOpen] = useState(false);

  const handleClearTerminal = () => {
    setLogs([]);
    setSelectedLogId(null);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `devsync_application_logs_${Date.now()}.json`);
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
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `devsync_application_logs_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      log.source.toLowerCase().includes(q) ||
      log.endpoint.toLowerCase().includes(q) ||
      log.provider.toLowerCase().includes(q) ||
      (log.errorMessage && log.errorMessage.toLowerCase().includes(q));

    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesProvider = providerFilter === 'all' || log.provider === providerFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesLevel && matchesProvider && matchesStatus;
  });

  const selectedLog = logs.find((l) => l.id === selectedLogId) || null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Application Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review detailed execution records, background transfers, and auth warnings.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 px-2.5 py-1.5 rounded font-semibold cursor-pointer select-none transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 border border-slate-250 bg-white hover:bg-slate-50 text-slate-705 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 px-2.5 py-1.5 rounded font-semibold cursor-pointer select-none transition-colors"
          >
            <FileCode className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button
            onClick={handleClearTerminal}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-750 px-3 py-1.5 rounded font-semibold cursor-pointer select-none transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear Logs
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search logs by action, source, endpoint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 select-all dark:border-slate-805 dark:bg-slate-950 pl-9 pr-3 py-2 rounded focus:bg-white dark:focus:bg-slate-950 outline-none text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {/* Filter by Level */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="p-2 border border-slate-200 bg-slate-50 dark:border-slate-805 dark:bg-slate-950 text-xs font-semibold rounded outline-none"
            >
              <option value="all">Levels: All</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
              <option value="DEBUG">DEBUG</option>
            </select>

            {/* Filter by Provider */}
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="p-2 border border-slate-200 bg-slate-50 dark:border-slate-805 dark:bg-slate-950 text-xs font-semibold rounded outline-none"
            >
              <option value="all">Providers: All</option>
              <option value="AWS S3">AWS S3</option>
              <option value="Google Drive">Google Drive</option>
              <option value="System">System Local</option>
            </select>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-slate-200 bg-slate-50 dark:border-slate-805 dark:bg-slate-950 text-xs font-semibold rounded outline-none"
            >
              <option value="all">Statuses: All</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="WARNING">Warning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main double column screen inspector layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left Side: Table */}
        <div className="lg:col-span-3">
          {filteredLogs.length === 0 ? (
            <div className="p-10 border border-dashed text-center rounded bg-white dark:border-slate-800 dark:bg-slate-900 space-y-2">
              <Terminal className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">No Logs Matching Search</h4>
              <p className="text-xs text-slate-400">Clear filters or try a different search phrase.</p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-450 font-semibold uppercase text-[10px]">
                    <th className="p-3">Time</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Source/Action</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px] font-mono leading-relaxed">
                  {filteredLogs.map((log) => {
                    const isSelected = selectedLogId === log.id;
                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLogId(log.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-semibold border-l-4 border-indigo-550'
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-950/10'
                        }`}
                      >
                        <td className="p-3 text-slate-400 dark:text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                        <td className="p-3">
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            log.level === 'ERROR' ? 'bg-red-50 text-red-700 dark:bg-red-950/30' :
                            log.level === 'WARNING' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30' :
                            log.level === 'DEBUG' ? 'bg-purple-50 text-purple-700' :
                            'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30'
                          }`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">[{log.source}]</div>
                          <div className="text-slate-500 truncate max-w-[200px]">{log.action}</div>
                        </td>
                        <td className="p-3 text-slate-450">{log.provider}</td>
                        <td className="p-3 text-right">
                          <span className={`font-bold uppercase text-[9px] ${log.status === 'FAILED' ? 'text-red-500' : log.status === 'WARNING' ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Log Inspector Details Panel */}
        <div className="lg:col-span-2">
          {!selectedLog ? (
            <div className="p-6 border border-dashed rounded bg-slate-50/50 dark:bg-slate-900/10 text-center text-slate-400 text-xs">
              <SlidersHorizontal className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
              <span>Select a log row on the left to view detailed metrics and payload variables.</span>
            </div>
          ) : (
            <div className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4 text-xs font-sans">
              <div className="flex justify-between items-center border-b pb-2.5 dark:border-slate-800 text-slate-800 dark:text-slate-100">
                <span className="font-bold uppercase text-xs">Log Inspector</span>
                <span className="font-mono text-slate-400 text-[10px]">ID: {selectedLog.id}</span>
              </div>

              {/* Status Header */}
              <div className={`p-3 rounded border flex items-center gap-2 ${
                selectedLog.level === 'ERROR' ? 'bg-red-50 border-red-200 text-red-750 dark:bg-red-950/20 dark:border-red-900/60 dark:text-red-400' :
                selectedLog.level === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-705 dark:bg-amber-955/20 dark:border-amber-900/60' :
                'bg-emerald-50 border-emerald-200 text-emerald-750 dark:bg-emerald-950/20'
              }`}>
                {selectedLog.level === 'ERROR' ? <AlertOctagon className="h-4.5 w-4.5 shrink-0" /> : <Info className="h-4.5 w-4.5 shrink-0" />}
                <div>
                  <span className="font-semibold block">{selectedLog.action}</span>
                  <span className="text-[10px] text-slate-400">{selectedLog.timestamp}</span>
                </div>
              </div>

              {/* Details table mapping */}
              <div className="space-y-3">
                <div className="rounded bg-slate-50 dark:bg-slate-950 p-3 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <header className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Metadata Variables</header>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono leading-relaxed">
                    <div>PROVIDER: <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedLog.provider}</span></div>
                    <div>SOURCE: <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedLog.source}</span></div>
                    <div className="col-span-2">NAMESPACE: <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedLog.tenantId}</span></div>
                  </div>
                </div>

                <div className="rounded bg-slate-50 dark:bg-slate-950 p-3 space-y-1 text-xs text-slate-750 dark:text-slate-300">
                  <header className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Protocol Execution</header>
                  <div className="space-y-1.5 text-[11px] font-mono leading-relaxed">
                    <div className="flex justify-between">
                      <span>ENDPOINT/URI:</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[200px] lowercase">{selectedLog.endpoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>METHOD:</span>
                      <span className="font-bold">{selectedLog.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>STATUS:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLog.statusCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LATENCY:</span>
                      <span className="font-semibold">{selectedLog.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Error details */}
                {selectedLog.errorMessage && (
                  <div className="rounded bg-red-50/10 border border-red-200/50 p-3 space-y-1.5 text-[11px]">
                    <span className="text-[9px] text-red-500 font-bold block uppercase">Exception Stack Trace</span>
                    <p className="text-red-750 dark:text-red-400 font-semibold font-mono">{selectedLog.errorMessage}</p>
                    {selectedLog.stackTrace && (
                      <pre className="text-[9px] p-2 bg-neutral-950 dark:bg-neutral-950 text-red-400 rounded overflow-x-auto max-h-[100px] font-mono leading-relaxed leading-tight lowercase">
                        {selectedLog.stackTrace}
                      </pre>
                    )}
                  </div>
                )}

                {/* Dropdowns payloads */}
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="border border-slate-200 dark:border-slate-800 rounded">
                    <button
                      type="button"
                      onClick={() => setRequestPayloadOpen(!requestPayloadOpen)}
                      className="w-full flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase"
                    >
                      <span>Request Payload Details</span>
                      {requestPayloadOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    {requestPayloadOpen && (
                      <pre className="p-2.5 bg-neutral-950 text-emerald-400 overflow-x-auto max-h-[100px] leading-relaxed select-all">
                        {selectedLog.requestPayload}
                      </pre>
                    )}
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded">
                    <button
                      type="button"
                      onClick={() => setResponsePayloadOpen(!responsePayloadOpen)}
                      className="w-full flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase"
                    >
                      <span>Response Payload Details</span>
                      {responsePayloadOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    {responsePayloadOpen && (
                      <pre className="p-2.5 bg-neutral-950 text-emerald-400 overflow-x-auto max-h-[100px] leading-relaxed select-all">
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

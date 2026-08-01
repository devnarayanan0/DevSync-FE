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

const INITIAL_LOGS: ApplicationLog[] = [];

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-theme-border pb-3">
        <div>
          <h1 className="page-title-heading">
            Application Logs
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 border border-theme-border bg-theme-bg hover:bg-theme-border text-theme-text px-2.5 py-1.5 rounded font-semibold cursor-pointer select-none transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 border border-theme-border bg-theme-bg hover:bg-theme-border text-theme-text px-2.5 py-1.5 rounded font-semibold cursor-pointer select-none transition-colors"
          >
            <FileCode className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button
            onClick={handleClearTerminal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded font-semibold cursor-pointer select-none transition-colors shadow-xs"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear Logs
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded border border-theme-border bg-theme-card p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search logs by action, source, endpoint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-theme-bg border border-theme-border select-all pl-9 pr-3 py-2 rounded focus:bg-theme-card outline-none text-theme-text font-mono"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {/* Filter by Level */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="p-2 border border-theme-border bg-theme-bg text-xs font-semibold rounded outline-none text-theme-text focus:bg-theme-card focus:border-indigo-500"
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
              className="p-2 border border-theme-border bg-theme-bg text-xs font-semibold rounded outline-none text-theme-text focus:bg-theme-card focus:border-indigo-500"
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
              className="p-2 border border-theme-border bg-theme-bg text-xs font-semibold rounded outline-none text-theme-text focus:bg-theme-card focus:border-indigo-500"
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
            <div className="p-10 border border-theme-border text-center rounded-lg bg-theme-card shadow-md space-y-2">
              <Terminal className="mx-auto h-8 w-8 text-black dark:text-white" />
              <h4 className="font-bold text-black dark:text-white text-sm">No Logs Matching Search</h4>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Clear filters or try a different search phrase.</p>
            </div>
          ) : (
            <div className="border border-theme-border rounded-lg bg-theme-card shadow-md overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-theme-bg/50 border-b border-theme-border text-black dark:text-white font-bold uppercase text-[10px]">
                    <th className="p-3">Time</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Source/Action</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border text-[11px] font-mono leading-relaxed">
                  {filteredLogs.map((log) => {
                    const isSelected = selectedLogId === log.id;
                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLogId(log.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-50/45 dark:bg-indigo-950/25 font-semibold border-l-4 border-indigo-550 text-indigo-700 dark:text-indigo-400'
                            : 'hover:bg-theme-bg/50'
                        }`}
                      >
                        <td className="p-3 font-sans text-[11px] font-extrabold text-black dark:text-white whitespace-nowrap">{log.timestamp}</td>
                        <td className="p-3">{getLogLevelBadge(log.level)}</td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-black dark:text-white text-xs font-sans">{log.action}</span>
                            <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold">{log.source}</span>
                          </div>
                        </td>
                        <td className="p-3 uppercase text-slate-800 dark:text-slate-200 font-bold">{log.provider}</td>
                        <td className="p-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            log.status === 'OK' || log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                          }`}>
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
            <div className="p-8 border border-theme-border rounded-lg bg-theme-card shadow-md text-center text-black dark:text-white text-xs font-bold space-y-2">
              <SlidersHorizontal className="mx-auto h-8 w-8 text-black dark:text-white mb-2" />
              <span>Select a log row on the left to view detailed metrics and payload variables.</span>
            </div>
          ) : (
            <div className="rounded-lg border border-theme-border bg-theme-card p-5 shadow-md space-y-4 text-xs font-sans text-theme-text">
              <div className="flex justify-between items-center border-b border-theme-border pb-2.5 text-theme-text">
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
                <div className="rounded bg-theme-bg p-3 space-y-1.5 text-xs text-theme-text">
                  <header className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Metadata Variables</header>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono leading-relaxed">
                    <div>PROVIDER: <span className="font-semibold text-theme-text">{selectedLog.provider}</span></div>
                    <div>SOURCE: <span className="font-semibold text-theme-text">{selectedLog.source}</span></div>
                    <div className="col-span-2">NAMESPACE: <span className="font-semibold text-theme-text">{selectedLog.tenantId}</span></div>
                  </div>
                </div>

                <div className="rounded bg-theme-bg p-3 space-y-1 text-xs text-theme-text">
                  <header className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Protocol Execution</header>
                  <div className="space-y-1.5 text-[11px] font-mono leading-relaxed">
                    <div className="flex justify-between">
                      <span>ENDPOINT/URI:</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[200px] lowercase">{selectedLog.endpoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>METHOD:</span>
                      <span>{selectedLog.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>STATUS:</span>
                      <span className="font-semibold text-theme-text">{selectedLog.statusCode}</span>
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
                  <div className="border border-theme-border rounded">
                    <button
                      type="button"
                      onClick={() => setRequestPayloadOpen(!requestPayloadOpen)}
                      className="w-full flex items-center justify-between p-2 bg-theme-bg text-[10px] font-bold uppercase"
                    >
                      <span>Request Payload Details</span>
                      {requestPayloadOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    {requestPayloadOpen && (
                      <pre className="p-2.5 bg-neutral-950 text-emerald-400 overflow-x-auto max-h-[100px] leading-relaxed select-all border-t border-theme-border">
                        {selectedLog.requestPayload}
                      </pre>
                    )}
                  </div>

                  <div className="border border-theme-border rounded">
                    <button
                      type="button"
                      onClick={() => setResponsePayloadOpen(!responsePayloadOpen)}
                      className="w-full flex items-center justify-between p-2 bg-theme-bg text-[10px] font-bold uppercase"
                    >
                      <span>Response Payload Details</span>
                      {responsePayloadOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    {responsePayloadOpen && (
                      <pre className="p-2.5 bg-neutral-950 text-emerald-400 overflow-x-auto max-h-[100px] leading-relaxed select-all border-t border-theme-border">
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

import { useState, FormEvent } from 'react';
import {
  User,
  Mail,
  Calendar,
  Layers,
  Shield,
  Key,
  Database,
  Cloud,
  CheckCircle,
  AlertTriangle,
  Lock,
  LogOut,
  Download,
  Trash2,
  Check,
  Building,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, SyncRequest } from '../types';

interface ProfilePageProps {
  user: UserProfile;
  syncRequests: SyncRequest[];
  onLogout: () => void;
  onNavigateToTab: (tabId: string) => void;
  onUpdatePasswordSuccess?: () => void;
}

interface ConnectedTenant {
  id: string;
  name: string;
  provider: string;
  status: 'VERIFIED' | 'NOT VERIFIED' | 'DISCONNECTED';
  createdDate: string;
}

export default function ProfilePage({
  user,
  syncRequests,
  onLogout,
  onNavigateToTab,
  onUpdatePasswordSuccess,
}: ProfilePageProps) {
  // Passwords Form
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [pwdMsg, setPwdMsg] = useState<string>('');
  const [pwdSuccess, setPwdSuccess] = useState<boolean>(false);
  const [isUpdatingPwd, setIsUpdatingPwd] = useState<boolean>(false);

  // Connection tenants
  const [tenants, setTenants] = useState<ConnectedTenant[]>([
    {
      id: 'tenant-aws-prod',
      name: 'AWS Backup Workspace',
      provider: 'AWS S3',
      status: 'VERIFIED',
      createdDate: '12 June 2026',
    },
    {
      id: 'tenant-gdrive-marketing',
      name: 'Marketing Drive',
      provider: 'Google Drive',
      status: 'VERIFIED',
      createdDate: '14 June 2026',
    },
    {
      id: 'tenant-azure-legacy',
      name: 'Azure Blob Sandbox',
      provider: 'Azure Storage',
      status: 'DISCONNECTED',
      createdDate: '18 June 2026',
    },
  ]);

  const handleUpdatePassword = (e: FormEvent) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdMsg('Please fill in all mandatory password fields.');
      return;
    }

    if (newPassword.length < 5) {
      setPwdMsg('New password should be at least 5 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdMsg('Passwords do not match. Please verify confirmed entry.');
      return;
    }

    setIsUpdatingPwd(true);
    setTimeout(() => {
      setIsUpdatingPwd(false);
      setPwdSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onUpdatePasswordSuccess) {
        onUpdatePasswordSuccess();
      }
    }, 1200);
  };

  const handleDisconnectTenant = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          return { ...t, status: t.status === 'DISCONNECTED' ? 'VERIFIED' : 'DISCONNECTED' };
        }
        return t;
      })
    );
  };

  const handleMockAction = (msg: string) => {
    alert(msg);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-theme-border pb-4">
        <h1 className="text-xl font-bold text-theme-text uppercase font-sans tracking-tight">
          Client Profile Settings
        </h1>
        <p className="text-xs text-neutral-400 mt-1 font-mono uppercase tracking-wide">
          Manage corporate credentials, user context and connected active cloud integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: User Information & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* User badge card */}
          <div className="rounded-sm border border-theme-border bg-theme-card p-5 shadow-xs text-center text-theme-text">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-theme-border bg-theme-bg text-2xl font-bold text-theme-text mb-3.5">
              {user.name.charAt(0)}
            </div>

            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-theme-text">
              {user.name}
            </h2>
            <p className="text-xs text-neutral-400 font-mono tracking-normal lowercase mt-0.5">
              {user.email}
            </p>

            <div className="mt-4 flex flex-col gap-2 border-t border-theme-border pt-3">
              <div className="flex items-center justify-between text-xs font-mono uppercase font-medium">
                <span className="text-slate-450">Current Role:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/10 px-2 py-0.5 rounded-sm border border-indigo-900/15">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono uppercase font-medium">
                <span className="text-slate-455 font-medium">Tenant Namespace:</span>
                <span className="font-bold text-theme-text">
                  {user.tenant}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono uppercase font-medium">
                <span className="text-slate-455 font-medium">System Joined:</span>
                <span className="text-theme-text font-bold">12 June 2026</span>
              </div>
            </div>
          </div>

          {/* Account Actions Card */}
          <div className="rounded-sm border border-theme-border bg-theme-card p-5 shadow-xs space-y-4 text-theme-text">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-theme-text">
              Operational Client Controls
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => handleMockAction('Initiating secure system configuration export... Archive downloaded as devsync-secrets-export.json')}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-sm border border-theme-border text-xs font-mono uppercase tracking-wide text-theme-text bg-theme-bg hover:bg-theme-border transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-slate-400" />
                  Export Account Data
                </span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </button>

              <button
                onClick={() => handleMockAction('Please confirm with your system administrator to completely remove your workstation authorization.')}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-sm border border-red-500/20 text-xs font-mono uppercase tracking-wide text-red-550 bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-red-400" />
                  Delete Client Account
                </span>
                <ExternalLink className="h-3 w-3 text-red-400" />
              </button>

              <div className="border-t border-theme-border pt-3">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-sm bg-theme-bg border border-theme-border text-xs font-mono font-bold uppercase tracking-wider text-theme-text hover:bg-theme-border transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect Client (Sign Out)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Active Cloud Tenants & Account Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 2: Connected cloud tenants */}
          <div className="rounded-sm border border-theme-border bg-theme-card p-5 shadow-xs space-y-4 text-theme-text">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-theme-text">
                Active Provider Tenants ({tenants.length})
              </h3>
              <button
                onClick={() => onNavigateToTab('requests')}
                className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-805 dark:text-indigo-400"
              >
                View Operations
              </button>
            </div>

            {tenants.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-theme-border rounded-sm bg-theme-bg space-y-3">
                <p className="text-xs uppercase font-mono text-slate-400">
                  No Connected cloud providers cataloged.
                </p>
                <button
                  onClick={() => onNavigateToTab('requests')}
                  className="inline-flex rounded-sm bg-indigo-600 text-white px-3.5 py-1.5 text-[10px] font-bold font-mono uppercase tracking-wider hover:bg-indigo-500"
                >
                  Create Your First Sync Request
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tenants.map((ten) => {
                  const verified = ten.status === 'VERIFIED';
                  const disconnected = ten.status === 'DISCONNECTED';

                  return (
                    <div
                      key={ten.id}
                      className="rounded-sm border border-theme-border p-4 bg-theme-bg flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-colors text-xs font-mono"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              verified ? 'bg-emerald-500 animate-pulse' :
                              disconnected ? 'bg-slate-400' : 'bg-red-500'
                            }`}
                          />
                          <h4 className="font-bold text-theme-text uppercase font-sans tracking-wide">
                            {ten.name}
                          </h4>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.3 rounded-sm ${
                            verified ? 'bg-emerald-50/10 text-emerald-450 border border-emerald-900/30' :
                            disconnected ? 'bg-theme-border text-slate-400' :
                            'bg-amber-500/10 text-amber-500'
                          }`}>
                            {ten.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 text-[10px] text-slate-400 mt-1 uppercase">
                          <span>Connector: <strong className="text-theme-text">{ten.provider}</strong></span>
                          <span>Registered: <strong className="text-theme-text">{ten.createdDate}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMockAction(`Displaying connection parameters for ${ten.name} security scopes.`)}
                          className="px-2.5 py-1 rounded bg-theme-border hover:bg-theme-border/70 text-[10px] font-bold uppercase text-theme-text cursor-pointer transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDisconnectTenant(ten.id)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                            disconnected
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20'
                          }`}
                        >
                          {disconnected ? 'Reconnect' : 'Disconnect'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Account Security (Change Password) */}
          <div className="rounded-sm border border-theme-border bg-theme-card p-5 shadow-xs space-y-4 text-theme-text">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-theme-text border-b border-theme-border pb-3 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-indigo-505" />
              Credentials & Cryptography Keys
            </h3>

            {pwdSuccess && (
              <div className="rounded-sm bg-emerald-50/10 p-3.5 text-xs font-mono uppercase tracking-wide text-emerald-400 border border-emerald-900/30">
                Security Password successfully changed! Workspace logs updated.
              </div>
            )}

            {pwdMsg && (
              <div className="rounded-sm bg-red-50/10 p-3.5 text-xs font-mono uppercase tracking-wide text-red-400 border border-red-900/30">
                {pwdMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs font-mono uppercase">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="******"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 w-full rounded-sm border border-theme-border bg-theme-bg px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-650 focus:outline-none text-theme-text"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="******"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 w-full rounded-sm border border-theme-border bg-theme-bg px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-655 focus:outline-none text-theme-text"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="******"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 w-full rounded-sm border border-theme-border bg-theme-bg px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-655 focus:outline-none text-theme-text"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isUpdatingPwd}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-indigo-600 hover:bg-indigo-550 text-white px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider shadow-xs cursor-pointer"
                >
                  {isUpdatingPwd ? 'Verifying...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

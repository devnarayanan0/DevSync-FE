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
      <div className="border-b border-slate-100 pb-4 dark:border-slate-850">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 uppercase font-sans tracking-tight">
          Client Profile Settings
        </h1>
        <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 font-mono uppercase tracking-wide">
          Manage corporate credentials, user context and connected active cloud integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: User Information & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* User badge card */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-2xl font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-205 mb-3.5">
              {user.name.charAt(0)}
            </div>

            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100">
              {user.name}
            </h2>
            <p className="text-xs text-slate-400 font-mono tracking-normal lowercase mt-0.5">
              {user.email}
            </p>

            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-850">
              <div className="flex items-center justify-between text-xs font-mono uppercase">
                <span className="text-slate-400">Current Role:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-sm">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono uppercase">
                <span className="text-slate-400">Tenant Namespace:</span>
                <span className="font-bold text-slate-705 dark:text-slate-350">
                  {user.tenant}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono uppercase">
                <span className="text-slate-400">System Joined:</span>
                <span className="text-slate-500 font-bold">12 June 2026</span>
              </div>
            </div>
          </div>

          {/* Account Actions Card */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Operational Client Controls
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => handleMockAction('Initiating secure system configuration export... Archive downloaded as devsync-secrets-export.json')}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-sm border border-slate-205 text-xs font-mono uppercase tracking-wide text-slate-700 bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:bg-slate-900 dark:hover:bg-slate-850 hover:bg-slate-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-slate-400" />
                  Export Account Data
                </span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </button>

              <button
                onClick={() => handleMockAction('Please confirm with your system administrator to completely remove your workstation authorization.')}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-sm border border-red-200 text-xs font-mono uppercase tracking-wide text-red-650 bg-red-50/20 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-955 hover:bg-red-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Client Account
                </span>
              </button>

              <div className="border-t border-slate-100 pt-3 dark:border-slate-850">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-sm bg-slate-800 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
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
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-850">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Active Provider Tenants ({tenants.length})
              </h3>
              <button
                onClick={() => onNavigateToTab('requests')}
                className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View Operations
              </button>
            </div>

            {tenants.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-sm bg-slate-50 dark:border-slate-800 dark:bg-slate-950 space-y-3">
                <p className="text-xs uppercase font-mono text-slate-450 dark:text-slate-500">
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
                      className="rounded-sm border border-slate-150 p-4 bg-slate-50/50 dark:border-slate-850 dark:bg-slate-900/20 flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-colors text-xs font-mono"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              verified ? 'bg-emerald-500 animate-pulse' :
                              disconnected ? 'bg-slate-400' : 'bg-red-500'
                            }`}
                          />
                          <h4 className="font-bold text-slate-800 dark:text-slate-102 uppercase font-sans tracking-wide">
                            {ten.name}
                          </h4>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.3 rounded-sm ${
                            verified ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450' :
                            disconnected ? 'bg-slate-200/50 text-slate-500 dark:bg-slate-800 dark:text-slate-400' :
                            'bg-amber-55 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                          }`}>
                            {ten.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 text-[10px] text-slate-450 mt-1 uppercase">
                          <span>Connector: <strong className="text-slate-650 dark:text-slate-350">{ten.provider}</strong></span>
                          <span>Registered: <strong className="text-slate-650 dark:text-slate-350">{ten.createdDate}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMockAction(`Displaying connection parameters for ${ten.name} security scopes.`)}
                          className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-250 text-[10px] font-bold uppercase dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDisconnectTenant(ten.id)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                            disconnected
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400'
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
          <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/40 shadow-xs space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 border-b border-slate-100 pb-3 dark:border-slate-850 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-indigo-500" />
              Credentials & Cryptography Keys
            </h3>

            {pwdSuccess && (
              <div className="rounded-sm bg-emerald-50 p-3.5 text-xs font-mono uppercase tracking-wide text-emerald-800 border border-emerald-250 dark:bg-emerald-950/25 dark:text-emerald-400 dark:border-emerald-900">
                Security Password successfully changed! Workspace logs updated.
              </div>
            )}

            {pwdMsg && (
              <div className="rounded-sm bg-red-50 p-3.5 text-xs font-mono uppercase tracking-wide text-red-650 border border-red-250 dark:bg-red-950/25 dark:text-red-400 dark:border-red-900">
                {pwdMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs font-mono uppercase">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="******"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="******"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="******"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isUpdatingPwd}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-indigo-600 hover:bg-indigo-550 text-white px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider shadow-xs"
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

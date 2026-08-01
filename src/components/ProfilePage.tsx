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
  const [tenants, setTenants] = useState<ConnectedTenant[]>(() => {
    const map = new Map<string, ConnectedTenant>();
    syncRequests.forEach((req, idx) => {
      if (!map.has(req.provider)) {
        map.set(req.provider, {
          id: `tenant-${req.provider}-${idx}`,
          name: `${req.provider.replace('-', ' ').toUpperCase()} WORKSPACE`,
          provider: req.provider.replace('-', ' ').toUpperCase(),
          status: req.status === 'failed' ? 'DISCONNECTED' : 'VERIFIED',
          createdDate: '12 July 2026',
        });
      }
    });
    return Array.from(map.values());
  });

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

  const handleSystemAction = (msg: string) => {
    alert(msg);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-theme-border pb-4">
        <h1 className="page-title-heading">
          User Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: User Information & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* User badge card */}
          <div className="rounded-lg border border-theme-border bg-theme-card p-5 shadow-md text-center text-theme-text space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-theme-border bg-indigo-600 text-2xl font-extrabold text-white mb-2 shadow-sm">
              {user.name.charAt(0)}
            </div>

            <div>
              <h2 className="text-base font-extrabold text-black dark:text-white font-sans uppercase">
                {user.name}
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold font-mono lowercase mt-0.5">
                {user.email}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2.5 border-t border-theme-border pt-3.5">
              <div className="flex items-center justify-between text-xs font-sans font-bold uppercase">
                <span className="text-slate-700 dark:text-slate-300">Current Role:</span>
                <span className="font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  User
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-sans font-bold uppercase">
                <span className="text-slate-700 dark:text-slate-300">Tenant Namespace:</span>
                <span className="font-extrabold text-black dark:text-white font-mono">
                  {user.tenant || 'Local'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-sans font-bold uppercase">
                <span className="text-slate-700 dark:text-slate-300">System Joined:</span>
                <span className="text-black dark:text-white font-mono font-extrabold">12 July 2026</span>
              </div>
            </div>
          </div>

          {/* Account Actions Card */}
          <div className="rounded-lg border border-theme-border bg-theme-card p-5 shadow-md space-y-4 text-theme-text">
            <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-black dark:text-white border-b border-theme-border pb-2.5">
              Account Controls
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => handleSystemAction('Initiating secure system configuration export... Archive downloaded as devsync-secrets-export.json')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-theme-border text-xs font-sans font-bold uppercase text-black dark:text-white bg-theme-bg/60 hover:bg-theme-card transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-slate-500" />
                  Export Data
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => handleSystemAction('Please confirm with your system administrator to completely remove your workstation authorization.')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-red-500/30 text-xs font-sans font-bold uppercase text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-red-500" />
                  Delete Account
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-red-500" />
              </button>

              <div className="border-t border-theme-border pt-3">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4 stroke-[2.5]" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Active Cloud Tenants & Account Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 2: Connected cloud tenants */}
          <div className="rounded-lg border border-theme-border bg-theme-card p-5 shadow-md space-y-4 text-theme-text">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-black dark:text-white">
                Active Provider Tenants ({tenants.length})
              </h3>
              <button
                onClick={() => onNavigateToTab('requests')}
                className="text-xs font-sans font-extrabold uppercase tracking-wider text-lime-600 hover:text-lime-700 dark:text-lime-400 cursor-pointer"
              >
                View Operations
              </button>
            </div>

            {tenants.length === 0 ? (
              <div className="p-8 text-center border border-theme-border rounded-xl bg-theme-bg/50 space-y-3">
                <p className="text-xs uppercase font-sans font-bold text-slate-800 dark:text-slate-200">
                  No Connected cloud providers cataloged.
                </p>
                <button
                  onClick={() => onNavigateToTab('requests')}
                  className="inline-flex rounded-xl bg-lime-500 text-black px-4 py-2 text-xs font-extrabold font-sans uppercase tracking-wider hover:bg-lime-400 shadow-sm cursor-pointer"
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
                      className="rounded-xl border border-theme-border p-4 bg-theme-bg/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-colors text-xs font-mono"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              verified ? 'bg-emerald-500 animate-pulse' :
                              disconnected ? 'bg-slate-400' : 'bg-red-500'
                            }`}
                          />
                          <h4 className="font-bold text-black dark:text-white uppercase font-sans tracking-wide">
                            {ten.name}
                          </h4>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            verified ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                            disconnected ? 'bg-theme-border text-slate-700 dark:text-slate-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-955/40 dark:text-amber-300'
                          }`}>
                            {ten.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 text-[10px] text-slate-700 dark:text-slate-300 font-semibold mt-1 uppercase">
                          <span>Connector: <strong className="text-black dark:text-white font-bold">{ten.provider}</strong></span>
                          <span>Registered: <strong className="text-black dark:text-white font-bold">{ten.createdDate}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSystemAction(`Displaying connection parameters for ${ten.name} security scopes.`)}
                          className="px-3 py-1.5 rounded-lg bg-theme-border hover:bg-theme-border/70 text-xs font-bold uppercase text-black dark:text-white cursor-pointer transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDisconnectTenant(ten.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                            disconnected
                              ? 'bg-lime-500 hover:bg-lime-400 text-black font-extrabold'
                              : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20'
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
          <div className="rounded-lg border border-theme-border bg-theme-card p-5 shadow-md space-y-4 text-theme-text">
            <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-black dark:text-white border-b border-theme-border pb-3 flex items-center gap-2">
              <Lock className="h-4.5 w-4.5 text-lime-600 dark:text-lime-400" />
              Credentials & Cryptography Keys
            </h3>

            {pwdSuccess && (
              <div className="rounded-xl bg-emerald-100 dark:bg-emerald-950/40 p-3.5 text-xs font-sans font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Security Password successfully changed! Workspace logs updated.
              </div>
            )}

            {pwdMsg && (
              <div className="rounded-xl bg-red-100 dark:bg-red-950/40 p-3.5 text-xs font-sans font-bold uppercase tracking-wide text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                {pwdMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs font-sans uppercase">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-sans font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="******"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 w-full rounded-lg border border-theme-border bg-theme-bg/60 px-3 text-xs font-sans font-semibold transition-colors focus:border-lime-500 focus:outline-none text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="******"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 w-full rounded-lg border border-theme-border bg-theme-bg/60 px-3 text-xs font-sans font-semibold transition-colors focus:border-lime-500 focus:outline-none text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="******"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 w-full rounded-lg border border-theme-border bg-theme-bg/60 px-3 text-xs font-sans font-semibold transition-colors focus:border-lime-500 focus:outline-none text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isUpdatingPwd}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-black px-6 py-2.5 text-xs font-sans font-extrabold uppercase tracking-wider shadow-md cursor-pointer transition-all"
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

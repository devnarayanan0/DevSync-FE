import { useState } from 'react';
import {
  FolderSync,
  Cloud,
  Check,
  Server,
  CloudLightning,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  FolderOpen,
  Info,
  Laptop,
  CheckCircle2,
  Database,
  ArrowLeft,
  Loader2,
  Sun,
  Moon,
} from 'lucide-react';
import { SyncRequest, Theme } from '../types';

interface FirstSyncWizardProps {
  theme: Theme;
  onThemeToggle: () => void;
  onWizardComplete: (newRequest: SyncRequest) => void;
  userEmail?: string;
}

export default function FirstSyncWizard({
  theme,
  onThemeToggle,
  onWizardComplete,
  userEmail = 'alex.mercer@devsync.io',
}: FirstSyncWizardProps) {
  const [step, setStep] = useState<number>(1);

  // Form states
  const [requestName, setRequestName] = useState<string>('');
  const [provider, setProvider] = useState<'aws-s3' | 'google-drive'>('aws-s3');

  // AWS step
  const [awsAccessKey, setAwsAccessKey] = useState<string>('');
  const [awsSecretKey, setAwsSecretKey] = useState<string>('');
  const [awsRegion, setAwsRegion] = useState<string>('us-east-1');
  const [isAwsVerifying, setIsAwsVerifying] = useState<boolean>(false);
  const [isAwsVerified, setIsAwsVerified] = useState<boolean>(false);

  // GDrive step
  const [isGoogleOAuthRunning, setIsGoogleOAuthRunning] = useState<boolean>(false);
  const [isGoogleVerified, setIsGoogleVerified] = useState<boolean>(false);
  const [googleEmail, setGoogleEmail] = useState<string>('');

  // Remote path step
  const [remotePath, setRemotePath] = useState<string>('');

  // Local path step
  const [localPath, setLocalPath] = useState<string>('/Users/developer/sync-vault');
  const [isScanningFolder, setIsScanningFolder] = useState<boolean>(false);
  const [selectedFolderFiles, setSelectedFolderFiles] = useState<number>(0);

  const [wizardErrorMsg, setWizardErrorMsg] = useState<string>('');

  // Mock auto verification behavior
  const handleVerifyAWS = () => {
    if (!awsAccessKey || !awsSecretKey || !awsRegion) {
      setWizardErrorMsg('Please fill out all AWS configuration params.');
      return;
    }
    setWizardErrorMsg('');
    setIsAwsVerifying(true);
    setTimeout(() => {
      setIsAwsVerifying(false);
      setIsAwsVerified(true);
    }, 1500);
  };

  const handleGoogleOAuth = () => {
    setIsGoogleOAuthRunning(true);
    setWizardErrorMsg('');
    setTimeout(() => {
      setIsGoogleOAuthRunning(false);
      setIsGoogleVerified(true);
      setGoogleEmail(userEmail || 'alex.mercer@gmail.com');
    }, 1505);
  };

  const handleStepSubmit = () => {
    setWizardErrorMsg('');

    if (step === 1) {
      if (!requestName.trim()) {
        setWizardErrorMsg('Sync Request name is required.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (provider === 'aws-s3') {
        if (!isAwsVerified) {
          setWizardErrorMsg('Verify your connection before continuing.');
          return;
        }
        // Prefill default bucket
        setRemotePath('s3://production-workspace-vault-us-east-1/');
      } else {
        if (!isGoogleVerified) {
          setWizardErrorMsg('Authenticate your Google Drive account before continuing.');
          return;
        }
        // Prefill default folder
        setRemotePath('gdrive://my-drive/work-sync-directory/');
      }
      setStep(4);
    } else if (step === 4) {
      if (!remotePath) {
        setWizardErrorMsg('Remote destination is required.');
        return;
      }
      setStep(5);
    } else if (step === 5) {
      if (!localPath.trim()) {
        setWizardErrorMsg('Local foldering source path is required.');
        return;
      }
      setStep(6);
    }
  };

  // Triggering native-like mock browses
  const handleMockBrowseFolder = () => {
    setIsScanningFolder(true);
    setTimeout(() => {
      setIsScanningFolder(false);
      const preList = [
        '/Users/developer/DevSyncWorkplace/source-files',
        '/Users/developer/AWS_Cloudbackup_Node/images',
        '/Users/developer/brand- vault-marketing',
        '/Users/developer/workspace/devsync/finance-metrics'
      ];
      const randomPath = preList[Math.floor(Math.random() * preList.length)];
      setLocalPath(randomPath);
      setSelectedFolderFiles(Math.floor(Math.random() * 85) + 12);
    }, 800);
  };

  const handleFinalCreate = () => {
    const newId = `${provider}-${Date.now()}`;
    const newReq: SyncRequest = {
      id: newId,
      name: requestName,
      provider: provider,
      status: 'idle',
      localPath: localPath,
      remoteFolder: remotePath,
      lastSync: 'Never Executed',
      schedule: 'Every 1 Hour',
    };
    onWizardComplete(newReq);
  };

  return (
    <div className="relative flex min-h-screen w-screen flex-col bg-slate-50 text-slate-800 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Wizard Branding Header bar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-indigo-600 text-white shadow-xs">
            <svg
              className="h-4 w-4 animate-spin-slow text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
            </svg>
          </div>
          <span className="text-sm font-bold font-mono tracking-widest text-slate-900 dark:text-slate-50 uppercase">
            DevSync Client
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-sm border border-slate-200 dark:border-slate-800">
            Provision Mode: Initial Daemon Setup
          </span>
          <button
            onClick={onThemeToggle}
            className="rounded-sm p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-550" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main setup screen viewport */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-2xl bg-white rounded-sm border border-slate-200 shadow-md dark:bg-slate-900 dark:border-slate-850 overflow-hidden">
          {/* Top Wizard Track progress indicator bar */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest font-extrabold text-indigo-600 dark:text-indigo-400">
              CREATE YOUR FIRST SYNC REQUEST
            </span>
            <div className="flex items-center space-x-2 font-mono text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              <span>Step {step} of 6</span>
              <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${(step / 6) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-8">
            {wizardErrorMsg && (
              <div className="mb-6 rounded-sm bg-red-50 p-3.5 text-xs font-mono uppercase tracking-wide text-red-650 border border-red-200/60 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50">
                {wizardErrorMsg}
              </div>
            )}

            {/* STEP 1: Sync Request Name */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase font-mono">
                    Step 1: Assign Request Identity
                  </h3>
                  <p className="text-[11px] text-slate-450 dark:text-slate-400 uppercase mt-0.5 font-mono">
                    Identify your directories using client-specific sync tags.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Sync Request Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. CLIENT DOCUMENTS, AWS BACKUP"
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    className="h-11 w-full rounded-sm border border-slate-200 bg-slate-50 px-3.5 text-xs font-mono uppercase tracking-wider transition-colors placeholder:text-slate-350 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-600 dark:focus:border-indigo-500 text-slate-800 dark:text-slate-250"
                  />
                  <div className="mt-2 text-[10px] font-mono text-slate-400 uppercase tracking-wide space-y-1">
                    <span>Example configurations:</span>
                    <div className="flex gap-2.5 pt-1">
                      <button
                        onClick={() => setRequestName('Marketing Materials')}
                        className="rounded-sm bg-slate-100 dark:bg-slate-800 px-2.5 py-1 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500"
                      >
                        Marketing Files
                      </button>
                      <button
                        onClick={() => setRequestName('S3 Secure Vault')}
                        className="rounded-sm bg-slate-100 dark:bg-slate-800 px-2.5 py-1 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500"
                      >
                        Client Documents
                      </button>
                      <button
                        onClick={() => setRequestName('Production Replica')}
                        className="rounded-sm bg-slate-100 dark:bg-slate-800 px-2.5 py-1 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500"
                      >
                        AWS Backup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Select Provider */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase font-mono">
                    Step 2: Select Target Provider
                  </h3>
                  <p className="text-[11px] text-slate-450 dark:text-slate-400 uppercase mt-0.5 font-mono">
                    Pick from available cloud infrastructure integration wrappers.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* AWS S3 wrapper card */}
                  <div
                    onClick={() => setProvider('aws-s3')}
                    className={`rounded-sm border p-4.5 cursor-pointer transition-all flex flex-col justify-between h-42 bg-slate-50/50 hover:bg-white dark:bg-slate-900/30 dark:hover:bg-slate-900/60 ${
                      provider === 'aws-s3'
                        ? 'border-indigo-600 ring-1 ring-indigo-500 bg-white dark:border-indigo-500 dark:bg-slate-900'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex align-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-amber-500/10 text-amber-500 font-bold font-mono">
                        S3
                      </div>
                      {provider === 'aws-s3' && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                        AWS S3 Storage
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase leading-relaxed font-mono">
                        Secure high-performance sync to simple storage endpoints.
                      </p>
                    </div>
                  </div>

                  {/* Google Drive card */}
                  <div
                    onClick={() => setProvider('google-drive')}
                    className={`rounded-sm border p-4.5 cursor-pointer transition-all flex flex-col justify-between h-42 bg-slate-50/50 hover:bg-white dark:bg-slate-900/30 dark:hover:bg-slate-900/60 ${
                      provider === 'google-drive'
                        ? 'border-indigo-600 ring-1 ring-indigo-500 bg-white dark:border-indigo-500 dark:bg-slate-900'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex align-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-sky-500/10 text-sky-500 font-bold font-mono">
                        GD
                      </div>
                      {provider === 'google-drive' && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                        Google Drive
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase leading-relaxed font-mono">
                        Corporate workspaces & enterprise remote share drive sync.
                      </p>
                    </div>
                  </div>
                </div>

                {/* DISABLED PROVIDERS */}
                <div className="mt-4 pt-4 border-t border-slate-150 dark:border-slate-850">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Unsupported Providers
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-sm border border-slate-200/40 p-4 bg-slate-100/30 dark:border-slate-850 dark:bg-slate-950/20 opacity-40 select-none cursor-not-allowed">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                        Azure (Coming Soon)
                      </span>
                      <p className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">
                        Microsoft cloud blob storage connector.
                      </p>
                    </div>
                    <div className="rounded-sm border border-slate-200/40 p-4 bg-slate-100/30 dark:border-slate-850 dark:bg-slate-950/20 opacity-40 select-none cursor-not-allowed">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                        Dropbox (Coming Soon)
                      </span>
                      <p className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">
                        Classic folder synchronizations API.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3A: AWS Credentials */}
            {step === 3 && provider === 'aws-s3' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase font-mono">
                    Step 3: AWS Client Settings
                  </h3>
                  <p className="text-[11px] text-slate-450 dark:text-slate-400 uppercase mt-0.5 font-mono">
                    Verify client keys securely for durable s3 storage authentication.
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-xs font-mono uppercase tracking-wide">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-1">
                      Access Key ID (Mandatory)
                    </label>
                    <input
                      type="text"
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      value={awsAccessKey}
                      onChange={(e) => setAwsAccessKey(e.target.value)}
                      className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-1">
                      Secret Access Key (Mandatory)
                    </label>
                    <input
                      type="password"
                      placeholder="****************************************"
                      value={awsSecretKey}
                      onChange={(e) => setAwsSecretKey(e.target.value)}
                      className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-1">
                      AWS Default Region
                    </label>
                    <select
                      value={awsRegion}
                      onChange={(e) => setAwsRegion(e.target.value)}
                      className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250"
                    >
                      <option value="us-east-1">us-east-1 (N. Virginia)</option>
                      <option value="us-west-2">us-west-2 (Oregon)</option>
                      <option value="eu-west-1">eu-west-1 (Ireland)</option>
                      <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                      <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleVerifyAWS}
                      disabled={isAwsVerifying}
                      className="flex h-10 w-full items-center justify-center rounded-sm bg-slate-100 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
                    >
                      {isAwsVerifying ? (
                        <span className="flex items-center gap-1.5 uppercase font-mono text-[11px]">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Testing Host Connection...
                        </span>
                      ) : isAwsVerified ? (
                        <span className="flex items-center gap-1.5 uppercase text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                          <CheckCircle2 className="h-4 w-4" />
                          Authentication Tested — OK
                        </span>
                      ) : (
                        <span>Verify Client keys</span>
                      )}
                    </button>
                  </div>

                  {isAwsVerified && (
                    <div className="mt-3 bg-slate-100/50 p-4.5 rounded-sm border border-slate-250 dark:bg-slate-900/60 dark:border-slate-850 space-y-2">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-405">AWS Account ID:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">1234-5678-9012</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-405">IAM User:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold text-sky-600 dark:text-indigo-400">devsync-client-user</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-405">Available S3 Buckets:</span>
                        <span className="text-slate-550 dark:text-slate-350">company-archives-bucket, production-asset-backup-vault</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3B: GDrive OAuth */}
            {step === 3 && provider === 'google-drive' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase font-mono">
                    Step 3: Google Workspace Connection
                  </h3>
                  <p className="text-[11px] text-slate-450 dark:text-slate-400 uppercase mt-0.5 font-mono">
                    Authorize corporate credentials using Google Drive secure token workflows.
                  </p>
                </div>

                <div className="pt-4 space-y-4 text-center">
                  {!isGoogleVerified ? (
                    <div className="p-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-sm bg-slate-50/50 dark:bg-slate-900/10 space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-indigo-50 text-indigo-700 dark:bg-slate-900 dark:text-indigo-300 mx-auto">
                        <Cloud className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-805">
                          Launch Token Authentication UI
                        </h4>
                        <p className="text-[10px] text-slate-400 uppercase font-mono max-w-sm mx-auto mt-1 leading-relaxed">
                          This initiates standard browser OAuth flows. Accept permission checks to register corporate directory scopes.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleOAuth}
                        disabled={isGoogleOAuthRunning}
                        className="inline-flex items-center gap-1.5 rounded-sm bg-indigo-600 px-4.5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-indigo-550 shadow-xs"
                      >
                        {isGoogleOAuthRunning ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            OAuth Authorizing...
                          </>
                        ) : (
                          <span>Continue with Google</span>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/80 p-6 rounded-sm text-center space-y-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 mx-auto">
                        <Check className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-450 block">
                          Verified GDrive Token
                        </span>
                        <p className="text-[11px] font-mono text-slate-700 dark:text-slate-300 mt-1 uppercase text-ellipsis overflow-hidden">
                          Connected: {googleEmail}
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-sm w-fit mx-auto">
                        <span className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" />
                        Status: ACTIVE
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Remote Destination */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase font-mono">
                    Step 4: Select Cloud Target Directory
                  </h3>
                  <p className="text-[11px] text-slate-450 dark:text-slate-400 uppercase mt-0.5 font-mono">
                    Allocate remote folders or bucket scopes inside your provisioned infrastructure.
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-xs font-mono uppercase tracking-wide">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-1">
                    {provider === 'aws-s3' ? 'Select S3 Bucket Target' : 'Select Google Drive Host Folder'}
                  </label>

                  {provider === 'aws-s3' ? (
                    <select
                      value={remotePath}
                      onChange={(e) => setRemotePath(e.target.value)}
                      className="h-11 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250"
                    >
                      <option value="">-- Choose S3 Backup Destination Bucket --</option>
                      <option value="s3://production-workspace-vault-us-east-1/">s3://production-workspace-vault-us-east-1 (Active)</option>
                      <option value="s3://archives-static-assets-vault/">s3://archives-static-assets-vault/</option>
                      <option value="s3://marketing-shared-deliverys3/">s3://marketing-shared-deliverys3/</option>
                    </select>
                  ) : (
                    <select
                      value={remotePath}
                      onChange={(e) => setRemotePath(e.target.value)}
                      className="h-11 w-full rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono uppercase tracking-wide transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250"
                    >
                      <option value="">-- Choose Target Folders on Drive --</option>
                      <option value="gdrive://my-drive/work-sync-directory/">gdrive://my-drive/work-sync-directory/</option>
                      <option value="gdrive://shared-drives/brand-vault-archive/">gdrive://shared-drives/brand-vault-archive/</option>
                      <option value="gdrive://my-drive/temporary-replication-folder/">gdrive://my-drive/temporary-replication-folder/</option>
                    </select>
                  )}

                  <div className="flex items-center space-x-2 rounded-sm bg-slate-50 p-3 text-[10px] font-mono text-slate-500 border border-slate-150 dark:bg-slate-950/20 dark:border-slate-800 uppercase tracking-widest">
                    <Info className="h-4 w-4 text-indigo-505 shrink-0" />
                    <span>Selected directories will contain direct replica index logs for transaction verification.</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Local Folder Selection */}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase font-mono">
                    Step 5: Pick Workspace Source Folder
                  </h3>
                  <p className="text-[11px] text-slate-450 dark:text-slate-400 uppercase mt-0.5 font-mono">
                    Set up your localized filesystem directories for sync scanning tasks.
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-xs font-mono uppercase">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-1">
                      Local Folder Path
                    </label>
                    <div className="flex space-x-2.5">
                      <input
                        type="text"
                        required
                        value={localPath}
                        onChange={(e) => setLocalPath(e.target.value)}
                        className="h-11 flex-1 rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs font-mono transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250"
                      />
                      <button
                        type="button"
                        onClick={handleMockBrowseFolder}
                        disabled={isScanningFolder}
                        className="h-11 px-4 rounded-sm border border-slate-200 bg-slate-100 hover:bg-slate-150 text-xs font-mono font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 flex items-center gap-1.5"
                      >
                        {isScanningFolder ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FolderOpen className="h-4 w-4" />
                        )}
                        <span>Browse</span>
                      </button>
                    </div>
                  </div>

                  {selectedFolderFiles > 0 && (
                    <div className="rounded-sm bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/30 p-3.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                          Workspace Cataloged Successfully
                        </span>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/40 text-emerald-850 dark:text-emerald-350 px-2 py-0.5 rounded-sm">
                        {selectedFolderFiles} files indexes found
                      </span>
                    </div>
                  )}

                  <div className="rounded-sm border border-slate-100 bg-slate-50 p-4.5 dark:border-slate-850 dark:bg-slate-900/20 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      Local System File Scanner
                    </span>
                    <p className="text-[10px] text-slate-450 uppercase leading-relaxed font-mono">
                      Selecting directories registers direct file watchers. This detects additions, moves, or edits instantly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Review Summary */}
            {step === 6 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase font-mono">
                    Step 6: Review Config Schema
                  </h3>
                  <p className="text-[11px] text-slate-450 dark:text-slate-400 uppercase mt-0.5 font-mono">
                    Inspect your Synchronization settings prior to operational deployment.
                  </p>
                </div>

                <div className="rounded-sm border border-slate-200 bg-slate-100/30 dark:border-slate-800 dark:bg-slate-950/40 p-5 space-y-4 text-xs font-mono uppercase tracking-wide">
                  <div className="grid grid-cols-3 border-b border-slate-150 pb-2.5 dark:border-slate-850">
                    <span className="text-slate-450">Sync Name:</span>
                    <span className="col-span-2 font-bold text-slate-805 dark:text-slate-100">{requestName}</span>
                  </div>

                  <div className="grid grid-cols-3 border-b border-slate-150 pb-2.5 dark:border-slate-850">
                    <span className="text-slate-450">Integration Node:</span>
                    <span className="col-span-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {provider === 'aws-s3' ? 'AWS S3 Container' : 'Google Shared Drive'}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 border-b border-slate-150 pb-2.5 dark:border-slate-850">
                    <span className="text-slate-450">Remote Target:</span>
                    <span className="col-span-2 font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all">{remotePath}</span>
                  </div>

                  <div className="grid grid-cols-3 border-b border-slate-150 pb-2.5 dark:border-slate-850">
                    <span className="text-slate-450">Local Directory Source:</span>
                    <span className="col-span-2 font-mono text-[10px] text-slate-705 dark:text-slate-350 break-all">{localPath}</span>
                  </div>

                  <div className="grid grid-cols-3">
                    <span className="text-slate-450">Initial Sync Status:</span>
                    <span className="col-span-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-450 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ACTIVE
                      </span>
                    </span>
                  </div>
                </div>

                <div className="rounded-sm bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/20 p-4.5 text-[10px] font-mono uppercase tracking-wider text-indigo-650 dark:text-indigo-400">
                  <div className="flex gap-2">
                    <Database className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span>Creating the sync request will register the cloud folder mapping with default automated sync intervals.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Card actions container */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 border-t border-slate-150 dark:border-slate-850 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setStep((prev) => prev - 1);
                  setWizardErrorMsg('');
                }}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-sm border border-slate-200 bg-white text-xs font-mono font-bold uppercase text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>
            ) : (
              <span />
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleStepSubmit}
                className="inline-flex items-center gap-1 bg-indigo-600 px-5 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-indigo-550 shadow-xs"
              >
                <span>Continue</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalCreate}
                className="inline-flex items-center gap-1 bg-indigo-600 px-6 py-2.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-indigo-550 shadow-xs"
                id="create-first-sync-request-btn"
              >
                <span>Create Sync Request</span>
                <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

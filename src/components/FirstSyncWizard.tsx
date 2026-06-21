import React, { useState } from 'react';
import {
  FolderSync,
  Cloud,
  Check,
  Server,
  CloudLightning,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  ArrowRight,
  FolderOpen,
  Info,
  CheckCircle2,
  Database,
  ArrowLeft,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Tv,
  X
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
  userEmail = 'alex.mercer@devsync.io'
}: FirstSyncWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [wizardErrorMsg, setWizardErrorMsg] = useState<string>('');

  // Form states
  // Step 1: Assign Request Identity
  const [requestName, setRequestName] = useState<string>('');

  // Step 2: Select Provider
  const [provider, setProvider] = useState<'aws-s3' | 'google-drive'>('google-drive');

  // Step 3: Local Folder Selection
  const [localPath, setLocalPath] = useState<string>('');
  const [osPickerOpen, setOsPickerOpen] = useState<'windows' | 'macos' | null>(null);

  // States inside mock OS Picker
  const [mockCurrentDir, setMockCurrentDir] = useState<string>('');
  const [osSearchQuery, setOsSearchQuery] = useState('');

  // Step 4: Provider Authentication Setup
  // AWS step
  const [awsAccessKey, setAwsAccessKey] = useState<string>('AKIAIOSFODNN7EXAMPLE');
  const [awsSecretKey, setAwsSecretKey] = useState<string>('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
  const [awsRegion, setAwsRegion] = useState<string>('us-east-1');
  const [isAwsVerifying, setIsAwsVerifying] = useState<boolean>(false);
  const [isAwsVerified, setIsAwsVerified] = useState<boolean>(false);

  // Google step
  const [isGoogleVerified, setIsGoogleVerified] = useState<boolean>(false);
  const [isGoogleOAuthRunning, setIsGoogleOAuthRunning] = useState<boolean>(false);

  // Step 5: Resource Selection Mapping
  const s3Buckets = [
    's3://production-workspace-vault-us-east-1',
    's3://archives-static-assets-vault',
    's3://marketing-shared-deliverys3'
  ];
  const [selectedS3Bucket, setSelectedS3Bucket] = useState(s3Buckets[0]);
  const [s3FolderPath, setS3FolderPath] = useState('backups/');

  const gDrives = ['My Drive', 'Shared Design Team Drive', 'Billing Archives', 'Corporate Assets Workspace'];
  const [selectedGDrive, setSelectedGDrive] = useState(gDrives[0]);

  const gFolders = ['/Root Folders', '/Archive Projects', '/Company Sync Root', '/Assets Hub', '/Deliverables/2026'];
  const [selectedGFolder, setSelectedGFolder] = useState(gFolders[0]);

  // Step 6: Choose Synchronize Schedule
  const [schedule, setSchedule] = useState<string>('Every 1 Hour');

  // OS Native selector simulated directory contents
  const windowsDirectories = [
    { name: 'D:\\Projects\\Marketing', label: 'Marketing' },
    { name: 'D:\\Projects\\Development\\DevSync', label: 'DevSync' },
    { name: 'C:\\Users\\Admin\\Desktop\\DevSync_Backup', label: 'DevSync_Backup' },
    { name: 'C:\\Users\\Admin\\Documents\\FinanceReports', label: 'FinanceReports' },
    { name: 'E:\\VideoAssets\\ClientDeliveries', label: 'ClientDeliveries' },
  ];

  const macDirectories = [
    { name: '/Users/dev/Documents/Projects', label: 'Projects' },
    { name: '/Users/dev/Downloads/Assets', label: 'Assets' },
    { name: '/Users/dev/Desktop/DesignSystem', label: 'DesignSystem' },
    { name: '/Users/dev/Workspace/EnterpriseBackup', label: 'EnterpriseBackup' },
    { name: '/Users/dev/Movies/RenderOutputs', label: 'RenderOutputs' },
  ];

  const handleGoogleOAuth = () => {
    setIsGoogleOAuthRunning(true);
    setTimeout(() => {
      setIsGoogleVerified(true);
      setIsGoogleOAuthRunning(false);
    }, 1200);
  };

  const handleVerifyAWS = () => {
    setIsAwsVerifying(true);
    setTimeout(() => {
      setIsAwsVerified(true);
      setIsAwsVerifying(false);
    }, 1205);
  };

  const canGoNext = () => {
    switch (step) {
      case 1:
        return requestName.trim().length > 0;
      case 2:
        return provider === 'aws-s3' || provider === 'google-drive';
      case 3:
        return !!localPath;
      case 4:
        if (provider === 'aws-s3') {
          return awsAccessKey.trim().length > 0 && awsSecretKey.trim().length > 0;
        } else {
          return isGoogleVerified;
        }
      case 5:
        if (provider === 'aws-s3') {
          return !!selectedS3Bucket;
        } else {
          return !!selectedGDrive;
        }
      case 6:
        return !!schedule;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canGoNext() && step < 7) {
      setStep(step + 1);
      setWizardErrorMsg('');
    } else if (!canGoNext()) {
      if (step === 1) setWizardErrorMsg('Please fill out the Sync Request Name to proceed.');
      if (step === 3) setWizardErrorMsg('You must select a local system directory folder before moving to credentials verification.');
      if (step === 4) setWizardErrorMsg('Kindly link or verify your cloud authentication details before resource selection.');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setWizardErrorMsg('');
    }
  };

  const handleFinalCreate = () => {
    const remoteDestinationPath = provider === 'aws-s3'
      ? `${selectedS3Bucket}/${s3FolderPath.replace(/^\//, '')}`
      : `gdrive://${selectedGDrive}${selectedGFolder}`;

    onWizardComplete({
      id: `req-${Date.now()}`,
      name: requestName,
      provider: provider,
      status: 'idle',
      localPath: localPath,
      remoteFolder: remoteDestinationPath,
      lastSync: 'Pending Init',
      schedule: schedule,
      description: `Connected ${provider === 'aws-s3' ? 'AWS S3 archive' : 'Google Drive Workspace'} replication root node`
    });
  };

  // Step information lookup for headers
  const getStepHeaderInfo = () => {
    switch (step) {
      case 1:
        return { percent: '14%', title: 'ASSIGN REQUEST IDENTITY', desc: 'Identify your directories using client-specific sync tags.' };
      case 2:
        return { percent: '29%', title: 'CLOUD STORAGE PROVIDER', desc: 'Pick from available cloud infrastructure integration wrappers.' };
      case 3:
        return { percent: '43%', title: 'LOCAL FOLDER SELECTION', desc: 'Set up your localized filesystem directories for sync scanning tasks.' };
      case 4:
        return { percent: '57%', title: 'AUTHENTICATION DETAIL', desc: 'Verify client keys securely for durable s3 storage or authorize Google Drive.' };
      case 5:
        return { percent: '71%', title: 'RESOURCE SELECTION', desc: 'Allocate remote folders or bucket scopes inside your provisioned infrastructure.' };
      case 6:
        return { percent: '86%', title: 'AUTOMATION FREQUENCY', desc: 'Select standard background interval period mapping details.' };
      default:
        return { percent: '100%', title: 'CONFIGURATION REVIEW', desc: 'Inspect your Synchronization settings prior to operational deployment.' };
    }
  };

  const stepInfo = getStepHeaderInfo();

  return (
    <div className="relative flex min-h-screen w-screen flex-col bg-theme-bg text-theme-text transition-colors duration-200 font-sans">
      
      {/* Top Wizard Branding Header bar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-theme-border bg-theme-card px-6">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <FolderSync className="h-4.5 w-4.5" />
          </div>
          <span className="text-sm font-bold tracking-wider text-theme-text uppercase">
            DevSync Initializer
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-theme-bg px-2.5 py-1 rounded-md border border-theme-border">
            Config Mode: Default Initial Setup
          </span>
          <button
            onClick={onThemeToggle}
            className="rounded-lg p-2 text-slate-500 hover:bg-theme-bg hover:text-theme-text transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main setup screen viewport */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xl overflow-hidden">
          
          {/* Top Wizard Track progress indicator bar */}
          <div className="bg-slate-50/50 dark:bg-neutral-900 px-7 py-5.5 border-b border-slate-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/45 text-indigo-650 dark:text-indigo-400 font-bold">
                  ⚡
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  CREATE YOUR FIRST SYNC REQUEST
                </span>
              </div>
              <div className="text-right font-mono text-[10px] uppercase font-bold text-slate-450 dark:text-slate-400">
                <span>{stepInfo.percent} Complete</span>
              </div>
            </div>

            {/* Segmented Progress Tracker */}
            <div className="h-1.5 w-full flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <div 
                  key={s} 
                  className={`h-full flex-1 transition-all duration-300 rounded-full ${
                    s <= step ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-100 dark:bg-neutral-800'
                  }`} 
                />
              ))}
            </div>
          </div>

          {/* Core Body Container */}
          <div className="p-8">
            {wizardErrorMsg && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-650 border border-red-250/20 dark:bg-red-950/15 dark:text-red-400 dark:border-red-900/40">
                ⚠️ {wizardErrorMsg}
              </div>
            )}

            {/* STEP 1: Sync Request Name */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                    Step 1: Assign Request Identity
                  </h3>
                  <p className="text-xs text-slate-405 dark:text-slate-400 mt-1 leading-normal">
                    {stepInfo.desc}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Sync Request Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. AWS PRODUCTION DEPLOY REPLICA"
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-55/10 px-4 text-xs font-semibold tracking-wider transition-colors placeholder:text-slate-350 focus:border-indigo-650 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-205"
                  />
                  <div className="mt-3.5 text-[10px] font-mono text-slate-405 uppercase tracking-wide space-y-1 select-none">
                    <span>Try starting with a template namespace name:</span>
                    <div className="flex gap-2.5 pt-1.5 flex-wrap">
                      <button
                        onClick={() => setRequestName('Marketing Resource Vault')}
                        className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500 cursor-pointer"
                      >
                        Marketing Files
                      </button>
                      <button
                        onClick={() => setRequestName('Production S3 Archive')}
                        className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500 cursor-pointer"
                      >
                        AWS Prod Backup
                      </button>
                      <button
                        onClick={() => setRequestName('Design System System Assets')}
                        className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500 cursor-pointer"
                      >
                        Design Assets
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Select Provider */}
            {step === 2 && (
              <div className="space-y-5.5">
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                    SELECT STORAGE TARGET PROVIDER
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-normal">
                    {stepInfo.desc}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-5 pt-1">
                  {/* AWS S3 wrapper card */}
                  <div
                    onClick={() => setProvider('aws-s3')}
                    className={`p-6 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center justify-center space-y-3.5 relative min-h-48 ${
                      provider === 'aws-s3'
                        ? 'border-2 border-indigo-600 dark:border-indigo-500 bg-white dark:bg-neutral-900/40 shadow-xs'
                        : 'border-slate-205 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-slate-350 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="h-14 w-20 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-neutral-800/50 shadow-sm p-2">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-end gap-1 select-none">
                          <span className="text-2xl font-black tracking-tighter text-slate-800 dark:text-white font-sans lowercase">aws</span>
                        </div>
                        <svg className="w-10 h-2 text-[#FF9900] -mt-1.5" viewBox="0 0 40 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 1.5 C10.5 5.5, 29.5 5.5, 37.5 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M34.5 1.5 L37.5 1.5 L36.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Amazon S3</h4>
                      <p className="text-[10px] text-zinc-450 dark:text-slate-400 mt-1 leading-normal">
                        Secure and scalable object storage in the AWS cloud.
                      </p>
                    </div>
                    {provider === 'aws-s3' && (
                      <div className="absolute top-3 right-3 h-5 w-5 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-xs">
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  {/* Google Drive card */}
                  <div
                    onClick={() => setProvider('google-drive')}
                    className={`p-6 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center justify-center space-y-3.5 relative min-h-48 ${
                      provider === 'google-drive'
                        ? 'border-2 border-indigo-600 dark:border-indigo-500 bg-white dark:bg-neutral-900/40 shadow-xs'
                        : 'border-slate-205 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-slate-350 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="h-14 w-20 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-neutral-800/50 shadow-sm p-1">
                      <svg className="w-10 h-9" viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M47.2 24h49.6l23.2 40H70.4L47.2 24z" fill="#FFC107"/>
                        <path d="M18 76l23.2-40 47.2 82-23.2 40L18 76z" fill="#2196F3"/>
                        <path d="M70.4 64h63l-23.2 40H47.2l23.2-40z" fill="#4CAF50"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Google Drive</h4>
                      <p className="text-[10px] text-zinc-455 dark:text-slate-400 mt-1 leading-normal">
                        Sync files with Google Drive or Shared Drives.
                      </p>
                    </div>
                    {provider === 'google-drive' && (
                      <div className="absolute top-3 right-3 h-5 w-5 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-xs">
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  {/* Azure Client - Disabled */}
                  <div className="p-6 rounded-xl border border-dashed border-slate-205 dark:border-neutral-800/80 bg-slate-50/40 dark:bg-neutral-950/10 opacity-55 flex flex-col items-center text-center justify-center space-y-3.5 cursor-not-allowed select-none min-h-48">
                    <div className="h-14 w-20 flex items-center justify-center rounded-lg bg-slate-50/50 dark:bg-neutral-800/20 p-2">
                      <svg className="w-9 h-9" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 95l43-80h24L45 95H21z" fill="#0078D4"/>
                        <path d="M88 15h24L72 95H48l40-80z" fill="#50E6FF" fillOpacity="0.8"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500">Microsoft Azure Blob</h4>
                      <p className="text-[10px] text-zinc-450 dark:text-slate-500 leading-normal mt-1">
                        Enterprise-ready cloud storage with Azure Blob.
                      </p>
                    </div>
                  </div>

                  {/* Dropbox - Disabled */}
                  <div className="p-6 rounded-xl border border-dashed border-slate-205 dark:border-neutral-800/80 bg-slate-50/40 dark:bg-neutral-950/10 opacity-55 flex flex-col items-center text-center justify-center space-y-3.5 cursor-not-allowed select-none min-h-48">
                    <div className="h-14 w-20 flex items-center justify-center rounded-lg bg-slate-50/50 dark:bg-neutral-800/20 p-2">
                      <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 2L1 5.5l5 3.5 5-3.5L6 2zM18 2l-5 3.5 5 3.5 5-3.5L18 2zM1 12.5l5 3.5 5-3.5-5-3.5-5 3.5zM13 12.5l5 3.5 5-3.5-5-3.5-5 3.5zM6 19.5l6 4 6-4v-2L12 21l-6-3.5v2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500">Dropbox</h4>
                      <p className="text-[10px] text-zinc-450 dark:text-slate-500 leading-normal mt-1">
                        Sync files and folders with your Dropbox account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Local Folder Selection */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                    Step 3: Pick local scanning folder
                  </h3>
                  <p className="text-xs text-slate-405 dark:text-slate-400 mt-1 leading-normal">
                    {stepInfo.desc}
                  </p>
                </div>

                <div className="bg-slate-50/50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-7 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="h-14 w-14 rounded-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/25 text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-neutral-800 shadow-xs animate-bounce">
                    <FolderOpen className="h-6.5 w-6.5" />
                  </div>

                  <div className="w-full max-w-md space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase block tracking-wide dark:text-slate-400">Watch local filesystem path</label>
                    <input
                      type="text"
                      readOnly
                      placeholder="e.g. D:\Projects\EnterpriseResourceVault"
                      value={localPath}
                      className="w-full text-center text-xs font-mono font-bold py-3 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 text-indigo-600 dark:text-indigo-400 rounded-xl cursor-not-allowed select-text outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOsPickerOpen('windows');
                        setMockCurrentDir(windowsDirectories[0].name);
                      }}
                      className="inline-flex items-center gap-2 px-4.5 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer transition-colors shadow-xs"
                    >
                      <Monitor className="h-4 w-4 text-blue-500" />
                      Browse Windows Folder
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOsPickerOpen('macos');
                        setMockCurrentDir(macDirectories[0].name);
                      }}
                      className="inline-flex items-center gap-2 px-4.5 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer transition-colors shadow-xs"
                    >
                      <Tv className="h-4 w-4 text-slate-500" />
                      Browse macOS Folder
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 rounded-xl bg-slate-50 p-4 text-[11px] text-slate-550 border border-slate-100 dark:bg-neutral-950/20 dark:border-neutral-800">
                  <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 select-none text-indigo-600 dark:text-indigo-400 font-bold">ℹ️</span>
                  <span>Selecting folders registers native operating system directory listeners for real-time state index scanning.</span>
                </div>
              </div>
            )}

            {/* STEP 4: Provider Authentication Setup */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                    Step 4: Secure Account handshake Protocol
                  </h3>
                  <p className="text-xs text-slate-405 dark:text-slate-400 mt-1 leading-normal">
                    {stepInfo.desc}
                  </p>
                </div>

                {provider === 'aws-s3' ? (
                  <div className="space-y-3.5 pt-2 text-xs uppercase tracking-wide">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                        AWS Access Key ID
                      </label>
                      <input
                        type="text"
                        placeholder="AKIAIOSFODNN7EXAMPLE"
                        value={awsAccessKey}
                        onChange={(e) => setAwsAccessKey(e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-mono transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                        AWS Secret Access Key
                      </label>
                      <input
                        type="password"
                        placeholder="****************************************"
                        value={awsSecretKey}
                        onChange={(e) => setAwsSecretKey(e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-mono transition-colors focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-250"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                        AWS Default Region
                      </label>
                      <select
                        value={awsRegion}
                        onChange={(e) => setAwsRegion(e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/55 px-3 text-xs font-mono transition-colors focus:border-indigo-650 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                      >
                        <option value="us-east-1">us-east-1 (N. Virginia)</option>
                        <option value="us-west-2">us-west-2 (Oregon)</option>
                        <option value="eu-west-1">eu-west-1 (Ireland)</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleVerifyAWS}
                        disabled={isAwsVerifying}
                        className="flex h-11 w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-bold uppercase text-slate-850 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 cursor-pointer"
                      >
                        {isAwsVerifying ? (
                          <span className="flex items-center gap-1.5 uppercase text-[11px]">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Verifying Host Connection Credentials...
                          </span>
                        ) : isAwsVerified ? (
                          <span className="flex items-center gap-1.5 uppercase text-emerald-600 dark:text-emerald-400 text-[11px]">
                            <CheckCircle2 className="h-4.5 w-4.5" />
                            AWS Credentials Verified — Server OK
                          </span>
                        ) : (
                          <span>Verify AWS Client Keys</span>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 space-y-4 text-center">
                    {!isGoogleVerified ? (
                      <div className="p-8 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 space-y-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50/50 text-indigo-600 dark:bg-slate-900 dark:text-indigo-300 mx-auto">
                          <Cloud className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
                            Launch Secure Google Drive OAuth Handshake
                          </h4>
                          <p className="text-[11px] text-slate-400 uppercase font-mono max-w-sm mx-auto mt-1 leading-relaxed">
                            This registers write limits configuration mapping for DevSync. Accept browser security permissions.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleGoogleOAuth}
                          disabled={isGoogleOAuthRunning}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white hover:bg-indigo-500 shadow-sm cursor-pointer"
                        >
                          {isGoogleOAuthRunning ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Negotiating Scope Authorization Token...
                            </>
                          ) : (
                            <span>Link Google Account</span>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-emerald-55/5 dark:bg-emerald-950/15 border border-emerald-200/80 p-6 rounded-2xl text-center space-y-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 mx-auto">
                          <Check className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-450 block">
                            Verified GDrive Handshake Scope Accepted
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 uppercase truncate font-semibold">
                            Connected Account Identity: {userEmail}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Resource Selection Mapping */}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                    Step 5: Cloud Resource target allocations
                  </h3>
                  <p className="text-xs text-slate-405 dark:text-slate-400 mt-1 leading-normal">
                    {stepInfo.desc}
                  </p>
                </div>

                <div className="space-y-3.5 pt-2 text-xs uppercase tracking-wide">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                    {provider === 'aws-s3' ? 'Select Destination Storage Bucket' : 'Select Google Shared Folders Directory'}
                  </label>

                  {provider === 'aws-s3' ? (
                    <div className="space-y-3.5">
                      <select
                        value={selectedS3Bucket}
                        onChange={(e) => setSelectedS3Bucket(e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 cursor-pointer outline-none font-semibold"
                      >
                        {s3Buckets.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">Bucket Subfolder (Optional)</label>
                        <input
                          type="text"
                          value={s3FolderPath}
                          onChange={(e) => setS3FolderPath(e.target.value)}
                          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-mono text-slate-805 dark:bg-neutral-950 dark:border-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">Authorized Drive</label>
                        <select
                          value={selectedGDrive}
                          onChange={(e) => setSelectedGDrive(e.target.value)}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 cursor-pointer outline-none font-semibold"
                        >
                          {gDrives.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">Sync Scope Folder</label>
                        <select
                          value={selectedGFolder}
                          onChange={(e) => setSelectedGFolder(e.target.value)}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 cursor-pointer outline-none font-semibold"
                        >
                          {gFolders.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 rounded-xl bg-slate-50 p-4 text-[10px] font-mono text-slate-500 border border-slate-150 dark:bg-neutral-950/20 dark:border-slate-800 tracking-wide uppercase leading-normal">
                    <Info className="h-4.5 w-4.5 text-indigo-505 shrink-0" />
                    <span>Transactions in the selected namespaces will utilize high-fidelity replication protocols.</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Automation Schedule Setup */}
            {step === 6 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                    Step 6: Register Synchronization Frequency schedule
                  </h3>
                  <p className="text-xs text-slate-405 dark:text-slate-400 mt-1 leading-normal">
                    {stepInfo.desc}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3.5 font-sans">
                  {[
                    { id: 'Manual Trigger Only', title: 'Manual Only', desc: 'No background automation. Trigger sync via dashboard buttons manually.' },
                    { id: 'Sync On Application Startup', title: 'On Startup', desc: 'Automatic files transmission whenever DevSync client daemon starts.' },
                    { id: 'Every 5 Minutes', title: 'Every 5 Minutes', desc: 'Rapid incremental syncing cycle loops. Ideal for active files modification.' },
                    { id: 'Every 15 Minutes', title: 'Every 15 Minutes', desc: 'Standard high-frequency automatic backups for design assets.' },
                    { id: 'Every 1 Hour', title: 'Every Hour', desc: 'Standard business synchronization intervals cycle.' },
                    { id: 'Daily at 02:00 AM', title: 'Daily backup', desc: 'Low overhead. Triggers daily tasks backups late night routinely.' }
                  ].map((opt) => {
                    const isSel = schedule === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSchedule(opt.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-3 text-left items-start ${
                          isSel
                            ? 'border-2 border-indigo-600 dark:border-indigo-500 bg-indigo-50/5 dark:bg-indigo-950/15'
                            : 'border-slate-205 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-slate-350 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="mt-0.5 flex justify-center items-center shrink-0">
                          <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                            isSel ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 dark:border-neutral-850'
                          }`}>
                            {isSel && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{opt.title}</span>
                          <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-normal">{opt.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 7: Review Summary */}
            {step === 7 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                    Step 7: Final Review Config Schema
                  </h3>
                  <p className="text-xs text-slate-405 dark:text-slate-400 mt-1 leading-normal">
                    {stepInfo.desc}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-150 bg-slate-100/30 dark:border-slate-805 dark:bg-slate-950/40 p-5.5 space-y-4 text-xs font-mono uppercase tracking-wide">
                  <div className="grid grid-cols-3 border-b border-slate-150 pb-2.5 dark:border-slate-850">
                    <span className="text-slate-450 font-bold text-[10px]">Sync Name:</span>
                    <span className="col-span-2 font-extrabold text-slate-805 dark:text-slate-100">{requestName}</span>
                  </div>

                  <div className="grid grid-cols-3 border-b border-slate-150 pb-2.5 dark:border-slate-850">
                    <span className="text-slate-450 font-bold text-[10px]">Integration Node:</span>
                    <span className="col-span-2">
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase">
                        {provider === 'aws-s3' ? 'AWS S3 Container' : 'Google Shared Drive'}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 border-b border-slate-150 pb-2.5 dark:border-slate-850">
                    <span className="text-slate-450 font-bold text-[10px]">Remote Target:</span>
                    <span className="col-span-2 font-mono text-[10px] text-slate-705 dark:text-slate-300 break-all">{provider === 'aws-s3' ? `${selectedS3Bucket}/${s3FolderPath}` : `gdrive://${selectedGDrive}${selectedGFolder}`}</span>
                  </div>

                  <div className="grid grid-cols-3 border-b border-slate-150 pb-2.5 dark:border-slate-850">
                    <span className="text-slate-450 font-bold text-[10px]">Local Directory Source:</span>
                    <span className="col-span-2 font-mono text-[10px] text-slate-705 dark:text-slate-350 break-all">{localPath}</span>
                  </div>

                  <div className="grid grid-cols-3 border-b border-slate-150 pb-2.5 dark:border-slate-850">
                    <span className="text-slate-450 font-bold text-[10px]">Interval Cycle:</span>
                    <span className="col-span-2 font-semibold text-slate-750 dark:text-neutral-200">{schedule}</span>
                  </div>

                  <div className="grid grid-cols-3">
                    <span className="text-slate-450 font-bold text-[10px]">Initial Sync Status:</span>
                    <span className="col-span-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold tracking-widest text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ACTIVE
                      </span>
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/20 p-4.5 text-[10px] font-mono uppercase tracking-wider text-indigo-650 dark:text-indigo-400">
                  <div className="flex gap-2">
                    <Database className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">Creating the sync request will register the cloud folder mapping with default automated sync intervals and index transaction watchers.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Card actions container */}
          <div className="bg-slate-50/50 dark:bg-neutral-900/50 p-6.5 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-bold text-neural-800 hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors shadow-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>BACK</span>
              </button>
            ) : (
              <span />
            )}

            {step < 7 ? (
              <button
                type="button"
                disabled={!canGoNext()}
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 bg-indigo-600 disabled:opacity-40 px-5.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 shadow-sm cursor-pointer transition-colors"
              >
                <span>CONTINUE</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalCreate}
                className="inline-flex items-center gap-1.5 bg-indigo-600 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 shadow-md cursor-pointer transition-colors animate-pulse"
                id="create-first-sync-request-btn"
              >
                <span>Finalize & Create Sync Request</span>
                <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* OS NATIVE DIRECTORY PICKERS (HIGH-FIDELITY SIMULATION POPUPS FOR FIRST SETUP) */}
      {osPickerOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOsPickerOpen(null)} />
          
          {/* Windows styled selection UI */}
          {osPickerOpen === 'windows' && (
            <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded border border-zinc-300 dark:border-zinc-805 shadow-2xl overflow-hidden font-sans text-xs flex flex-col h-[70vh]">
              {/* Windows Titlebar Header */}
              <div className="bg-[#f3f3f3] dark:bg-zinc-900 border-b border-zinc-250 dark:border-zinc-850 px-3 py-1.5 flex items-center justify-between select-none">
                <span className="font-semibold text-zinc-700 dark:text-zinc-250 flex items-center gap-1.5">
                  <span className="h-3 w-3 text-blue-500 font-bold font-sans">⊞</span>
                  Select local folder to synchronize
                </span>
                <button 
                  onClick={() => setOsPickerOpen(null)}
                  className="p-1 text-zinc-500 hover:bg-red-650 hover:text-white transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Windows Explorer Navigation Bar */}
              <div className="p-2.5 bg-[#fafafa] dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 select-none">
                <div className="flex gap-1.5 text-zinc-400 dark:text-zinc-500 shrink-0">
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4" />
                </div>
                
                {/* Path input bar */}
                <div className="flex-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 text-xs text-zinc-750 dark:text-zinc-200 flex items-center gap-1">
                  <span className="text-zinc-455">📁</span>
                  <span className="font-mono font-medium truncate">{mockCurrentDir || 'This PC > Local Disk (D:) > Projects'}</span>
                </div>

                <div className="relative w-40">
                  <input
                    type="text"
                    placeholder="Search folders"
                    value={osSearchQuery}
                    onChange={(e) => setOsSearchQuery(e.target.value)}
                    className="w-full text-[11px] p-1 border border-zinc-250 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded focus:outline-none"
                  />
                </div>
              </div>

              {/* Side bar and main body layout */}
              <div className="flex-1 flex overflow-hidden">
                {/* Windows sidebar navigation */}
                <div className="w-1/3 bg-[#f0f0f0] dark:bg-zinc-905 border-r border-zinc-250 dark:border-zinc-800 p-2 select-none space-y-2 max-h-full overflow-y-auto">
                  <div className="space-y-1">
                    <span className="font-bold text-zinc-400 text-[10px] uppercase ml-1 block">Quick Access</span>
                    <div className="px-2 py-1 rounded bg-[#e5e5e5] dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold cursor-pointer flex items-center gap-1.5">
                      <span>🖥️</span> Local Disk (D:)
                    </div>
                    <div className="px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-850 text-zinc-550 dark:text-zinc-350 cursor-pointer flex items-center gap-1.5">
                      <span>📄</span> Documents / Files
                    </div>
                    <div className="px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-850 text-zinc-550 dark:text-zinc-350 cursor-pointer flex items-center gap-1.5">
                      <span>☁️</span> Client Sync Folders
                    </div>
                  </div>
                </div>

                {/* Directory selection grid */}
                <div className="flex-1 p-3 bg-white dark:bg-zinc-950 overflow-y-auto grid grid-cols-1 content-start gap-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-extrabold mb-1 block select-none">Available Paths in D:\ Drive</span>
                  
                  {windowsDirectories
                    .filter(dir => dir.label.toLowerCase().includes(osSearchQuery.toLowerCase()))
                    .map((dir) => {
                      const isSel = mockCurrentDir === dir.name;
                      return (
                        <div
                          key={dir.name}
                          onClick={() => setMockCurrentDir(dir.name)}
                          className={`p-2 rounded flex items-center gap-2.5 cursor-pointer border transition-all ${
                            isSel
                              ? 'bg-blue-50/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                              : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <span className="text-base">📁</span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs leading-normal">{dir.label}</span>
                            <span className="text-[10px] text-zinc-400 font-mono tracking-tight mt-0.5">{dir.name}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Windows Explorer dialog actions footer bar */}
              <div className="p-3 bg-[#f0f0f0] dark:bg-zinc-900 border-t border-zinc-250 dark:border-zinc-850 flex items-center justify-between select-none">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-450 block font-bold text-[10px] uppercase font-mono">Folders Selection:</span>
                  <span className="font-mono text-zinc-850 dark:text-zinc-150 font-bold bg-[#dedede] dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">{mockCurrentDir}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOsPickerOpen(null)}
                    className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-250 dark:hover:bg-zinc-700 border border-zinc-350 dark:border-zinc-700 text-zinc-755 dark:text-zinc-200 font-bold rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalPath(mockCurrentDir);
                      setOsPickerOpen(null);
                    }}
                    className="px-5 py-1.5 bg-[#0078d7] text-white hover:bg-[#1885de] border border-[#006cc2] font-semibold rounded cursor-pointer shadow-xs"
                  >
                    Select Folder
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* macOS Finder styled selection UI */}
          {osPickerOpen === 'macos' && (
            <div className="relative w-full max-w-xl bg-[#ececec] dark:bg-neutral-900 rounded-lg shadow-2xl overflow-hidden font-sans text-xs flex flex-col h-[70vh]">
              {/* macOS Window Controls bar */}
              <div className="bg-[#ececec] dark:bg-neutral-900 px-4 py-2.5 border-b border-neutral-250 dark:border-neutral-800 flex items-center relative select-none">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f56] border border-[#e0443e] cursor-pointer" onClick={() => setOsPickerOpen(null)} />
                  <div className="h-3 w-3 rounded-full bg-[#ffbd2e] border-[#dfa224] border cursor-not-allowed" />
                  <div className="h-3 w-3 rounded-full bg-[#27c93f] border-[#1cb02e] border cursor-not-allowed" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-neutral-700 dark:text-neutral-200 font-bold text-xs">Choose Folder</span>
                </div>
              </div>

              {/* Finder Column View Layout */}
              <div className="flex-1 flex overflow-hidden">
                {/* Finder Left Sidebar */}
                <div className="w-1/3 bg-[#ececec]/80 dark:bg-neutral-900/80 p-2.5 border-r border-neutral-250 dark:border-neutral-800 overflow-y-auto select-none space-y-3">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Favorites</span>
                    <div className="mt-1 space-y-0.5">
                      <div className="px-2 py-1 rounded bg-neutral-350/50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 font-semibold cursor-pointer flex items-center gap-1.5">
                        <span className="text-[13px]">📁</span> Applications
                      </div>
                      <div className="px-2 py-1 rounded hover:bg-neutral-300 dark:hover:bg-neutral-805 text-neutral-600 dark:text-neutral-300 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[13px]">🏠</span> User Home dir
                      </div>
                    </div>
                  </div>
                </div>

                {/* Directory selection grid */}
                <div className="flex-1 p-3 bg-white dark:bg-neutral-950 overflow-y-auto grid grid-cols-1 content-start gap-1">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mb-1.5 block select-none">Available subdirectories</span>
                  
                  {macDirectories
                    .filter(dir => dir.label.toLowerCase().includes(osSearchQuery.toLowerCase()))
                    .map((dir) => {
                      const isSel = mockCurrentDir === dir.name;
                      return (
                        <div
                          key={dir.name}
                          onClick={() => setMockCurrentDir(dir.name)}
                          className={`p-2 rounded flex items-center gap-2.5 cursor-pointer border transition-all ${
                            isSel
                              ? 'bg-blue-50/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                              : 'border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-905 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          <span className="text-sm">📁</span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs leading-normal">{dir.label}</span>
                            <span className="text-[10px] text-neutral-400 font-mono tracking-tight mt-0.5">{dir.name}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* macOS Dialog footer actions bar */}
              <div className="p-3 bg-[#ececec] dark:bg-neutral-900 border-t border-neutral-250 dark:border-neutral-800 flex items-center justify-between select-none">
                <span className="font-mono text-[10px] text-neutral-500 truncate max-w-xs">{mockCurrentDir}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOsPickerOpen(null)}
                    className="px-3.5 py-1 bg-white hover:bg-slate-50 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-neutral-755 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 rounded cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalPath(mockCurrentDir);
                      setOsPickerOpen(null);
                    }}
                    className="px-4.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer font-bold shadow-xs"
                  >
                    Choose
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

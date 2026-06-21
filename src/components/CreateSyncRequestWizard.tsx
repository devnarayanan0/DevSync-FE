import React, { useState } from 'react';
import {
  X,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Info,
  Server,
  Monitor,
  FolderDot,
  Check,
  Lock,
  Key,
  Globe,
  CheckCircle2,
  Tv
} from 'lucide-react';
import { ProviderType } from '../types';
import { isElectron, selectDirectory } from '../lib/electron';

interface CreateSyncRequestWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newReq: {
    name: string;
    description?: string;
    provider: ProviderType;
    localPath: string;
    remoteFolder: string;
    schedule: string;
  }) => void;
}

export default function CreateSyncRequestWizard({
  isOpen,
  onClose,
  onComplete
}: CreateSyncRequestWizardProps) {
  const [step, setStep] = useState(1);

  // Step 1: Assign Request Identity
  const [name, setName] = useState('');

  // Step 2: Select Provider
  const [provider, setProvider] = useState<ProviderType>('google-drive');

  // Step 3: Local Folder Selection
  const [localFolder, setLocalFolder] = useState<string>('');
  const [osPickerOpen, setOsPickerOpen] = useState<'windows' | 'macos' | null>(null);

  // States inside mock OS Picker
  const [mockCurrentDir, setMockCurrentDir] = useState<string>('');
  const [osSearchQuery, setOsSearchQuery] = useState('');

  // Step 4: Provider Authentication Setup
  // AWS S3 Keys
  const [awsAccessKey, setAwsAccessKey] = useState('AKIAIOSFODNN7EXAMPLE');
  const [awsSecretKey, setAwsSecretKey] = useState('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [isAwsVerifying, setIsAwsVerifying] = useState(false);
  const [isAwsVerified, setIsAwsVerified] = useState(false);

  // Google Drive OAuth
  const [isGDriveOauthed, setIsGDriveOauthed] = useState(false);
  const [isGDriveConnecting, setIsGDriveConnecting] = useState(false);

  // Step 5: Resource Selection Mapping
  const s3Buckets = [
    's3://production-data-vault',
    's3://marketing-media-bucket',
    's3://backup-archives-us-east',
    's3://client-assets-distribution'
  ];
  const [selectedS3Bucket, setSelectedS3Bucket] = useState(s3Buckets[0]);
  const [s3FolderPath, setS3FolderPath] = useState('backups/');

  const gDrives = ['My Drive', 'Shared Design Team Drive', 'Billing Archives', 'Corporate Assets Workspace'];
  const [selectedGDrive, setSelectedGDrive] = useState(gDrives[0]);

  const gFolders = ['/Root Folders', '/Archive Projects', '/Company Sync Root', '/Assets Hub', '/Deliverables/2026'];
  const [selectedGFolder, setSelectedGFolder] = useState(gFolders[0]);

  // Step 6: Choose Synchronize Schedule
  const [schedule, setSchedule] = useState('Every 1 Hour');

  if (!isOpen) return null;

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

  const triggerGoogleOAuthSimulation = () => {
    setIsGDriveConnecting(true);
    setTimeout(() => {
      setIsGDriveOauthed(true);
      setIsGDriveConnecting(false);
    }, 1200);
  };

  const triggerAWSVerificationSimulation = () => {
    setIsAwsVerifying(true);
    setTimeout(() => {
      setIsAwsVerified(true);
      setIsAwsVerifying(false);
    }, 1200);
  };

  // Validation before going next
  const canGoNext = () => {
    switch (step) {
      case 1:
        return name.trim().length > 0;
      case 2:
        return provider === 'aws-s3' || provider === 'google-drive';
      case 3:
        return !!localFolder;
      case 4:
        if (provider === 'aws-s3') {
          return awsAccessKey.trim().length > 0 && awsSecretKey.trim().length > 0;
        } else {
          return isGDriveOauthed;
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
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    const remoteDestinationPath = provider === 'aws-s3'
      ? `${selectedS3Bucket}/${s3FolderPath.replace(/^\//, '')}`
      : `gdrive://${selectedGDrive}${selectedGFolder}`;

    onComplete({
      name,
      description: `Synchronized ${provider === 'aws-s3' ? 'AWS S3 bucket' : 'Google Drive Workspace'} data pipeline`,
      provider,
      localPath: localFolder,
      remoteFolder: remoteDestinationPath,
      schedule
    });

    // Reset wizard
    setStep(1);
    setName('');
    setLocalFolder('');
    setSelectedS3Bucket(s3Buckets[0]);
    setS3FolderPath('backups/');
    setIsGDriveOauthed(false);
    setIsAwsVerified(false);
  };

  // Step information lookup for headers
  const getStepHeaderInfo = () => {
    switch (step) {
      case 1:
        return { percent: '14%', title: 'ASSIGN REQUEST IDENTITY', desc: 'Specify a human-readable name and details for this task.' };
      case 2:
        return { percent: '29%', title: 'CLOUD STORAGE PROVIDER', desc: 'Choose the cloud storage service you want to sync with.' };
      case 3:
        return { percent: '43%', title: 'LOCAL FOLDER SELECTION', desc: 'Choose a local directory path to scan and synchronize.' };
      case 4:
        return { percent: '57%', title: 'AUTHENTICATION DETAIL', desc: 'Input secure credentials or authenticate your account via OAuth.' };
      case 5:
        return { percent: '71%', title: 'RESOURCE SELECTION', desc: 'Map specific cloud storage bucket or workspace folder destinations.' };
      case 6:
        return { percent: '86%', title: 'AUTOMATION FREQUENCY', desc: 'Select standard background interval period mapping details.' };
      default:
        return { percent: '100%', title: 'CONFIGURATION REVIEW', desc: 'Verify your registration credentials mapping prior to activation.' };
    }
  };

  const stepInfo = getStepHeaderInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Main Large Wizard Window */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col z-50 max-h-[90vh]">
        
        {/* Top Header & Navigation progress */}
        <div className="border-b border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6.5 py-5.5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/45 text-indigo-650 dark:text-indigo-400 font-semibold shadow-sm">
                <FolderDot className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight text-neutral-900 dark:text-neutral-100 font-sans uppercase">
                  Create Sync Request
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-sans">
                  Set up a new synchronization between your local folder and cloud storage.
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-neutral-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stepper Progress bar */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-450 dark:text-slate-400 uppercase tracking-wider font-extrabold select-none">
              <span>Step {step} of 7: {stepInfo.title}</span>
              <span>{stepInfo.percent} Complete</span>
            </div>
            {/* Segmented layout with 7 pills */}
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
        </div>

        {/* Wizard Main Content - Scrollable Form view */}
        <div className="flex-1 p-6.5 overflow-y-auto max-h-[50vh] space-y-4">
          
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">Assign Request Identity</h4>
                <p className="text-xs text-gray-400 leading-normal mb-2">Each sync request defines a mapping node between a watch directory on disk and a remote storage namespace.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-450 block dark:text-slate-400">Sync Request Name</label>
                <input
                  type="text"
                  placeholder="e.g. Daily Marketing Backups"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-semibold p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-slate-55/10 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors"
                  autoFocus
                />
                <p className="text-[11px] text-gray-400 italic">Use a clear human-readable name for monitoring notifications on files transfer.</p>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4.5 text-xs leading-relaxed text-amber-600 dark:text-amber-400 font-sans">
                💡 <strong>Desktop Client Note:</strong> This defines the logical namespace that organizes file filters, tracking indexes, and network queue configurations.
              </div>
            </div>
          )}

          {/* STEP 2: Select Provider */}
          {step === 2 && (
            <div className="space-y-5.5 font-sans">
              <div>
                <h4 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">SELECT STORAGE TARGET PROVIDER</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Choose the cloud storage service you want to sync with.</p>
              </div>

              <div className="grid grid-cols-2 gap-5 pt-1">
                
                {/* AWS S3 Integration Card */}
                <div
                  onClick={() => setProvider('aws-s3')}
                  className={`p-6.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center justify-center space-y-4 relative min-h-48 ${
                    provider === 'aws-s3'
                      ? 'border-2 border-indigo-600 dark:border-indigo-500 bg-white dark:bg-neutral-900/40 shadow-xs'
                      : 'border-slate-205 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-slate-350 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="h-14 w-20 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-neutral-800/50 shadow-sm p-2">
                    {/* High Fidelity AWS Logo representation */}
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
                    <span className="text-[10px] text-zinc-450 dark:text-slate-400 leading-normal block mt-1.5">
                      Secure and scalable object storage in the AWS cloud.
                    </span>
                  </div>
                  {provider === 'aws-s3' && (
                    <div className="absolute top-3 right-3 h-5 w-5 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-xs">
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    </div>
                  )}
                </div>

                {/* Google Drive Workspace Card */}
                <div
                  onClick={() => setProvider('google-drive')}
                  className={`p-6.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center justify-center space-y-4 relative min-h-48 ${
                    provider === 'google-drive'
                      ? 'border-2 border-indigo-600 dark:border-indigo-500 bg-white dark:bg-neutral-900/40 shadow-xs'
                      : 'border-slate-205 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-slate-350 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="h-14 w-20 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-neutral-800/50 shadow-sm p-1">
                    {/* High Fidelity Google Drive Logo */}
                    <svg className="w-10 h-9" viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M47.2 24h49.6l23.2 40H70.4L47.2 24z" fill="#FFC107"/>
                      <path d="M18 76l23.2-40 47.2 82-23.2 40L18 76z" fill="#2196F3"/>
                      <path d="M70.4 64h63l-23.2 40H47.2l23.2-40z" fill="#4CAF50"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Google Drive</h4>
                    <span className="text-[10px] text-zinc-455 dark:text-slate-400 leading-normal block mt-1.5">
                      Sync files with Google Drive or Shared Drives.
                    </span>
                  </div>
                  {provider === 'google-drive' && (
                    <div className="absolute top-3 right-3 h-5 w-5 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-xs">
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    </div>
                  )}
                </div>

                {/* Microsoft Azure Blob - Disabled */}
                <div className="p-6.5 rounded-xl border border-dashed border-slate-205 dark:border-neutral-800/80 bg-slate-50/40 dark:bg-neutral-950/10 opacity-55 flex flex-col items-center text-center justify-center space-y-4 cursor-not-allowed select-none min-h-48">
                  <div className="h-14 w-20 flex items-center justify-center rounded-lg bg-slate-50/50 dark:bg-neutral-800/20 p-2">
                    {/* High Fidelity Azure Symbol */}
                    <svg className="w-9 h-9" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 95l43-80h24L45 95H21z" fill="#0078D4"/>
                      <path d="M88 15h24L72 95H48l40-80z" fill="#50E6FF" fillOpacity="0.8"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500">Microsoft Azure Blob</h4>
                    <span className="text-[10px] text-zinc-450 dark:text-slate-500 leading-normal block mt-1.5">
                      Enterprise-ready cloud storage with Azure Blob.
                    </span>
                  </div>
                </div>

                {/* Dropbox Client - Disabled */}
                <div className="p-6.5 rounded-xl border border-dashed border-slate-205 dark:border-neutral-800/80 bg-slate-50/40 dark:bg-neutral-950/10 opacity-55 flex flex-col items-center text-center justify-center space-y-4 cursor-not-allowed select-none min-h-48">
                  <div className="h-14 w-20 flex items-center justify-center rounded-lg bg-slate-50/50 dark:bg-neutral-800/20 p-2">
                    {/* High Fidelity Dropbox Vector */}
                    <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 2L1 5.5l5 3.5 5-3.5L6 2zM18 2l-5 3.5 5 3.5 5-3.5L18 2zM1 12.5l5 3.5 5-3.5-5-3.5-5 3.5zM13 12.5l5 3.5 5-3.5-5-3.5-5 3.5zM6 19.5l6 4 6-4v-2L12 21l-6-3.5v2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500">Dropbox</h4>
                    <span className="text-[10px] text-zinc-450 dark:text-slate-500 leading-normal block mt-1.5">
                      Sync files and folders with your Dropbox account.
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: Local Folder Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-455 block dark:text-slate-400">Select Local Storage Scan Source Directory</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                DevSync watches localized folders on the desktop workspace directory to trigger automatic cloud synchronization. Choose your local source below:
              </p>

              <div className="bg-slate-50/50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-7 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="h-14 w-14 rounded-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/25 text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-neutral-800 shadow-xs">
                  <FolderOpen className="h-6.5 w-6.5" />
                </div>

                <div className="w-full max-w-md space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-450 uppercase block tracking-wide dark:text-slate-400">Selected Directory Path</label>
                  <input
                    type="text"
                    readOnly
                    placeholder="No folder selected. Click Browse Folder below..."
                    value={localFolder}
                    className="w-full text-center text-xs font-mono font-bold py-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-indigo-600 dark:text-indigo-400 rounded-xl cursor-not-allowed select-text outline-none"
                  />
                </div>

                {/* Simulated folder selection launcher triggers */}
                <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                  {isElectron() && (
                    <button
                      type="button"
                      onClick={async () => {
                        const path = await selectDirectory();
                        if (path) {
                          setLocalFolder(path);
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-md mb-2 animate-bounce"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Select Folder Directory via Native OS Dialog
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setOsPickerOpen('windows');
                      setMockCurrentDir(windowsDirectories[0].name);
                    }}
                    className="inline-flex items-center gap-2 px-4.5 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer transition-colors shadow-xs"
                    id="browse-windows"
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
                    className="inline-flex items-center gap-2 px-4.5 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer transition-colors shadow-xs"
                    id="browse-macos"
                  >
                    <Tv className="h-4 w-4 text-slate-500" />
                    Browse macOS Folder
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Provider Authentication Setup */}
          {step === 4 && (
            <div className="space-y-4 font-sans">
              
              {provider === 'aws-s3' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-neutral-800 pb-3">
                    <span className="p-1 rounded-md bg-[#FF9900]/10 text-[#FF9900] text-xs font-bold font-sans">S3</span>
                    <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">AWS S3 Infrastructure Host Authentication</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.55">
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 flex items-center gap-1 dark:text-slate-400">
                        <Lock className="h-3 w-3" /> AWS Access Key ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AKIA..."
                        value={awsAccessKey}
                        onChange={(e) => setAwsAccessKey(e.target.value)}
                        className="w-full text-xs font-mono p-3 bg-slate-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 flex items-center gap-1 dark:text-slate-400">
                        <Key className="h-3 w-3" /> AWS Secret Access Key
                      </label>
                      <input
                        type="password"
                        placeholder="Secret Token"
                        value={awsSecretKey}
                        onChange={(e) => setAwsSecretKey(e.target.value)}
                        className="w-full text-xs font-mono p-3 bg-slate-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 flex items-center gap-1 dark:text-slate-400">
                      <Globe className="h-3 w-3" /> AWS Default Active Region
                    </label>
                    <select
                      value={awsRegion}
                      onChange={(e) => setAwsRegion(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 cursor-pointer outline-none font-semibold"
                    >
                      <option value="us-east-1">US East (N. Virginia) us-east-1</option>
                      <option value="us-west-2">US West (Oregon) us-west-2</option>
                      <option value="eu-west-1">Europe (Ireland) eu-west-1</option>
                      <option value="ap-southeast-1">Asia Pacific (Singapore) ap-southeast-1</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isAwsVerifying}
                      onClick={triggerAWSVerificationSimulation}
                      className="w-full py-3.5 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-205 dark:hover:bg-neutral-750 text-xs font-bold text-neutral-800 dark:text-neutral-200 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {isAwsVerifying ? (
                        <>
                          <div className="animate-spin h-3.5 w-3.5 border-2 border-indigo-650 dark:border-indigo-400 border-t-transparent rounded-full" />
                          Testing AWS Credentials...
                        </>
                      ) : isAwsVerified ? (
                        <>
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">AWS Connection Verified OK</span>
                        </>
                      ) : (
                        "Test & Verify AWS Credentials"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-neutral-800 pb-3">
                    <svg className="w-5.5 h-5.5" viewBox="0 0 144 144" fill="none">
                      <path d="M47.2 24h49.6l23.2 40H70.4L47.2 24z" fill="#FFC107"/>
                      <path d="M18 76l23.2-40 47.2 82-23.2 40L18 76z" fill="#2196F3"/>
                      <path d="M70.4 64h63l-23.2 40H47.2l23.2-40z" fill="#4CAF50"/>
                    </svg>
                    <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">Google Workspace Secure OAuth Link</span>
                  </div>

                  <div className="bg-slate-50/50 dark:bg-neutral-900/50 border border-neutral-105 dark:border-neutral-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                    {isGDriveOauthed ? (
                      <>
                        <div className="h-11 w-11 rounded-full bg-emerald-55/15 text-emerald-500 flex items-center justify-center border border-emerald-500/25">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div className="space-y-1 bg-white dark:bg-neutral-950 px-4.5 py-3 rounded-xl border border-slate-100 dark:border-neutral-800 text-center shadow-xs">
                          <span className="text-xs font-bold text-slate-800 dark:text-neutral-250 block">Google Drive Scope Permission Granted</span>
                          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-450 block mt-0.5">Linked User Profile: devash217@gmail.com</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsGDriveOauthed(false)}
                          className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                        >
                          Revoke Account Permission Scope
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="h-11 w-11 rounded-full bg-indigo-50 dark:bg-indigo-950/25 text-indigo-500 flex items-center justify-center">
                          <Server className="h-5.5 w-5.5 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">Workspace Scope Protocol Authorization</span>
                          <span className="text-[10px] text-gray-400 dark:text-slate-400 max-w-sm block leading-normal">
                            A secure OAuth handshake is required to verify write permissions on Google Workspace drives.
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isGDriveConnecting}
                          onClick={triggerGoogleOAuthSimulation}
                          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-45 cursor-pointer shadow-sm"
                        >
                          {isGDriveConnecting ? (
                            <>
                              <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                              Negotiating OAuth...
                            </>
                          ) : (
                            'Authorize with Google Account'
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 5: Resource Selection Mapping */}
          {step === 5 && (
            <div className="space-y-4 font-sans">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-neutral-800 pb-3">
                <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">Target Remote Cloud Resources</span>
              </div>

              {provider === 'aws-s3' ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 dark:text-slate-400 block">S3 Target Storage Bucket</label>
                    <select
                      value={selectedS3Bucket}
                      onChange={(e) => setSelectedS3Bucket(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 cursor-pointer outline-none font-semibold"
                    >
                      {s3Buckets.map((bucket) => (
                        <option key={bucket} value={bucket}>{bucket}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 dark:text-slate-400 block">S3 Destination Folder Path (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. daily-backups/"
                      value={s3FolderPath}
                      onChange={(e) => setS3FolderPath(e.target.value)}
                      className="w-full text-xs font-mono p-3 bg-slate-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 dark:text-slate-400 block">Drive Selection</label>
                      <select
                        value={selectedGDrive}
                        onChange={(e) => setSelectedGDrive(e.target.value)}
                        className="w-full text-xs p-3 bg-slate-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 cursor-pointer outline-none font-semibold"
                      >
                        {gDrives.map((drv) => (
                          <option key={drv} value={drv}>{drv}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 dark:text-slate-400 block">Destination Workspace Folder</label>
                      <select
                        value={selectedGFolder}
                        onChange={(e) => setSelectedGFolder(e.target.value)}
                        className="w-full text-xs p-3 bg-slate-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 cursor-pointer outline-none font-semibold"
                      >
                        {gFolders.map((fld) => (
                          <option key={fld} value={fld}>{fld}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Choose Synchronize Schedule */}
          {step === 6 && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 block">Select Synchronization Frequency Schedule</span>
              
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

              {/* Advanced schedule note */}
              <div className="flex items-start gap-2.5 bg-indigo-500/5 border border-indigo-900/10 p-3.5 rounded-xl text-xs leading-normal text-indigo-500 dark:text-indigo-400 font-sans">
                <Info className="h-4.5 w-4.5 mt-0.5 shrink-0" />
                <span>
                  <strong>Advanced Schedule Note:</strong> If enabled, synchronization can optionally be toggled paused, resumed, scheduled, or altered in your Activity schedules dashboards after final registration.
                </span>
              </div>
            </div>
          )}

          {/* STEP 7: Final Review & Create */}
          {step === 7 && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 block">Review Sync Request Registrations</span>
              
              <div className="rounded-2xl border border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden font-sans">
                <div className="p-5 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100">{name}</h4>
                    <p className="text-[11px] text-gray-450 mt-1 italic">Ready to register. Check configurations profile summary.</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {provider === 'aws-s3' ? (
                      <div className="flex items-center gap-1.5 bg-[#FF9900]/10 text-[#FF9900] px-3 py-1 rounded-lg text-[10px] font-extrabold">
                        AWS S3
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-extrabold">
                        Google Drive
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4 divide-y divide-slate-100 dark:divide-neutral-800 text-xs text-neutral-900 dark:text-neutral-100">
                  <div className="flex justify-between items-center gap-2 pt-0.5">
                    <span className="text-slate-450 dark:text-slate-400 uppercase font-extrabold text-[10px] tracking-wider font-mono">Storage Source Provider:</span>
                    <span className="font-extrabold uppercase select-none">{provider === 'aws-s3' ? 'AWS S3 Container' : 'Google Drive Workspace'}</span>
                  </div>

                  <div className="flex justify-between items-center gap-2 pt-3">
                    <span className="text-slate-455 dark:text-slate-400 uppercase font-extrabold text-[10px] tracking-wider font-mono">Source Local Directory:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/5 px-2.5 py-0.5 rounded-lg border border-indigo-500/10 truncate max-w-sm">
                      {localFolder}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-2 pt-3">
                    <span className="text-slate-455 dark:text-slate-400 uppercase font-extrabold text-[10px] tracking-wider font-mono">Cloud Target Target:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/5 px-2.5 py-0.5 rounded-lg border border-indigo-500/10 truncate max-w-sm">
                      {provider === 'aws-s3' ? `${selectedS3Bucket}/${s3FolderPath}` : `gdrive://${selectedGDrive}${selectedGFolder}`}
                    </span>
                  </div>

                  {provider === 'aws-s3' ? (
                    <div className="flex justify-between items-center gap-2 pt-3">
                      <span className="text-slate-455 dark:text-slate-400 uppercase font-extrabold text-[10px] tracking-wider font-mono">S3 Region & Key:</span>
                      <span className="text-neutral-600 dark:text-neutral-300 font-mono text-[11px]">
                        [{awsRegion}] Key: {awsAccessKey.slice(0, 8)}...
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center gap-2 pt-3">
                      <span className="text-slate-455 dark:text-slate-400 uppercase font-extrabold text-[10px] tracking-wider font-mono">Authorized User:</span>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-450 font-bold">
                        devash217@gmail.com
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center gap-2 pt-3">
                    <span className="text-slate-455 dark:text-slate-400 uppercase font-extrabold text-[10px] tracking-wider font-mono">Sync Interval Schedule:</span>
                    <span className="font-semibold select-none font-mono text-indigo-650 dark:text-indigo-400">{schedule}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Wizard Actions */}
        <div className="p-5.5 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900 flex items-center justify-between font-sans shrink-0">
          
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-extrabold uppercase rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-slate-55 text-slate-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed select-none transition-all cursor-pointer shadow-xs"
          >
            <ChevronLeft className="h-4 w-4" />
            BACK
          </button>

          {/* Next / Create button */}
          {step < 7 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext()}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-extrabold uppercase rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 select-none transition-all cursor-pointer shadow-sm"
            >
              CONTINUE
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-7 py-3 text-xs font-extrabold uppercase rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-md animate-pulse"
              id="wizard-btn-finish"
            >
              Create Sync Request
            </button>
          )}

        </div>

      </div>

      {/* OS NATIVE DIRECTORY PICKERS (HIGH-FIDELITY SIMULATION POPUPS) */}
      {osPickerOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOsPickerOpen(null)} />
          
          {/* Windows styled selection UI */}
          {osPickerOpen === 'windows' && (
            <div className="relative w-full max-w-xl bg-theme-card rounded border border-zinc-300 dark:border-zinc-805 shadow-2xl overflow-hidden font-sans text-xs flex flex-col h-[70vh]">
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

                {/* Filter and search Explorer style icon */}
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
                    <div className="px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-550 dark:text-zinc-350 cursor-pointer flex items-center gap-1.5">
                      <span>📄</span> Documents / Files
                    </div>
                    <div className="px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-550 dark:text-zinc-350 cursor-pointer flex items-center gap-1.5">
                      <span>☁️</span> Client Sync Folders
                    </div>
                    <div className="px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-550 dark:text-zinc-350 cursor-pointer flex items-center gap-1.5">
                      <span>📥</span> User Downloads
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
                      setLocalFolder(mockCurrentDir);
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
                {/* Traffic Light buttons */}
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
                      <div className="px-2 py-1 rounded hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[13px]">🏠</span> User Home dir
                      </div>
                      <div className="px-2 py-1 rounded hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[13px]">📄</span> Documents
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
                      setLocalFolder(mockCurrentDir);
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

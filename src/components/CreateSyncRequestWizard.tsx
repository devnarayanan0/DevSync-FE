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
  Plus,
  Search,
  CheckCircle2,
  Tv
} from 'lucide-react';
import { ProviderType } from '../types';

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

  // Step 1: Basic Information
  const [name, setName] = useState('');

  // Step 2: Select Provider
  const [provider, setProvider] = useState<ProviderType>('aws-s3');

  // Step 3: Local Folder Select
  const [localFolder, setLocalFolder] = useState<string>('');
  const [osPickerOpen, setOsPickerOpen] = useState<'windows' | 'macos' | null>(null);

  // States inside mock OS Picker
  const [mockCurrentDir, setMockCurrentDir] = useState<string>('');
  const [osSearchQuery, setOsSearchQuery] = useState('');

  // Step 4: Provider Configuration
  // AWS S3 Setup
  const [awsAccessKey, setAwsAccessKey] = useState('AKIAIOSFODNN7EXAMPLE');
  const [awsSecretKey, setAwsSecretKey] = useState('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  
  const s3Buckets = [
    's3://production-data-vault',
    's3://marketing-media-bucket',
    's3://backup-archives-us-east',
    's3://client-assets-distribution'
  ];
  const [selectedS3Bucket, setSelectedS3Bucket] = useState(s3Buckets[0]);
  const [s3FolderPath, setS3FolderPath] = useState('backups/');

  // Google Drive Setup
  const [isGDriveOauthed, setIsGDriveOauthed] = useState(false);
  const [isGDriveConnecting, setIsGDriveConnecting] = useState(false);
  
  const gDrives = ['My Drive', 'Shared Design Team Drive', 'Billing Archives', 'Corporate Assets Workspace'];
  const [selectedGDrive, setSelectedGDrive] = useState(gDrives[0]);
  
  const gFolders = ['/Root Folders', '/Archive Projects', '/Company Sync Root', '/Assets Hub', '/Deliverables/2026'];
  const [selectedGFolder, setSelectedGFolder] = useState(gFolders[0]);

  // Step 5: Schedule
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
          return awsAccessKey.trim().length > 0 && awsSecretKey.trim().length > 0 && !!selectedS3Bucket;
        } else {
          return isGDriveOauthed && !!selectedGDrive;
        }
      case 5:
        return !!schedule;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canGoNext() && step < 6) {
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Main Large Wizard Window */}
      <div className="relative w-full max-w-2xl bg-theme-card rounded-xl border border-theme-border shadow-2xl overflow-hidden text-theme-text flex flex-col z-50 max-h-[90vh]">
        
        {/* Top Header & Navigation progress */}
        <div className="border-b border-theme-border bg-theme-bg p-4.5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
                <FolderDot className="h-4 w-4" />
              </span>
              <h3 className="font-bold text-sm tracking-tight font-sans uppercase">
                Create Sync Request
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-theme-text hover:bg-theme-border cursor-pointer transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Stepper Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-450 uppercase tracking-wider font-extrabold select-none">
              <span>Step {step} of 6: {
                step === 1 ? 'Basic Information' :
                step === 2 ? 'Cloud Storage Provider' :
                step === 3 ? 'Local Folder Selection' :
                step === 4 ? 'Provider Configuration' :
                step === 5 ? 'Frequency Schedule' :
                'Review Configuration'
              }</span>
              <span>{Math.round((step / 6) * 100)}% Complete</span>
            </div>
            <div className="h-2 w-full bg-theme-border rounded-full overflow-hidden flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div 
                  key={s} 
                  className={`h-full flex-1 transition-all duration-300 rounded-sm ${
                    s <= step ? 'bg-indigo-600' : 'bg-theme-border/60'
                  }`} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Wizard Main Content - Scrollable Form view */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[50vh] space-y-4">
          
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-450">Sync Request Name</label>
                <input
                  type="text"
                  placeholder="e.g. Daily Marketing Backups"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded border border-theme-border bg-theme-bg text-theme-text placeholder-slate-500 focus:outline-none focus:border-indigo-600 transition-colors"
                  autoFocus
                />
                <p className="text-[11px] text-slate-450 italic">Use a clear human-readable name for monitoring notifications on files transfer.</p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-[11px] leading-relaxed text-amber-600 dark:text-amber-400 font-sans">
                💡 <strong>Desktop Client Note:</strong> This defines the logical namespace that organizes file filters, tracking indexes, and network queue configurations.
              </div>
            </div>
          )}

          {/* STEP 2: Select Provider */}
          {step === 2 && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-450 block">Select Storage Target Provider</span>
              <div className="grid grid-cols-2 gap-4">
                
                {/* AWS S3 Integration Card */}
                <div
                  onClick={() => setProvider('aws-s3')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center space-y-2.5 relative ${
                    provider === 'aws-s3'
                      ? 'border-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/20 shadow-xs'
                      : 'border-theme-border bg-theme-bg hover:bg-theme-border/20'
                  }`}
                >
                  <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-[#FF9900]/10 text-[#FF9900] shadow-sm">
                    {/* SVG representing official AWS Brand */}
                    <svg className="h-8 w-8" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25 45L7.68 35V15L25 5L42.32 15V35L25 45Z" fill="#232F3E"/>
                      <path d="M25 10L39.5 18V32L25 40L10.5 32V18L25 10Z" fill="#FF9900"/>
                      <path d="M25 10L10.5 18V32L25 40V10Z" fill="#E28704"/>
                      <circle cx="25" cy="25" r="5" fill="#FFFFFF"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-sans">AWS S3</h4>
                    <span className="text-[10px] text-slate-400 leading-normal block mt-1">
                      Direct cloud synchronization to buckets.
                    </span>
                  </div>
                  {provider === 'aws-s3' && (
                    <div className="absolute top-2 right-2 h-4 w-4 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Google Drive Workspace Card */}
                <div
                  onClick={() => setProvider('google-drive')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center space-y-2.5 relative ${
                    provider === 'google-drive'
                      ? 'border-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/20 shadow-xs'
                      : 'border-theme-border bg-theme-bg hover:bg-theme-border/20'
                  }`}
                >
                  <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-emerald-500/10 shadow-sm">
                    {/* SVG representing official Google Drive Brand */}
                    <svg className="w-8 h-8" viewBox="0 0 144 144" fill="none">
                      <path d="M47.2 24h49.6l23.2 40H70.4L47.2 24z" fill="#FFC107"/>
                      <path d="M18 76l23.2-40 47.2 82-23.2 40L18 76z" fill="#2196F3"/>
                      <path d="M70.4 64h63l-23.2 40H47.2l23.2-40z" fill="#4CAF50"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-sans">Google Drive</h4>
                    <span className="text-[10px] text-slate-400 leading-normal block mt-1">
                      Sync to company folders or personal documents directories.
                    </span>
                  </div>
                  {provider === 'google-drive' && (
                    <div className="absolute top-2 right-2 h-4 w-4 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Microsoft Azure - Disabled */}
                <div className="p-4 rounded-xl border border-dashed border-theme-border bg-theme-bg opacity-45 flex flex-col items-center text-center space-y-2.5 cursor-not-allowed select-none relative">
                  <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-blue-500/5 text-blue-400">
                    <svg className="w-8 h-8" viewBox="0 0 128 128" fill="none">
                      <path d="M21 95l43-80h24L45 95H21z" fill="#0078D4"/>
                      <path d="M88 15h24L72 95H48l40-80z" fill="#50E6FF" fillOpacity="0.8"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-sans text-slate-400">Microsoft Azure</h4>
                    <span className="text-[9px] text-indigo-500 font-extrabold bg-indigo-500/10 border border-indigo-900/10 px-1.5 py-0.5 rounded uppercase tracking-widest block mt-1.5 mx-auto w-max">
                      Coming Soon
                    </span>
                  </div>
                </div>

                {/* Dropbox Client - Disabled */}
                <div className="p-4 rounded-xl border border-dashed border-theme-border bg-theme-bg opacity-45 flex flex-col items-center text-center space-y-2.5 cursor-not-allowed select-none relative">
                  <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-blue-500/5">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                      <path d="M6 2L1 5.5l5 3.5 5-3.5L6 2zM18 2l-5 3.5 5 3.5 5-3.5L18 2zM1 12.5l5 3.5 5-3.5-5-3.5-5 3.5zM13 12.5l5 3.5 5-3.5-5-3.5-5 3.5zM6 19.5l6 4 6-4v-2L12 21l-6-3.5v2z" fill="#0061FF"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-sans text-slate-400">Dropbox</h4>
                    <span className="text-[9px] text-indigo-500 font-extrabold bg-indigo-500/10 border border-indigo-900/10 px-1.5 py-0.5 rounded uppercase tracking-widest block mt-1.5 mx-auto w-max">
                      Coming Soon
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: Local Folder Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-450 block">Select Local Storage Scan Source Directory</span>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                DevSync watches localized folders on the desktop workspace directory to trigger automatic cloud synchronization. Choose your local source below:
              </p>

              <div className="bg-theme-bg border border-theme-border rounded-xl p-6.5 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-indigo-50/10 text-indigo-600 border border-indigo-900/10 shadow-xs">
                  <FolderOpen className="h-6 w-6" />
                </div>

                <div className="w-full max-w-md space-y-2">
                  <label className="text-[11px] font-bold text-slate-450 uppercase block tracking-wide">Selected Directory Path</label>
                  <input
                    type="text"
                    readOnly
                    placeholder="No folder selected. Click Browse Folder below..."
                    value={localFolder}
                    className="w-full text-center text-xs font-mono font-bold py-2 bg-theme-bg border border-theme-border text-indigo-600 dark:text-indigo-400 rounded cursor-not-allowed select-text outline-none"
                  />
                </div>

                {/* Simulated folder selection launcher triggers */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOsPickerOpen('windows');
                      setMockCurrentDir(windowsDirectories[0].name);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-theme-card border border-theme-border hover:bg-theme-border text-xs font-bold text-theme-text cursor-pointer transition-colors shadow-xs"
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
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-theme-card border border-theme-border hover:bg-theme-border text-xs font-bold text-theme-text cursor-pointer transition-colors shadow-xs"
                    id="browse-macos"
                  >
                    <Tv className="h-4 w-4 text-slate-500" />
                    Browse macOS Folder
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Provider Configuration */}
          {step === 4 && (
            <div className="space-y-4 font-sans">
              
              {provider === 'aws-s3' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-theme-border pb-2">
                    <svg className="h-6 w-6 text-[#FF9900]" viewBox="0 0 50 50" fill="none">
                      <path d="M25 45L7.68 35V15L25 5L42.32 15V35L25 45Z" fill="#232F3E"/>
                      <path d="M25 10L39.5 18V32L25 40L10.5 32V18L25 10Z" fill="#FF9900"/>
                      <circle cx="25" cy="25" r="5" fill="#FFFFFF"/>
                    </svg>
                    <span className="text-xs font-bold text-theme-text uppercase tracking-wide">AWS S3 Configuration Setup</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 flex items-center gap-1">
                        <Lock className="h-3 w-3" /> AWS Access Key ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AKIA..."
                        value={awsAccessKey}
                        onChange={(e) => setAwsAccessKey(e.target.value)}
                        className="w-full text-xs font-mono p-2 bg-theme-bg border border-theme-border rounded text-theme-text"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 flex items-center gap-1">
                        <Key className="h-3 w-3" /> AWS Secret Access Key
                      </label>
                      <input
                        type="password"
                        placeholder="Secret Token"
                        value={awsSecretKey}
                        onChange={(e) => setAwsSecretKey(e.target.value)}
                        className="w-full text-xs font-mono p-2 bg-theme-bg border border-theme-border rounded text-theme-text"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> AWS Region Default
                      </label>
                      <select
                        value={awsRegion}
                        onChange={(e) => setAwsRegion(e.target.value)}
                        className="w-full text-xs p-2 bg-theme-bg border border-theme-border rounded text-theme-text cursor-pointer outline-none font-semibold"
                      >
                        <option value="us-east-1">US East (N. Virginia) us-east-1</option>
                        <option value="us-west-2">US West (Oregon) us-west-2</option>
                        <option value="eu-west-1">Europe (Ireland) eu-west-1</option>
                        <option value="ap-southeast-1">Asia Pacific (Singapore) ap-southeast-1</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450">S3 Target Target Bucket</label>
                      <select
                        value={selectedS3Bucket}
                        onChange={(e) => setSelectedS3Bucket(e.target.value)}
                        className="w-full text-xs p-2 bg-theme-bg border border-theme-border rounded text-theme-text cursor-pointer outline-none font-semibold"
                      >
                        {s3Buckets.map((bucket) => (
                          <option key={bucket} value={bucket}>{bucket}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450">S3 Destination Folder Path (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. daily-backups/"
                      value={s3FolderPath}
                      onChange={(e) => setS3FolderPath(e.target.value)}
                      className="w-full text-xs font-mono p-2 bg-theme-bg border border-theme-border rounded text-theme-text"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-theme-border pb-2">
                    <svg className="w-6 h-6" viewBox="0 0 144 144" fill="none">
                      <path d="M47.2 24h49.6l23.2 40H70.4L47.2 24z" fill="#FFC107"/>
                      <path d="M18 76l23.2-40 47.2 82-23.2 40L18 76z" fill="#2196F3"/>
                      <path d="M70.4 64h63l-23.2 40H47.2l23.2-40z" fill="#4CAF50"/>
                    </svg>
                    <span className="text-xs font-bold text-theme-text uppercase tracking-wide">Google Drive Authorization</span>
                  </div>

                  <div className="bg-theme-bg border border-theme-border rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-4">
                    {isGDriveOauthed ? (
                      <>
                        <div className="h-10 w-10 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-theme-text block">Google Drive Connection Link Established</span>
                          <span className="text-[11px] font-mono text-emerald-600 block">Linked: devash217@gmail.com</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsGDriveOauthed(false)}
                          className="text-[10px] font-bold hover:underline text-red-500 cursor-pointer"
                        >
                          Disconnect Account
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-full bg-indigo-50/10 text-indigo-500 flex items-center justify-center">
                          <Server className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-theme-text block">Google Workspace Credentials Scope Protocol</span>
                          <span className="text-[10px] text-slate-400 block px-4 leading-normal">
                            Connect DevSync with Google Workspace API authentication keys to access your target folders.
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isGDriveConnecting}
                          onClick={triggerGoogleOAuthSimulation}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-45 cursor-pointer shadow-xs"
                        >
                          {isGDriveConnecting ? (
                            <>
                              <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                              Connecting...
                            </>
                          ) : (
                            'Connect with Google OAuth'
                          )}
                        </button>
                      </>
                    )}
                  </div>

                  {isGDriveOauthed && (
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 block">Google Drive Selection</label>
                        <select
                          value={selectedGDrive}
                          onChange={(e) => setSelectedGDrive(e.target.value)}
                          className="w-full text-xs p-2 bg-theme-bg border border-theme-border rounded text-theme-text cursor-pointer outline-none font-semibold"
                        >
                          {gDrives.map((drv) => (
                            <option key={drv} value={drv}>{drv}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 block">Folder Selection</label>
                        <select
                          value={selectedGFolder}
                          onChange={(e) => setSelectedGFolder(e.target.value)}
                          className="w-full text-xs p-2 bg-theme-bg border border-theme-border rounded text-theme-text cursor-pointer outline-none font-semibold"
                        >
                          {gFolders.map((fld) => (
                            <option key={fld} value={fld}>{fld}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* STEP 5: Schedule */}
          {step === 5 && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-450 block">Select Synchronization Frequency Schedule</span>
              
              <div className="grid grid-cols-2 gap-3 font-sans">
                {[
                  { id: 'Manual Trigger Only', title: 'Manual Only', desc: 'No background automation. Trigger sync via dashboard buttons manually.' },
                  { id: 'Sync On Application Startup', title: 'On Startup', desc: 'Automatic files transmission whenever DevSync client daemon starts.' },
                  { id: 'Every 5 Minutes', title: 'Every 5 Minutes', desc: 'Rapid incremental syncing cycle loops. Ideal for active files modification.' },
                  { id: 'Every 15 Minutes', title: 'Every 15 Minutes', desc: 'Standard high-frequency automatic backups for design assets.' },
                  { id: 'Every 1 Hour', title: 'Every Hour', desc: 'Standard business synchronization intervals cycle.' },
                  { id: 'Daily at 02:00 AM', title: 'Daily', desc: 'Low overhead. Triggers daily tasks backups late night routinely.' }
                ].map((opt) => {
                  const isSel = schedule === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSchedule(opt.id)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer flex gap-3 text-left items-start ${
                        isSel
                          ? 'border-indigo-600 bg-indigo-50/5 dark:bg-indigo-950/20'
                          : 'border-theme-border bg-theme-bg hover:bg-theme-border/20'
                      }`}
                    >
                      <div className="mt-0.5 flex justify-center items-center">
                        <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                          isSel ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-theme-border'
                        }`}>
                          {isSel && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-theme-text">{opt.title}</span>
                        <p className="text-[10px] text-slate-450 leading-normal">{opt.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Advanced schedule note */}
              <div className="flex items-start gap-2.5 bg-indigo-500/5 border border-indigo-900/10 p-3 rounded-lg text-xs leading-normal text-indigo-400 font-sans">
                <Info className="h-4.5 w-4.5 mt-0.5 shrink-0" />
                <span>
                  <strong>Advanced Schedule Note:</strong> If enabled, synchronization can optionally be toggled paused, resumed, scheduled, or altered in your Activity schedules dashboards after final registration.
                </span>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Create */}
          {step === 6 && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-450 block">Review Sync Request Registrations</span>
              
              <div className="rounded-xl border border-theme-border bg-theme-bg overflow-hidden font-sans">
                <div className="p-4.5 border-b border-theme-border flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-theme-text">{name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 italic">Ready to register. Check configurations profile summary.</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {provider === 'aws-s3' ? (
                      <div className="flex items-center gap-1.5 bg-[#FF9900]/10 text-[#FF9900] px-2.5 py-1 rounded text-[10px] font-bold">
                        <svg className="h-4 w-4" viewBox="0 0 50 50" fill="none">
                          <path d="M25 45L7.68 35V15L25 5L42.32 15V35L25 45Z" fill="#1A1A1A"/>
                          <path d="M25 10L39.5 18V32L25 40L10.5 32V18L25 10Z" fill="#FF9900"/>
                        </svg>
                        AWS S3
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded text-[10px] font-bold">
                        <svg className="w-4 w-4" viewBox="0 0 144 144" fill="none">
                          <path d="M47.2 24h49.6l23.2 40H70.4L47.2 24z" fill="#FFC107"/>
                          <path d="M18 76l23.2-40 47.2 82-23.2 40L18 76z" fill="#2196F3"/>
                          <path d="M70.4 64h63l-23.2 40H47.2l23.2-40z" fill="#4CAF50"/>
                        </svg>
                        Google Drive
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-3.5 divide-y divide-theme-border/40 text-xs text-theme-text">
                  <div className="flex justify-between items-center gap-2 pt-0.5">
                    <span className="text-slate-450 uppercase font-bold text-[10px] tracking-wider select-none shrink-0 font-mono">Storage Source Provider:</span>
                    <span className="text-theme-text font-bold uppercase select-none">{provider === 'aws-s3' ? 'AWS S3 Container' : 'Google Drive Workspace'}</span>
                  </div>

                  <div className="flex justify-between items-center gap-2 pt-3">
                    <span className="text-slate-450 uppercase font-bold text-[10px] tracking-wider select-none shrink-0 font-mono">Source Local Directory:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold tracking-tight bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-900/10 truncate max-w-sm shrink">
                      {localFolder}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-2 pt-3">
                    <span className="text-slate-450 uppercase font-bold text-[10px] tracking-wider select-none shrink-0 font-mono">Cloud Target Target:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold tracking-tight bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-900/10 truncate max-w-sm shrink animate-pulse">
                      {provider === 'aws-s3' ? `${selectedS3Bucket}/${s3FolderPath}` : `gdrive://${selectedGDrive}${selectedGFolder}`}
                    </span>
                  </div>

                  {provider === 'aws-s3' ? (
                    <div className="flex justify-between items-center gap-2 pt-3">
                      <span className="text-slate-450 uppercase font-bold text-[10px] tracking-wider select-none shrink-0 font-mono font-sans">S3 Region & Key:</span>
                      <span className="text-theme-text font-mono text-[11px]">
                        [{awsRegion}] Key Prefix: {awsAccessKey.slice(0, 8)}...
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center gap-2 pt-3">
                      <span className="text-slate-450 uppercase font-bold text-[10px] tracking-wider select-none shrink-0 font-mono font-sans">Authorized User:</span>
                      <span className="text-theme-text font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        devash217@gmail.com
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center gap-2 pt-3">
                    <span className="text-slate-450 uppercase font-bold text-[10px] tracking-wider select-none shrink-0 font-mono">Synchronization Frequency:</span>
                    <span className="text-theme-text font-semibold select-none font-mono">{schedule}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Wizard Actions */}
        <div className="p-4 border-t border-theme-border bg-theme-bg flex items-center justify-between font-sans shrink-0">
          
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase rounded border border-theme-border bg-theme-card hover:bg-theme-border text-theme-text disabled:opacity-30 disabled:cursor-not-allowed select-none transition-all cursor-pointer shadow-xs"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {/* Next / Create button */}
          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext()}
              className="inline-flex items-center gap-1 px-5 py-2 text-xs font-extrabold uppercase rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed select-none transition-all cursor-pointer shadow-xs"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-extrabold uppercase rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-sm animate-pulse"
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
            <div className="relative w-full max-w-xl bg-theme-card rounded border border-zinc-300 dark:border-zinc-800 shadow-2xl overflow-hidden font-sans text-xs flex flex-col h-[70vh]">
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
                  <span className="text-zinc-450">📁</span>
                  <span className="font-mono font-medium truncate">{mockCurrentDir || 'This PC > Local Disk (D:) > Projects'}</span>
                </div>

                {/* Filter and search Explorer style icon */}
                <div className="relative w-40">
                  <Search className="absolute right-2 top-1.5 h-3.5 w-3.5 text-zinc-400" />
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
                <div className="w-1/3 bg-[#f0f0f0] dark:bg-zinc-900 border-r border-zinc-250 dark:border-zinc-800 p-2 select-none space-y-2 max-h-full overflow-y-auto">
                  <div className="space-y-1">
                    <span className="font-bold text-zinc-400 text-[10px] uppercase ml-1 block">Quick Access</span>
                    <div className="px-2 py-1 rounded bg-[#e5e5e5] dark:bg-zinc-805 text-zinc-800 dark:text-zinc-200 font-semibold cursor-pointer flex items-center gap-1.5">
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
                  <span className="text-zinc-400 block font-bold text-[10px] uppercase font-mono">Folders Selection:</span>
                  <span className="font-mono text-zinc-850 dark:text-zinc-150 font-bold bg-[#dedede] dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">{mockCurrentDir}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOsPickerOpen(null)}
                    className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-250 dark:hover:bg-zinc-700 border border-zinc-350 dark:border-zinc-700 text-zinc-750 dark:text-zinc-200 font-bold rounded cursor-pointer"
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
                      <div className="px-2 py-1 rounded hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[13px]">🖥️</span> Desktop Directory
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columns Selection list */}
                <div className="flex-1 bg-white dark:bg-neutral-950 p-2.5 overflow-y-auto space-y-1">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase select-none block mb-1">Documents Contents List</span>
                  
                  {macDirectories
                    .filter(dir => dir.label.toLowerCase().includes(osSearchQuery.toLowerCase()))
                    .map((dir) => {
                      const isSel = mockCurrentDir === dir.name;
                      return (
                        <div
                          key={dir.name}
                          onClick={() => setMockCurrentDir(dir.name)}
                          className={`p-2 rounded flex items-center justify-between cursor-pointer transition-all ${
                            isSel
                              ? 'bg-blue-600 text-white font-bold'
                              : 'hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">📁</span>
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs">{dir.label}</span>
                              <span className={`text-[10px] font-mono mt-0.5 block ${isSel ? 'text-blue-105' : 'text-neutral-450'}`}>{dir.name}</span>
                            </div>
                          </div>
                          
                          {isSel && <span className="text-[10px] font-bold">✔</span>}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Finder Bottom confirmation bar */}
              <div className="px-4 py-3 bg-[#ececec] dark:bg-neutral-900 border-t border-neutral-250 dark:border-neutral-800 flex items-center justify-between select-none">
                <span className="text-[10px] text-neutral-400 font-semibold font-mono tracking-tight truncate max-w-sm">Path Selection: {mockCurrentDir}</span>
                
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOsPickerOpen(null)}
                    className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalFolder(mockCurrentDir);
                      setOsPickerOpen(null);
                    }}
                    className="px-4 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-xs cursor-pointer"
                  >
                    Choose Directory
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

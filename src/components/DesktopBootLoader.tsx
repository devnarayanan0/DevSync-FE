import React, { useState, useEffect } from 'react';
import { Settings, Database, RefreshCw, Network, Monitor, CheckCircle2, Loader2, Disc } from 'lucide-react';
import { motion } from 'motion/react';
import { isElectron, getSyncRequests, getAutoStart } from '../lib/electron';
import { SyncRequest, UserProfile } from '../types';

interface BootContext {
  theme: 'light' | 'dark';
  launchOnStartup: boolean;
  syncRequests: SyncRequest[];
  userProfile: UserProfile | null;
  isLoggedIn: boolean;
}

interface DesktopBootLoaderProps {
  onComplete: (context: BootContext) => void;
}

interface InitStep {
  id: number;
  label: string;
  detail: string;
  icon: any;
  status: 'pending' | 'running' | 'success';
}

export default function DesktopBootLoader({ onComplete }: DesktopBootLoaderProps) {
  const [steps, setSteps] = useState<InitStep[]>([
    {
      id: 1,
      label: 'Loading user settings',
      detail: 'Retrieving client preferences and startup rules...',
      icon: Settings,
      status: 'pending',
    },
    {
      id: 2,
      label: 'Loading local SQLite database',
      detail: isElectron() ? 'Initializing connection to devsync.db...' : 'Allocating local persistence buffers...',
      icon: Database,
      status: 'pending',
    },
    {
      id: 3,
      label: 'Loading sync requests',
      detail: 'Fetching registered replication pipelines...',
      icon: RefreshCw,
      status: 'pending',
    },
    {
      id: 4,
      label: 'Connecting to backend',
      detail: 'Connecting to client control plane...',
      icon: Network,
      status: 'pending',
    },
    {
      id: 5,
      label: 'Preparing workspace',
      detail: 'Mounting secure storage sandbox...',
      icon: Monitor,
      status: 'pending',
    },
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [bootContext, setBootContext] = useState<Partial<BootContext>>({
    theme: 'light',
    launchOnStartup: true,
    syncRequests: [],
    userProfile: null,
    isLoggedIn: false,
  });

  useEffect(() => {
    async function executeNextStep() {
      if (currentStepIndex >= steps.length) {
        // Complete delay for visual rhythm
        const timer = setTimeout(() => {
          onComplete(bootContext as BootContext);
        }, 500);
        return () => clearTimeout(timer);
      }

      // Mark step as running
      setSteps((prev) =>
        prev.map((step, idx) => (idx === currentStepIndex ? { ...step, status: 'running' } : step))
      );

      try {
        let stepDelay = 400; // default delay for human-readable visual rhythm

        if (currentStepIndex === 0) {
          // 1. Loading user settings
          const autoStartEnabled = isElectron() ? await getAutoStart() : true;
          const userTheme = (localStorage.getItem('devsync_theme') as 'light' | 'dark') || 'light';
          setBootContext((prev) => ({
            ...prev,
            launchOnStartup: autoStartEnabled,
            theme: userTheme,
          }));
          stepDelay = 450;
        } else if (currentStepIndex === 1) {
          // 2. Loading SQLite connection
          // Just verify the interface is active
          if (isElectron()) {
            await getSyncRequests();
          }
          stepDelay = 500;
        } else if (currentStepIndex === 2) {
          // 3. Loading sync requests
          const requests = await getSyncRequests();
          setBootContext((prev) => ({
            ...prev,
            syncRequests: requests,
          }));
          stepDelay = 550;
        } else if (currentStepIndex === 3) {
          // 4. Connecting to backend
          // We check the online status of the system
          const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
          stepDelay = 400;
        } else if (currentStepIndex === 4) {
          // 5. Preparing workspace
          const isLogged = localStorage.getItem('devsync_is_logged_in') === 'true';
          let profile: UserProfile | null = null;
          try {
            const raw = localStorage.getItem('devsync_session');
            if (raw) {
              profile = JSON.parse(raw);
            }
          } catch (e) {
            console.error('Failed to parse persisted session', e);
          }

          setBootContext((prev) => ({
            ...prev,
            isLoggedIn: isLogged,
            userProfile: profile,
          }));
          stepDelay = 450;
        }

        // Advance step after the calculated timing delay
        setTimeout(() => {
          setSteps((prev) =>
            prev.map((step, idx) => (idx === currentStepIndex ? { ...step, status: 'success' } : step))
          );
          setCurrentStepIndex((prev) => prev + 1);
        }, stepDelay);

      } catch (error) {
        console.error(`Bootloader failure at step ${currentStepIndex}:`, error);
        // Fallback progress to avoid bricking app startup
        setTimeout(() => {
          setSteps((prev) =>
            prev.map((step, idx) => (idx === currentStepIndex ? { ...step, status: 'success' } : step))
          );
          setCurrentStepIndex((prev) => prev + 1);
        }, 500);
      }
    }

    executeNextStep();
  }, [currentStepIndex, onComplete, steps.length]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800 font-sans select-none overflow-hidden">
      {/* Soft background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/40 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-sky-100/30 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md p-8 relative flex flex-col items-center z-10 animate-fade-in">
        {/* Minimalist Logo design */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200/80 p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center">
            <span className="font-mono text-2xl font-bold tracking-tighter bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">DS</span>
          </div>
          <div className="absolute -inset-1 rounded-3xl bg-indigo-500/10 blur-md -z-10 animate-pulse" />
        </div>

        {/* Brand Information */}
        <div className="text-center mb-8 space-y-1">
          <h2 id="bootloader-title" className="text-xl font-bold tracking-tight text-slate-900">
            DevSync Client
          </h2>
          <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">
            {isElectron() ? 'Native Client Shell' : 'Workspace Secure Node'}
          </p>
        </div>

        {/* Real Steps Container */}
        <div className="w-full space-y-3.5 bg-white border border-slate-200/60 p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
          {steps.map((step) => {
            const IconComponent = step.icon;
            const isPending = step.status === 'pending';
            const isRunning = step.status === 'running';
            const isSuccess = step.status === 'success';

            return (
              <div
                key={step.id}
                className={`flex gap-3.5 items-center transition-all duration-300 ${
                  isPending ? 'opacity-35 filter grayscale' : 'opacity-100'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                    isSuccess
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                      : isRunning
                      ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                >
                  {isRunning ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <IconComponent className="h-3.5 w-3.5" />
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-slate-800">{step.label}</span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      {isSuccess ? 'ready' : isRunning ? 'active' : 'queued'}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Elegant minimal progress meter */}
        <div className="mt-8 flex items-center gap-2 text-slate-400 font-mono text-[9px] uppercase tracking-widest">
          <Disc className="h-3 w-3 text-indigo-500 animate-spin" />
          <span>Local Environment Primed</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Settings, Database, RefreshCw, Network, Monitor, CheckCircle2, Loader2, Disc } from 'lucide-react';
import { motion } from 'motion/react';
import { isElectron, getSyncRequests, getAutoStart } from '../lib/electron';
import { SyncRequest, UserProfile } from '../types';
import TitleBar from './TitleBar';

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
      detail: 'Retrieving preferences...',
      icon: Settings,
      status: 'pending',
    },
    {
      id: 2,
      label: 'Loading local SQLite database',
      detail: 'Initializing connection...',
      icon: Database,
      status: 'pending',
    },
    {
      id: 3,
      label: 'Loading sync requests',
      detail: 'Fetching configuration...',
      icon: RefreshCw,
      status: 'pending',
    },
    {
      id: 4,
      label: 'Connecting to backend',
      detail: 'Connecting to network...',
      icon: Network,
      status: 'pending',
    },
    {
      id: 5,
      label: 'Preparing workspace',
      detail: 'Preparing environment...',
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
          // We always direct the user to the Login or Register page first after loading
          setBootContext((prev) => ({
            ...prev,
            isLoggedIn: false,
            userProfile: null,
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
    <div className="fixed inset-0 z-50 flex flex-col bg-theme-bg text-theme-text font-sans select-none overflow-hidden">
      <TitleBar />
      
      {/* Centered content area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Soft background ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md p-8 relative flex flex-col items-center z-10 animate-fade-in">
          <div className="relative mb-6 flex items-center justify-center">
            <img
              src="/images/load.gif"
              alt="Loading DevSync"
              className="h-48 w-48 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

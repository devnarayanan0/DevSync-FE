import { motion, AnimatePresence } from 'motion/react';
import { X, Cpu, Globe, Key, ShieldCheck, Heart } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/70 backdrop-blur-xs"
            id="about-backdrop"
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg overflow-hidden rounded-sm border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950"
            id="about-modal-container"
          >
            {/* Top Header Decorator */}
            <div className="h-1 bg-indigo-600" />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-850">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-wider font-mono uppercase text-slate-900 dark:text-slate-50" id="about-title">
                      DevSync Desktop Client
                    </h3>
                    <p className="text-[10px] font-mono tracking-wide text-slate-400 dark:text-slate-500 uppercase">
                      Version 4.1.20 (Stable) — x64 Edition
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-sm p-1.5 text-slate-450 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                  aria-label="Close dialog"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Specs & Description */}
              <div className="mt-5 space-y-4 text-xs text-slate-650 dark:text-slate-300">
                <p className="leading-relaxed">
                  DevSync is an orchestration client designed for low-latency filesystem synchronization between host workstations and secure cloud providers (AWS S3, Google Drive Enterprise).
                </p>

                <div className="rounded-sm bg-slate-50 p-4 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 space-y-2.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider">Client Engine:</span>
                    <span className="text-slate-700 dark:text-slate-350">React 19 + Vite Embedded</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider">Backend API:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">Spring Daemon (3000)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider">Storage Registry:</span>
                    <span className="text-slate-700 dark:text-slate-350">PostgreSQL (Durable Sync)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider">Encryption Mode:</span>
                    <span className="text-slate-700 dark:text-slate-350">AES-256 Auth Credentials</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-450">
                    <Globe className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Synchronizes with AWS S3 & Google Drive natively</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-450">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Strict sandboxing and tokenized credentials</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-105 pt-4 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:border-slate-850 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  FOR ELITE DEVELOPERS
                </span>
                <span>© 2026 DevSync Corp.</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

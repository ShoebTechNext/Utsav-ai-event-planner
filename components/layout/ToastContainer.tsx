"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useUtsav } from "@/hooks/useUtsavStore";

export function ToastContainer() {
  const { toasts, removeToast, settings } = useUtsav();

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      <div aria-live="polite" aria-atomic="true" className="flex flex-col gap-2 w-full">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === "success";
            const isError = toast.type === "error";
            const isWarning = toast.type === "warning";

            return (
              <motion.div
                key={toast.id}
                initial={settings.reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={settings.reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-glass border backdrop-blur-md ${
                  isSuccess
                    ? "bg-plum-950/90 text-ivory-100 border-saffron-500/40"
                    : isError
                      ? "bg-rose-950/90 text-ivory-100 border-rose-500/50"
                      : isWarning
                        ? "bg-plum-900/90 text-ivory-100 border-saffron-400/50"
                        : "bg-plum-950/90 text-ivory-100 border-plum-500/30"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isSuccess && <CheckCircle2 className="w-5 h-5 text-saffron-400" aria-hidden="true" />}
                  {isError && <AlertCircle className="w-5 h-5 text-rose-400" aria-hidden="true" />}
                  {isWarning && <AlertTriangle className="w-5 h-5 text-saffron-400" aria-hidden="true" />}
                  {!isSuccess && !isError && !isWarning && (
                    <Info className="w-5 h-5 text-saffron-300" aria-hidden="true" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.message && (
                    <p className="text-xs text-ivory-300/80 mt-0.5 break-words">{toast.message}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 p-1 text-ivory-400 hover:text-ivory-100 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-saffron-400"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}


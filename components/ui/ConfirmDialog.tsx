"use client";

import React from "react";
import { Modal } from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = true,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-3 my-2">
        <div className="shrink-0 p-2.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <p className="text-sm text-ivory-200/90 leading-relaxed">{message}</p>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-plum-800/80">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-medium text-ivory-300 hover:text-ivory-100 hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-saffron-400"
        >
          {cancelLabel}
        </button>

        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
            isDestructive
              ? "bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-400"
              : "bg-saffron-500 hover:bg-saffron-400 text-plum-950 focus:ring-saffron-400"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}


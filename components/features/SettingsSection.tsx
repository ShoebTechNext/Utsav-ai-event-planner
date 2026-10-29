"use client";

import React, { useState } from "react";
import {
  Sun,
  Moon,
  Laptop,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useUtsav } from "@/hooks/useUtsavStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface SettingsSectionProps {
  onOpenWizard: () => void;
}

export function SettingsSection({ onOpenWizard }: SettingsSectionProps) {
  const {
    events,
    activeEvent,
    settings,
    updateSettings,
    deleteEvent,
    resetToDemoData,
  } = useUtsav();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const targetEvent = events.find((e) => e.id === deleteTargetId);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100">
          Preferences &amp; Event Management
        </h1>
        <p className="text-xs text-ivory-300 mt-1">
          Accessibility, animations, theme, and multiple celebration management
        </p>
      </div>

      {/* Multiple Events Management */}
      <div className="p-6 rounded-2xl bg-plum-900/40 border border-plum-700/50 backdrop-blur-md shadow-glass space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-ivory-100">
              Active Celebrations ({events.length})
            </h2>
            <p className="text-xs text-ivory-300">
              Switch or delete existing celebration plans
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenWizard}
            className="px-3.5 py-2 rounded-xl bg-saffron-500 hover:bg-saffron-400 text-plum-950 font-bold text-xs"
          >
            Create New Event
          </button>
        </div>

        <div className="divide-y divide-plum-800/60 border border-plum-800/80 rounded-xl overflow-hidden bg-plum-950/40">
          {events.map((event) => {
            const isActive = event.id === activeEvent?.id;
            return (
              <div
                key={event.id}
                className="flex items-center justify-between p-3.5 hover:bg-plum-900/50 transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-ivory-100 truncate">
                      {event.name}
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-saffron-500/20 text-saffron-300 border border-saffron-500/30">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ivory-400 mt-0.5">
                    {event.type.toUpperCase()} • {event.city} • {event.date}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(event.id)}
                    className="p-1.5 text-rose-400/70 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    aria-label={`Delete event ${event.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appearance & Motion Settings */}
      <div className="p-6 rounded-2xl bg-plum-900/40 border border-plum-700/50 backdrop-blur-md shadow-glass space-y-6">
        <h2 className="font-display text-lg font-bold text-ivory-100">
          Appearance &amp; Accessibility
        </h2>

        {/* Theme */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-plum-800/80">
          <div>
            <h3 className="text-sm font-semibold text-ivory-100">Color Palette &amp; Theme</h3>
            <p className="text-xs text-ivory-400">
              Select rich aubergine dark mode, ivory light mode, or match system
            </p>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-plum-950 border border-plum-800">
            {[
              { id: "dark", label: "Dark", icon: Moon },
              { id: "light", label: "Light", icon: Sun },
              { id: "system", label: "System", icon: Laptop },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => updateSettings({ theme: t.id as "light" | "dark" | "system" })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isSelected
                      ? "bg-plum-800 text-saffron-300 font-bold shadow-sm"
                      : "text-ivory-300 hover:text-ivory-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reduced Motion Toggle */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-plum-800/80">
          <div>
            <h3 className="text-sm font-semibold text-ivory-100">Reduce Motion &amp; 3D Tilt</h3>
            <p className="text-xs text-ivory-400">
              Disables card tilt, 3D hero physics, confetti particles, and aurora animations
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.reduceMotion}
            onClick={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
            className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-saffron-400 ${
              settings.reduceMotion ? "bg-saffron-500" : "bg-plum-950 border border-plum-700"
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                settings.reduceMotion ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Currency Format */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ivory-100">Currency Display Notation</h3>
            <p className="text-xs text-ivory-400">
              Choose between standard Indian number groupings (₹15,00,000) or Lakhs (₹15 Lakh)
            </p>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-plum-950 border border-plum-800">
            <button
              type="button"
              onClick={() => updateSettings({ currencyFormat: "standard" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                settings.currencyFormat === "standard"
                  ? "bg-plum-800 text-saffron-300 font-bold"
                  : "text-ivory-300 hover:text-ivory-100"
              }`}
            >
              Standard (₹15,00,000)
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ currencyFormat: "lakhs" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                settings.currencyFormat === "lakhs"
                  ? "bg-plum-800 text-saffron-300 font-bold"
                  : "text-ivory-300 hover:text-ivory-100"
              }`}
            >
              Lakhs &amp; Cr (₹15 Lakh)
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 backdrop-blur-md space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-rose-300">Data &amp; Persistence</h2>
          <p className="text-xs text-ivory-300">
            Reset local storage to reload sample celebration data
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600/80 hover:bg-rose-600 text-white flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Data to Sample Wedding</span>
        </button>
      </div>

      {/* Confirm Delete Event Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteEvent(deleteTargetId);
        }}
        title="Delete Celebration Plan?"
        message={`Are you sure you want to permanently delete "${targetEvent?.name || "this event"}"? This action cannot be undone.`}
        confirmLabel="Delete Celebration"
      />

      {/* Confirm Reset Data Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetToDemoData}
        title="Reset All Local Data?"
        message="This will overwrite local celebration events with the original sample royal wedding. Are you sure you wish to proceed?"
        confirmLabel="Reset to Demo"
      />
    </div>
  );
}


"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { EventPlan, AppSettings, BudgetCategory, TimelineTask, VendorItem, IdeaItem } from "@/types";
import {
  loadEventsFromStorage,
  saveEventsToStorage,
  getActiveEventId,
  setActiveEventId as persistActiveId,
  loadSettings,
  saveSettings,
  resetStorageToDemo,
} from "@/lib/storage/store";
import { syncVendorCostsToCategories } from "@/lib/budget/math";

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message?: string;
}

interface UtsavContextType {
  events: EventPlan[];
  activeEvent: EventPlan | null;
  settings: AppSettings;
  aiMode: { mode: "live" | "demo"; provider: string };
  toasts: ToastMessage[];
  setActiveEvent: (id: string) => void;
  updateActiveEvent: (updater: (prev: EventPlan) => EventPlan) => void;
  saveNewEvent: (event: EventPlan) => void;
  deleteEvent: (id: string) => boolean;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetToDemoData: () => void;
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  // Domain specific helpers
  toggleTaskCompletion: (taskId: string) => void;
  updateBudgetCategory: (category: BudgetCategory) => void;
  addBudgetCategory: (category: Omit<BudgetCategory, "id">) => void;
  deleteBudgetCategory: (categoryId: string) => void;
  updateVendor: (vendor: VendorItem) => void;
  addVendor: (vendor: Omit<VendorItem, "id">) => void;
  deleteVendor: (vendorId: string) => void;
  toggleSaveIdea: (ideaId: string) => void;
  addCustomIdea: (idea: Omit<IdeaItem, "id">) => void;
}

const UtsavContext = createContext<UtsavContextType | null>(null);

export function UtsavProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventPlan[]>([]);
  const [activeEventId, setActiveIdState] = useState<string>("");
  const [settings, setSettingsState] = useState<AppSettings>({
    theme: "dark",
    reduceMotion: false,
    currencyFormat: "standard",
  });
  const [aiMode, setAiMode] = useState<{ mode: "live" | "demo"; provider: string }>({
    mode: "demo",
    provider: "none",
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from storage on mount
  useEffect(() => {
    const loadedEvents = loadEventsFromStorage();
    const currentActiveId = getActiveEventId();
    const loadedSettings = loadSettings();

    setEvents(loadedEvents);
    setActiveIdState(currentActiveId || loadedEvents[0]?.id || "");
    setSettingsState(loadedSettings);
    setIsInitialized(true);

    // Apply theme class to document element
    const root = document.documentElement;
    if (loadedSettings.theme === "dark") {
      root.classList.add("dark");
    } else if (loadedSettings.theme === "light") {
      root.classList.remove("dark");
    } else {
      // System
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }

    // Fetch AI mode from status endpoint
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        if (data?.mode) {
          setAiMode({ mode: data.mode, provider: data.provider || "none" });
        }
      })
      .catch(() => {
        // Safe demo fallback
      });
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0] || null;

  const setActiveEvent = useCallback((id: string) => {
    setActiveIdState(id);
    persistActiveId(id);
  }, []);

  const updateActiveEvent = useCallback(
    (updater: (prev: EventPlan) => EventPlan) => {
      setEvents((prevEvents) => {
        const currentActive = prevEvents.find((e) => e.id === activeEventId) || prevEvents[0];
        if (!currentActive) return prevEvents;

        const updated = updater(currentActive);
        updated.updatedAt = new Date().toISOString();

        const newEvents = prevEvents.map((e) => (e.id === updated.id ? updated : e));
        saveEventsToStorage(newEvents);
        return newEvents;
      });
    },
    [activeEventId],
  );

  const saveNewEvent = useCallback(
    (newEvent: EventPlan) => {
      setEvents((prev) => {
        const next = [newEvent, ...prev];
        saveEventsToStorage(next);
        return next;
      });
      setActiveEvent(newEvent.id);
      addToast({
        type: "success",
        title: "Celebration Plan Created!",
        message: `${newEvent.name} has been added to your dashboard.`,
      });
    },
    [setActiveEvent, addToast],
  );

  const deleteEvent = useCallback(
    (id: string) => {
      if (events.length <= 1) {
        addToast({
          type: "warning",
          title: "Cannot Delete Only Event",
          message: "You must keep at least one active celebration.",
        });
        return false;
      }

      setEvents((prev) => {
        const next = prev.filter((e) => e.id !== id);
        saveEventsToStorage(next);
        if (activeEventId === id) {
          const nextActiveId = next[0]?.id || "";
          setActiveIdState(nextActiveId);
          persistActiveId(nextActiveId);
        }
        return next;
      });

      addToast({
        type: "info",
        title: "Event Removed",
        message: "The celebration plan was deleted.",
      });
      return true;
    },
    [events.length, activeEventId, addToast],
  );

  const updateSettings = useCallback(
    (partial: Partial<AppSettings>) => {
      setSettingsState((prev) => {
        const next = { ...prev, ...partial };
        saveSettings(next);

        // Update DOM classes
        const root = document.documentElement;
        if (next.theme === "dark") {
          root.classList.add("dark");
        } else if (next.theme === "light") {
          root.classList.remove("dark");
        } else {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          if (prefersDark) root.classList.add("dark");
          else root.classList.remove("dark");
        }

        return next;
      });
      addToast({
        type: "info",
        title: "Settings Updated",
      });
    },
    [addToast],
  );

  const resetToDemoData = useCallback(() => {
    const demo = resetStorageToDemo();
    setEvents([demo]);
    setActiveIdState(demo.id);
    addToast({
      type: "success",
      title: "Reset to Demo Event",
      message: "Loaded Aarav & Meera's Royal Jaipur Wedding.",
    });
  }, [addToast]);

  // Helper: toggle task completion
  const toggleTaskCompletion = useCallback(
    (taskId: string) => {
      updateActiveEvent((prev) => {
        const updatedTimeline = prev.timeline.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t,
        );
        return { ...prev, timeline: updatedTimeline };
      });
    },
    [updateActiveEvent],
  );

  // Helper: update budget category
  const updateBudgetCategory = useCallback(
    (category: BudgetCategory) => {
      updateActiveEvent((prev) => {
        const nextCategories = prev.categories.map((c) => (c.id === category.id ? category : c));
        return { ...prev, categories: nextCategories };
      });
    },
    [updateActiveEvent],
  );

  // Helper: add category
  const addBudgetCategory = useCallback(
    (category: Omit<BudgetCategory, "id">) => {
      const id = `cat-${Date.now()}`;
      updateActiveEvent((prev) => ({
        ...prev,
        categories: [...prev.categories, { ...category, id }],
      }));
    },
    [updateActiveEvent],
  );

  // Helper: delete category
  const deleteBudgetCategory = useCallback(
    (categoryId: string) => {
      updateActiveEvent((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c.id !== categoryId),
      }));
    },
    [updateActiveEvent],
  );

  // Helper: update vendor & sync with budget spent
  const updateVendor = useCallback(
    (vendor: VendorItem) => {
      updateActiveEvent((prev) => {
        const nextVendors = prev.vendors.map((v) => (v.id === vendor.id ? vendor : v));
        const syncedCategories = syncVendorCostsToCategories(prev.categories, nextVendors);
        return {
          ...prev,
          vendors: nextVendors,
          categories: syncedCategories,
        };
      });
    },
    [updateActiveEvent],
  );

  // Helper: add vendor
  const addVendor = useCallback(
    (vendor: Omit<VendorItem, "id">) => {
      const id = `ven-${Date.now()}`;
      const newVendor: VendorItem = { ...vendor, id };
      updateActiveEvent((prev) => {
        const nextVendors = [...prev.vendors, newVendor];
        const syncedCategories = syncVendorCostsToCategories(prev.categories, nextVendors);
        return {
          ...prev,
          vendors: nextVendors,
          categories: syncedCategories,
        };
      });
    },
    [updateActiveEvent],
  );

  // Helper: delete vendor
  const deleteVendor = useCallback(
    (vendorId: string) => {
      updateActiveEvent((prev) => {
        const nextVendors = prev.vendors.filter((v) => v.id !== vendorId);
        const syncedCategories = syncVendorCostsToCategories(prev.categories, nextVendors);
        return {
          ...prev,
          vendors: nextVendors,
          categories: syncedCategories,
        };
      });
    },
    [updateActiveEvent],
  );

  // Helper: toggle save idea
  const toggleSaveIdea = useCallback(
    (ideaId: string) => {
      updateActiveEvent((prev) => ({
        ...prev,
        ideas: prev.ideas.map((i) => (i.id === ideaId ? { ...i, saved: !i.saved } : i)),
      }));
    },
    [updateActiveEvent],
  );

  // Helper: add custom idea
  const addCustomIdea = useCallback(
    (idea: Omit<IdeaItem, "id">) => {
      const id = `idea-${Date.now()}`;
      updateActiveEvent((prev) => ({
        ...prev,
        ideas: [{ ...idea, id }, ...prev.ideas],
      }));
    },
    [updateActiveEvent],
  );

  return (
    <UtsavContext.Provider
      value={{
        events,
        activeEvent,
        settings,
        aiMode,
        toasts,
        setActiveEvent,
        updateActiveEvent,
        saveNewEvent,
        deleteEvent,
        updateSettings,
        resetToDemoData,
        addToast,
        removeToast,
        toggleTaskCompletion,
        updateBudgetCategory,
        addBudgetCategory,
        deleteBudgetCategory,
        updateVendor,
        addVendor,
        deleteVendor,
        toggleSaveIdea,
        addCustomIdea,
      }}
    >
      {children}
    </UtsavContext.Provider>
  );
}

export function useUtsav() {
  const context = useContext(UtsavContext);
  if (!context) {
    throw new Error("useUtsav must be used within a UtsavProvider");
  }
  return context;
}


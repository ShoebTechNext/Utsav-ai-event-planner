import { z } from "zod";
import { EventPlan, AppSettings } from "@/types";
import { SAMPLE_WEDDING_EVENT } from "./sampleData";

const STORAGE_KEY_EVENTS = "utsav_events_v1";
const STORAGE_KEY_ACTIVE_ID = "utsav_active_event_id_v1";
const STORAGE_KEY_SETTINGS = "utsav_settings_v1";

const AppSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("dark"),
  reduceMotion: z.boolean().default(false),
  currencyFormat: z.enum(["lakhs", "standard"]).default("standard"),
});

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  reduceMotion: false,
  currencyFormat: "standard",
};

/**
 * Checks if browser localStorage is available and writable.
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__utsav_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads all events safely from localStorage. Falls back to sample data on corruption.
 */
export function loadEventsFromStorage(): EventPlan[] {
  if (!isLocalStorageAvailable()) {
    return [SAMPLE_WEDDING_EVENT];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_EVENTS);
    if (!raw) {
      // First run: seed with sample wedding
      saveEventsToStorage([SAMPLE_WEDDING_EVENT]);
      return [SAMPLE_WEDDING_EVENT];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveEventsToStorage([SAMPLE_WEDDING_EVENT]);
      return [SAMPLE_WEDDING_EVENT];
    }

    return parsed as EventPlan[];
  } catch (error) {
    // Graceful recovery from corrupted data
    console.warn("Storage corruption detected, recovering with sample event data:", error);
    saveEventsToStorage([SAMPLE_WEDDING_EVENT]);
    return [SAMPLE_WEDDING_EVENT];
  }
}

/**
 * Saves events array to localStorage.
 */
export function saveEventsToStorage(events: EventPlan[]): void {
  if (!isLocalStorageAvailable()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  } catch (error) {
    console.error("Failed to persist events to localStorage:", error);
  }
}

/**
 * Retrieves the currently active event ID.
 */
export function getActiveEventId(): string {
  if (!isLocalStorageAvailable()) {
    return SAMPLE_WEDDING_EVENT.id;
  }

  try {
    const id = window.localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (id) return id;
  } catch {
    // Ignore error
  }
  return SAMPLE_WEDDING_EVENT.id;
}

/**
 * Sets the active event ID.
 */
export function setActiveEventId(id: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (error) {
    console.error("Failed to set active event ID:", error);
  }
}

/**
 * Loads user settings safely.
 */
export function loadSettings(): AppSettings {
  if (!isLocalStorageAvailable()) {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw);
    const validated = AppSettingsSchema.safeParse(parsed);
    return validated.success ? validated.data : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Saves user settings safely.
 */
export function saveSettings(settings: AppSettings): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

/**
 * Resets storage to initial demo state.
 */
export function resetStorageToDemo(): EventPlan {
  const events = [SAMPLE_WEDDING_EVENT];
  saveEventsToStorage(events);
  setActiveEventId(SAMPLE_WEDDING_EVENT.id);
  saveSettings(DEFAULT_SETTINGS);
  return SAMPLE_WEDDING_EVENT;
}


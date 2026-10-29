import { describe, it, expect, beforeEach } from "vitest";
import {
  loadEventsFromStorage,
  saveEventsToStorage,
  loadSettings,
  saveSettings,
  resetStorageToDemo,
  getActiveEventId,
} from "@/lib/storage/store";
import { SAMPLE_WEDDING_EVENT } from "@/lib/storage/sampleData";

describe("Storage Persistence & Recovery", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("seeds with sample wedding on initial empty run", () => {
    const events = loadEventsFromStorage();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].name).toContain("Aarav & Meera");
  });

  it("persists and reloads saved events correctly", () => {
    const customEvent = {
      ...SAMPLE_WEDDING_EVENT,
      id: "custom-event-1",
      name: "Custom Birthday Bash",
    };

    saveEventsToStorage([customEvent]);
    const reloaded = loadEventsFromStorage();
    expect(reloaded.length).toBe(1);
    expect(reloaded[0].name).toBe("Custom Birthday Bash");
  });

  it("recovers gracefully without throwing on corrupted JSON data", () => {
    window.localStorage.setItem("utsav_events_v1", "INVALID_JSON_CORRUPTED{{{");
    const recovered = loadEventsFromStorage();
    expect(recovered.length).toBeGreaterThan(0);
    expect(recovered[0].id).toBe(SAMPLE_WEDDING_EVENT.id);
  });

  it("persists and retrieves user settings", () => {
    const settings = {
      theme: "light" as const,
      reduceMotion: true,
      currencyFormat: "lakhs" as const,
    };
    saveSettings(settings);
    const loaded = loadSettings();
    expect(loaded.theme).toBe("light");
    expect(loaded.reduceMotion).toBe(true);
    expect(loaded.currencyFormat).toBe("lakhs");
  });

  it("resets storage cleanly to demo data", () => {
    resetStorageToDemo();
    const events = loadEventsFromStorage();
    expect(events.length).toBe(1);
    expect(getActiveEventId()).toBe(SAMPLE_WEDDING_EVENT.id);
  });
});


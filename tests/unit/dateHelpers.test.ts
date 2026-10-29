import { describe, it, expect } from "vitest";
import {
  computeDueDate,
  formatDatePretty,
  getDaysRemaining,
  getEventCountdown,
  isTaskOverdue,
} from "@/lib/utils/date";

describe("Date Utilities", () => {
  it("computes due date by subtracting offset days from event date", () => {
    // 60 days before 2026-12-18 should be 2026-10-19
    const due = computeDueDate("2026-12-18", 60);
    expect(due).toBe("2026-10-19");
  });

  it("handles 0 offset days as the event date itself", () => {
    const due = computeDueDate("2026-12-18", 0);
    expect(due).toBe("2026-12-18");
  });

  it("formats date into pretty Indian locale string", () => {
    const formatted = formatDatePretty("2026-12-18");
    expect(formatted).toContain("18");
    expect(formatted).toContain("Dec");
    expect(formatted).toContain("2026");
  });

  it("calculates remaining days accurately", () => {
    const ref = new Date("2026-12-10T00:00:00Z");
    const diff = getDaysRemaining("2026-12-18", ref);
    expect(diff).toBe(8);
  });

  it("computes countdown values for future dates", () => {
    const now = new Date("2026-12-17T12:00:00Z");
    const countdown = getEventCountdown("2026-12-18", now);
    expect(countdown.isPast).toBe(false);
    expect(countdown.hours).toBeLessThanOrEqual(24);
  });

  it("identifies past countdown as past", () => {
    const now = new Date("2026-12-20T00:00:00Z");
    const countdown = getEventCountdown("2026-12-18", now);
    expect(countdown.isPast).toBe(true);
  });

  it("identifies overdue tasks", () => {
    const now = new Date("2026-12-15T00:00:00Z");
    expect(isTaskOverdue("2026-12-10", now)).toBe(true);
    expect(isTaskOverdue("2026-12-20", now)).toBe(false);
  });
});


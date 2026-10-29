/**
 * Date calculation and formatting utilities for celebration timelines and countdowns.
 */

/**
 * Computes a task due date by subtracting offset days from the event date.
 * (e.g. 60 days before 2026-12-15)
 */
export function computeDueDate(eventDateIso: string, offsetDays: number): string {
  const parts = eventDateIso.split("-").map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return eventDateIso;
  }

  // Create date in UTC to avoid time-zone boundary shifts
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  date.setUTCDate(date.getUTCDate() - offsetDays);

  return date.toISOString().split("T")[0];
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into a human friendly Indian format: "15 Dec 2026"
 */
export function formatDatePretty(dateIso: string): string {
  if (!dateIso) return "";
  const parts = dateIso.split("-").map(Number);
  if (parts.length < 3) return dateIso;

  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Calculates remaining days until event.
 */
export function getDaysRemaining(eventDateIso: string, referenceDate?: Date): number {
  if (!eventDateIso) return 0;
  const parts = eventDateIso.split("-").map(Number);
  if (parts.length < 3) return 0;

  const target = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  const ref = referenceDate || new Date();
  const currentUtc = new Date(Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate()));

  const diffMs = target.getTime() - currentUtc.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Returns hours/minutes/seconds countdown values for flip digits.
 */
export function getEventCountdown(
  eventDateIso: string,
  now = new Date(),
): { days: number; hours: number; minutes: number; seconds: number; isPast: boolean } {
  if (!eventDateIso) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const parts = eventDateIso.split("-").map(Number);
  if (parts.length < 3) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const target = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0));
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, isPast: false };
}

/**
 * Checks if a task due date is past today.
 */
export function isTaskOverdue(dueDateIso: string, now = new Date()): boolean {
  if (!dueDateIso) return false;
  const parts = dueDateIso.split("-").map(Number);
  if (parts.length < 3) return false;

  const due = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 23, 59, 59));
  return now.getTime() > due.getTime();
}


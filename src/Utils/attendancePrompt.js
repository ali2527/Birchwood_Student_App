/** Survives Home remounts so a dismissed pickup drawer does not pop again on errors. */
let snoozeUntil = 0;

export function snoozeAttendancePrompt(ms = 10 * 60 * 1000) {
  snoozeUntil = Date.now() + Math.max(0, ms);
}

export function clearAttendancePromptSnooze() {
  snoozeUntil = 0;
}

export function isAttendancePromptSnoozed() {
  return Date.now() < snoozeUntil;
}

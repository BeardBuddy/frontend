export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const GRID_START_HOUR = 9;
export const GRID_END_HOUR   = 18;
export const SLOT_INTERVAL   = 30;
export const MIN_SERVICE_DURATION = 20;

export const DEFAULT_TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let h = GRID_START_HOUR; h <= GRID_END_HOUR; h++) {
    for (const m of [0, 30]) {
      if (h === GRID_END_HOUR && m === 30) break;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
})();

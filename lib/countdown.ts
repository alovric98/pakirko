const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/* Parses "YYYY-MM-DD" as a local calendar date, not UTC — new Date(string)
   would parse ISO date-only strings as UTC midnight and can shift the
   result by a day depending on the user's timezone. */
function parseISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getDaysUntil(tripDate: string): number {
  const today = startOfDay(new Date());
  const trip = startOfDay(parseISODate(tripDate));
  return Math.round((trip.getTime() - today.getTime()) / MS_PER_DAY);
}

function daysWord(days: number): string {
  const abs = Math.abs(days);
  return abs % 10 === 1 && abs % 100 !== 11 ? "dan" : "dana";
}

/* Always derived from tripDate at render time — never hardcoded or cached. */
export function formatCountdown(tripDate: string | null): string | null {
  if (!tripDate) return null;
  const days = getDaysUntil(tripDate);
  if (days > 0) return `još ${days} ${daysWord(days)}`;
  if (days === 0) return "Danas!";
  return "Prošlo";
}

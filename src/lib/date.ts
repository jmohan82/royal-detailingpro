export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function startOfMonthIsoDate(reference: Date = new Date()): string {
  return `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, "0")}-01`;
}

export function formatIsoDateShort(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

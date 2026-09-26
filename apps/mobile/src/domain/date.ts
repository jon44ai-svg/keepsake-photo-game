export function dateFromExif(value: unknown): Date | null {
  if (typeof value !== "string") return null
  const match = value.match(/^(\d{4})[:\-](\d{2})[:\-](\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/)
  if (!match) return null
  const [, year, month, day, hour = "0", minute = "0", second = "0"] = match
  const date = new Date(+year, +month - 1, +day, +hour, +minute, +second)
  return date.getFullYear() === +year && date.getMonth() === +month - 1 && date.getDate() === +day
    ? date
    : null
}

export function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10)
}

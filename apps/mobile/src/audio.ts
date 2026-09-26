export const themes = [
  { id: "piano-dawn", label: "Piano Dawn", instrument: "piano", notes: [60, 64, 67, 72] },
  { id: "guitar-road", label: "Guitar Road", instrument: "guitar", notes: [55, 59, 62, 67] },
  { id: "piano-memory", label: "Piano Memory", instrument: "piano", notes: [48, 52, 55, 60] },
] as const

export type ThemeId = typeof themes[number]["id"]

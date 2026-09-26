export const themes = [
  { id: "piano-dawn", label: "Piano Dawn", instrument: "piano", tonic: 60, intervals: [0, 2, 4, 5, 7, 9, 11], relative: -3, rest: 0.15, beat: 2.6 },
  { id: "guitar-road", label: "Guitar Road", instrument: "guitar", tonic: 55, intervals: [0, 2, 4, 5, 7, 9, 10], relative: -3, rest: 0.05, beat: 1.7 },
  { id: "piano-memory", label: "Piano Memory", instrument: "piano", tonic: 48, intervals: [0, 2, 3, 5, 7, 8, 10], relative: 3, rest: 0.48, beat: 3.4 },
] as const

export type ThemeId = typeof themes[number]["id"]
export type Theme = typeof themes[number]

export function themeById(id: ThemeId): Theme {
  return themes.find((theme) => theme.id === id) ?? themes[0]
}

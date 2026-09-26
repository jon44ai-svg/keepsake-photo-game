import { themeById, type ThemeId } from "../audio"

export type ScoreState = { step: number; melody: number }

export type ScoreEvent = {
  chord: [number, number, number]
  bass: number
  melody: number | null
  tension: number
  seconds: number
}

export function tensionAt(step: number) {
  const slow = (Math.sin(step / 11) + 1) / 2
  const slower = (Math.sin(step / 29) + 1) / 2
  return slow * 0.65 + slower * 0.35
}

function tone(tonic: number, intervals: readonly number[], degree: number) {
  const wrapped = ((degree % 7) + 7) % 7
  return tonic + intervals[wrapped] + Math.floor(degree / 7) * 12
}

export function nextEvent(themeId: ThemeId, state: ScoreState): { state: ScoreState; event: ScoreEvent } {
  const theme = themeById(themeId)
  const tension = tensionAt(state.step)
  const shift = tension > 0.78 ? theme.relative : 0
  const degree = (state.step * 2 + Math.round(tension * 5) + (state.step % 5)) % 7
  const root = tone(theme.tonic + shift, theme.intervals, degree)
  const chord: [number, number, number] = [
    root,
    tone(theme.tonic + shift, theme.intervals, degree + 2),
    tone(theme.tonic + shift, theme.intervals, degree + 4),
  ]
  const bass = (tension > 0.62 ? chord[2] : chord[0]) - 12
  const delta = Math.round(Math.sin(state.step / 3.7) * 2 + Math.sin(state.step / 8.3))
  const melodyDegree = Math.max(0, Math.min(14, state.melody + delta))
  const resting = Math.sin(state.step / 5.5) < -1 + theme.rest * 2
  return {
    state: { step: state.step + 1, melody: melodyDegree },
    event: {
      chord,
      bass,
      melody: resting ? null : tone(theme.tonic + shift, theme.intervals, melodyDegree) + 12,
      tension,
      seconds: theme.beat * (0.85 + (1 - tension) * 0.35),
    },
  }
}

import { AudioContext, type OscillatorNode } from "react-native-audio-api"
import type { ThemeId } from "../audio"
import { themeById } from "../audio"
import { nextEvent, type ScoreState } from "./score"

let generation = 0
let context: AudioContext | null = null
let timer: ReturnType<typeof setInterval> | null = null
let scheduledUntil = 0
let state: ScoreState = { step: 0, melody: 7 }
let currentVolume = 0.7

export function startSoundtrack(themeId: ThemeId, volume: number) {
  stopSoundtrack()
  const token = ++generation
  context = new AudioContext()
  currentVolume = volume
  state = { step: 0, melody: 7 }
  scheduledUntil = context.currentTime
  const theme = themeById(themeId)
  const fillAhead = () => {
    if (!context || token !== generation) return
    while (scheduledUntil < context.currentTime + 4) {
      const next = nextEvent(themeId, state)
      state = next.state
      playEvent(context, next.event, scheduledUntil, theme.instrument)
      scheduledUntil += next.event.seconds
    }
  }
  fillAhead()
  timer = setInterval(fillAhead, 750)
}

function midiFrequency(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

function voice(
  audio: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  gainAmount: number,
  type: OscillatorNode["type"],
  detune = 0,
) {
  const oscillator = audio.createOscillator()
  const gain = audio.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  oscillator.detune.value = detune
  gain.gain.setValueAtTime(0.001, start)
  gain.gain.linearRampToValueAtTime(gainAmount, start + Math.min(0.08, duration / 4))
  gain.gain.setTargetAtTime(0.001, start + duration * 0.65, Math.max(0.08, duration / 5))
  oscillator.connect(gain)
  gain.connect(audio.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.4)
}

function playEvent(audio: AudioContext, event: ReturnType<typeof nextEvent>["event"], start: number, instrument: string) {
  const loudness = currentVolume * (0.012 + event.tension * 0.028)
  const type: OscillatorNode["type"] = instrument === "guitar" ? "triangle" : "sine"
  event.chord.forEach((midi, index) => {
    const frequency = midiFrequency(midi)
    voice(audio, frequency, start, event.seconds, loudness * 0.34, type, index === 1 ? -4 : index === 2 ? 4 : 0)
    if (instrument === "piano") voice(audio, frequency * 2, start, event.seconds * 0.7, loudness * 0.08, "sine")
  })
  voice(audio, midiFrequency(event.bass), start, event.seconds * 0.8, loudness * 0.45, "triangle")
  if (event.melody != null) {
    voice(audio, midiFrequency(event.melody), start, event.seconds * 0.55, loudness * 0.5, "sine")
    if (instrument === "guitar") voice(audio, midiFrequency(event.melody) * 2, start, event.seconds * 0.35, loudness * 0.12, "triangle")
  }
}

export function setSoundtrackVolume(volume: number) {
  currentVolume = volume
}

export function stopSoundtrack() {
  generation += 1
  if (timer) clearInterval(timer)
  timer = null
  const oldContext = context
  context = null
  oldContext?.close().catch(() => {})
}

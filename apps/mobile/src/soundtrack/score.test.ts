import { describe, expect, it } from "vitest"
import { nextEvent, type ScoreState } from "./score"

function walk(theme: "piano-dawn" | "guitar-road" | "piano-memory", steps: number) {
  let state: ScoreState = { step: 0, melody: 7 }
  const events = []
  for (let i = 0; i < steps; i++) {
    const next = nextEvent(theme, state)
    state = next.state
    events.push(next.event)
  }
  return events
}

describe("soundtrack score", () => {
  it("keeps tension in range and does not repeat the opening chords", () => {
    const events = walk("piano-dawn", 48)
    expect(events.every((event) => event.tension >= 0 && event.tension <= 1)).toBe(true)
    expect(events.slice(0, 4).map((event) => event.chord[0])).not.toEqual(events.slice(4, 8).map((event) => event.chord[0]))
    expect(events[0].chord).not.toEqual(events[40].chord)
  })

  it("lets memory rest more often than the road", () => {
    const memory = walk("piano-memory", 40).filter((event) => event.melody == null).length
    const road = walk("guitar-road", 40).filter((event) => event.melody == null).length
    expect(memory).toBeGreaterThan(road)
  })
})

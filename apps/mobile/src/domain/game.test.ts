import { describe, expect, it } from "vitest"
import { dateFromGuess, nextPhoto, scoreRound, type Round } from "./game"

const photos = [
  { id: "one", uri: "one", date: new Date(2024, 0, 1), latitude: 1, longitude: 1, hasFace: true },
  { id: "two", uri: "two", date: new Date(2024, 0, 2), latitude: 1, longitude: 1, hasFace: true },
]

describe("game rules", () => {
  it("rejects impossible calendar dates", () => {
    expect(dateFromGuess("2024-02-30")).toBeNull()
    expect(dateFromGuess("2024-02-29")).not.toBeNull()
  })

  it("rerolls to a different image", () => {
    const round: Round = { photos, photoIndex: 0, turn: 0, results: [], placeWinners: [] }
    expect(nextPhoto(round, () => 0).photoIndex).toBe(1)
  })

  it("awards tied closest dates and selected place points", () => {
    const round: Round = {
      photos: [photos[0]],
      photoIndex: 0,
      turn: 0,
      results: [
        { name: "Alex", guess: { date: "2024-01-02", place: "A" } },
        { name: "Sam", guess: { date: "2023-12-31", place: "B" } },
      ],
      placeWinners: ["Sam"],
    }
    expect(scoreRound(round)).toEqual({ Alex: 1, Sam: 2 })
  })
})

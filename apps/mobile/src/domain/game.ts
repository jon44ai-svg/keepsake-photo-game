export type Guess = { date: string; place: string }
export type Player = { name: string; guess: Guess }
export type Photo = { id: string; uri: string; date: Date; latitude: number; longitude: number; hasFace: boolean }

export type Round = {
  photos: Photo[]
  photoIndex: number
  turn: number
  results: Player[]
  placeWinners: string[]
}

export function nextPhoto(round: Round, random = Math.random): Round {
  if (round.photos.length < 2) return round
  const available = round.photos.map((_, index) => index).filter((index) => index !== round.photoIndex)
  return { ...round, photoIndex: available[Math.floor(random() * available.length)] }
}

export function calendarDaysApart(first: Date, second: Date): number {
  const firstDay = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate())
  const secondDay = Date.UTC(second.getFullYear(), second.getMonth(), second.getDate())
  return Math.abs(firstDay - secondDay) / 86_400_000
}

export function scoreRound(round: Round): Record<string, number> {
  const photo = round.photos[round.photoIndex]
  const distances = round.results.map(({ guess }) => {
    const date = dateFromGuess(guess.date)
    return date ? calendarDaysApart(date, photo.date) : Number.POSITIVE_INFINITY
  })
  const nearest = Math.min(...distances)
  return Object.fromEntries(round.results.map((result, index) => [
    result.name,
    Number(distances[index] === nearest) + Number(round.placeWinners.includes(result.name)),
  ]))
}

export function dateFromGuess(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const [, year, month, day] = match
  const date = new Date(+year, +month - 1, +day)
  return date.getFullYear() === +year && date.getMonth() === +month - 1 && date.getDate() === +day ? date : null
}

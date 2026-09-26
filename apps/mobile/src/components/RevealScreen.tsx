import { Image, Pressable, Text, View } from "react-native"
import { GameButton } from "./GameButton"
import { ResultRow } from "./ResultRow"
import { coordinates } from "./theme"
import { styles } from "./styles"

export type RevealPhoto = { uri: string; date: Date; latitude: number; longitude: number }
export type RevealResult = { name: string; guess: { date: string; place: string }; datePoint: boolean }

export function RevealScreen({
  photo,
  dateLabel,
  results,
  placeWinners,
  players,
  scores,
  onTogglePlace,
  onNextRound,
  onFinish,
}: {
  photo: RevealPhoto
  dateLabel: string
  results: RevealResult[]
  placeWinners: string[]
  players: string[]
  scores: Record<string, number>
  onTogglePlace: (name: string) => void
  onNextRound: () => void
  onFinish: () => void
}) {
  return (
    <>
      <Text style={styles.eyebrow}>THE MOMENT OF TRUTH</Text>
      <Text style={styles.title}>Remember this?</Text>
      <View style={styles.photoFrame}>
        <Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="cover" />
      </View>
      <View style={styles.answerCard}>
        <Text style={styles.miniLabel}>TAKEN ON</Text>
        <Text style={styles.answerTitle}>{dateLabel}</Text>
        <Text style={styles.miniLabel}>SOMEWHERE AROUND</Text>
        <Text style={styles.answerPlace}>{coordinates(photo.latitude, photo.longitude)}</Text>
        <Text style={styles.hostHint}>Ask the group: whose place guess was closest?</Text>
      </View>
      <Text style={styles.sectionLabel}>THE GUESSES</Text>
      {results.map((result) => (
        <ResultRow
          key={result.name}
          name={result.name}
          dateGuess={result.guess.date}
          placeGuess={result.guess.place}
          datePoint={result.datePoint}
          placePoint={placeWinners.includes(result.name)}
          onTogglePlace={() => onTogglePlace(result.name)}
        />
      ))}
      <Text style={styles.scoreNote}>+1 for the closest date · tap “Right place?” to award the place point</Text>
      <Text style={styles.sectionLabel}>TOTAL SCORES</Text>
      {players.map((name) => {
        const datePoint = results.some((item) => item.name === name && item.datePoint)
        return (
          <View key={name} style={styles.scoreRow}>
            <Text style={styles.resultName}>{name}</Text>
            <Text style={styles.totalScore}>{(scores[name] ?? 0) + Number(datePoint) + Number(placeWinners.includes(name))}</Text>
          </View>
        )
      })}
      <GameButton title="Play another round  →" onPress={onNextRound} />
      <Pressable onPress={onFinish} style={styles.back}>
        <Text style={styles.backText}>Finish game</Text>
      </Pressable>
    </>
  )
}

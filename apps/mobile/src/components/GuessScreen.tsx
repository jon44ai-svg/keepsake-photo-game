import { Animated, Image, Pressable, Text, TextInput, View } from "react-native"
import type { ReactNode } from "react"
import { dateFromGuess } from "../domain/game"
import { GameButton } from "./GameButton"
import { colors } from "./theme"
import { styles } from "./styles"

export type GuessPhoto = { id: string; uri: string }

export function GuessScreen({
  playerName,
  photo,
  photoOpacity,
  photoIndex,
  photoCount,
  dateGuess,
  placeGuess,
  turn,
  playerCount,
  datePicker,
  onOpenDatePicker,
  onPlaceChange,
  onReroll,
  onSubmit,
}: {
  playerName: string
  photo: GuessPhoto
  photoOpacity: Animated.Value
  photoIndex: number
  photoCount: number
  dateGuess: string
  placeGuess: string
  turn: number
  playerCount: number
  datePicker?: ReactNode
  onOpenDatePicker: () => void
  onPlaceChange: (value: string) => void
  onReroll: () => void
  onSubmit: () => void
}) {
  return (
    <>
      <Text style={styles.eyebrow}>PASS THE PHONE TO</Text>
      <Text style={styles.title}>{playerName}</Text>
      <Text style={styles.body}>Everyone else, look away. Your answer stays hidden until the reveal.</Text>
      <Animated.View style={[styles.photoFrame, { opacity: photoOpacity }]}>
        <Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="cover" />
        <View style={styles.photoTag}>
          <Text style={styles.photoTagText}>A MEMORY, UNDATED</Text>
        </View>
      </Animated.View>
      {photoCount > 1 ? (
        <View style={styles.photoActions}>
          <Text style={styles.turnCount}>
            IMAGE {photoIndex + 1} OF {photoCount}
          </Text>
          <Pressable accessibilityRole="button" onPress={onReroll}>
            <Text style={styles.addText}>Reroll image</Text>
          </Pressable>
        </View>
      ) : null}
      <Text style={styles.fieldLabel}>WHEN WAS THIS TAKEN?</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Choose guessed date" onPress={onOpenDatePicker} style={styles.answerInput}>
        <Text style={{ color: dateGuess ? colors.ink : "#9aa39c", fontSize: 14 }}>{dateGuess || "Choose a date"}</Text>
      </Pressable>
      {datePicker}
      {dateGuess.length > 0 && !dateFromGuess(dateGuess) ? <Text style={styles.dateHint}>Enter a valid date as YYYY-MM-DD.</Text> : null}
      <Text style={styles.fieldLabel}>WHERE WERE WE?</Text>
      <TextInput value={placeGuess} onChangeText={onPlaceChange} placeholder="Your best guess" placeholderTextColor="#9aa39c" style={styles.answerInput} />
      <Text style={styles.turnCount}>
        GUESS {turn + 1} OF {playerCount} · PRIVATE UNTIL REVEAL
      </Text>
      <GameButton
        title={turn + 1 === playerCount ? "Lock in my guess  →" : "Next player  →"}
        onPress={onSubmit}
        disabled={!dateFromGuess(dateGuess) || !placeGuess.trim()}
      />
    </>
  )
}

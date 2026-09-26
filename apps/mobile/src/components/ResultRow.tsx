import { Pressable, Text, View } from "react-native"
import { styles } from "./styles"

export function ResultRow({
  name,
  dateGuess,
  placeGuess,
  datePoint,
  placePoint,
  onTogglePlace,
}: {
  name: string
  dateGuess: string
  placeGuess: string
  datePoint: boolean
  placePoint: boolean
  onTogglePlace: () => void
}) {
  return (
    <View style={styles.resultRow}>
      <View style={styles.resultInitial}>
        <Text style={styles.initialText}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{name}</Text>
        <Text style={styles.resultGuess}>
          {dateGuess} · {placeGuess}
        </Text>
        <Text style={styles.scoreBreakdown}>
          Date {datePoint ? "+1" : "—"} · Place {placePoint ? "+1" : "—"}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${placePoint ? "Remove" : "Award"} place point for ${name}`}
        onPress={onTogglePlace}
        style={[styles.judgeButton, placePoint && styles.judgeSelected]}
      >
        <Text style={[styles.judgeText, placePoint && styles.judgeTextSelected]}>{placePoint ? "Place ✓" : "Right place?"}</Text>
      </Pressable>
    </View>
  )
}

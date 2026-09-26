import { Pressable, StyleSheet, Text } from "react-native"
import { colors } from "./theme"

export function GameButton({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled} style={[styles.button, disabled && styles.disabled]}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: { backgroundColor: colors.green, minHeight: 55, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 12, paddingHorizontal: 18 },
  disabled: { opacity: 0.45 },
  text: { color: "white", fontSize: 14, fontWeight: "700", letterSpacing: 0.25 },
})

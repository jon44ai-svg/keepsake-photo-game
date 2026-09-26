import { Pressable, StyleSheet, Text } from "react-native"

export function GameButton({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled} style={[styles.button, disabled && styles.disabled]}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: 14, backgroundColor: "#315e49", alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  disabled: { opacity: 0.45 },
  text: { color: "#fff", fontSize: 14, fontWeight: "700" },
})

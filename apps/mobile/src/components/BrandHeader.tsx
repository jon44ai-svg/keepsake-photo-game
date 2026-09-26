import { Pressable, Text, View } from "react-native"
import { LogoMark } from "./LogoMark"
import { styles } from "./styles"

export function BrandHeader({ round, onOpenSettings }: { round: number; onOpenSettings: () => void }) {
  return (
    <View style={styles.topline}>
      <LogoMark />
      <Text style={styles.brand}>KEEPSAKE CLUB</Text>
      <Text style={styles.round}>ROUND {String(round).padStart(2, "0")}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Open settings" onPress={onOpenSettings}>
        <Text style={styles.settingsIcon}>⚙</Text>
      </Pressable>
    </View>
  )
}

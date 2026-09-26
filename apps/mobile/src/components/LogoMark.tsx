import { View } from "react-native"
import { styles } from "./styles"

export function LogoMark() {
  return (
    <View accessible accessibilityLabel="Keepsake Club logo" style={styles.logoMark}>
      <View style={styles.logoPhoto}>
        <View style={styles.logoSun} />
        <View style={styles.logoHillBack} />
        <View style={styles.logoHillFront} />
      </View>
    </View>
  )
}

import { Text, View } from "react-native"
import { GameButton } from "./GameButton"
import { styles } from "./styles"

export function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <>
      <View style={styles.heroCopy}>
        <Text style={styles.eyebrow}>A LITTLE TIME TRAVEL</Text>
        <Text style={styles.title}>How well do you{`\n`}remember?</Text>
        <Text style={styles.body}>A photo from your camera roll. A table full of stories. Take turns guessing when and where it happened.</Text>
      </View>
      <View style={styles.previewCard}>
        <View style={styles.previewImage}>
          <Text style={styles.previewSun}>✳</Text>
          <View style={styles.hillOne} />
          <View style={styles.hillTwo} />
          <Text style={styles.previewCaption}>A moment, somewhere</Text>
        </View>
        <View style={styles.previewDetails}>
          <View>
            <Text style={styles.miniLabel}>WHEN WAS THIS?</Text>
            <Text style={styles.hiddenValue}>••••••••••</Text>
          </View>
          <View style={styles.previewDivider} />
          <View>
            <Text style={styles.miniLabel}>WHERE WAS THIS?</Text>
            <Text style={styles.hiddenValue}>••••••••</Text>
          </View>
          <View style={styles.lock}>
            <Text style={styles.lockText}>✦</Text>
          </View>
        </View>
      </View>
      <View style={styles.featureRow}>
        <Text style={styles.featureNumber}>01</Text>
        <Text style={styles.featureText}>One phone goes around the table. Guesses stay secret until everyone is in.</Text>
      </View>
      <View style={styles.featureRow}>
        <Text style={styles.featureNumber}>02</Text>
        <Text style={styles.featureText}>Closest date gets a point. The host decides whose place guess is close.</Text>
      </View>
      <GameButton title="Start a game  →" onPress={onStart} />
      <Text style={styles.footnote}>PRIVATE BY DESIGN · PHOTOS STAY ON THIS PHONE</Text>
    </>
  )
}

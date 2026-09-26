import { Pressable, Text, View } from "react-native"
import type { Settings } from "../storage"
import type { Theme } from "../audio"
import { styles } from "./styles"

export function SettingsPanel({
  settings,
  themes,
  onChange,
  onClearData,
  onClose,
}: {
  settings: Settings
  themes: Theme[]
  onChange: (next: Settings) => void
  onClearData: () => void
  onClose: () => void
}) {
  return (
    <View style={styles.settingsCard}>
      <Text style={styles.eyebrow}>YOUR KEEPSAKE</Text>
      <Text style={styles.sectionLabel}>APPEARANCE</Text>
      {(["system", "light", "dark"] as const).map((theme) => (
        <Pressable key={theme} onPress={() => onChange({ ...settings, theme })} style={styles.settingRow}>
          <Text style={styles.resultName}>{theme[0].toUpperCase() + theme.slice(1)}</Text>
          <Text style={styles.addText}>{settings.theme === theme ? "Selected" : ""}</Text>
        </Pressable>
      ))}
      <Text style={styles.sectionLabel}>PLAYBACK</Text>
      <Pressable onPress={() => onChange({ ...settings, music: !settings.music })} style={styles.settingRow}>
        <Text style={styles.resultName}>Music</Text>
        <Text style={styles.addText}>{settings.music ? "On" : "Off"}</Text>
      </Pressable>
      <View style={styles.settingRow}>
        <Text style={styles.resultName}>Volume {Math.round(settings.volume * 100)}%</Text>
        <View style={styles.volumeControls}>
          <Pressable accessibilityLabel="Lower volume" onPress={() => onChange({ ...settings, volume: Math.max(0, settings.volume - 0.1) })}>
            <Text style={styles.addText}>−</Text>
          </Pressable>
          <Pressable accessibilityLabel="Raise volume" onPress={() => onChange({ ...settings, volume: Math.min(1, settings.volume + 0.1) })}>
            <Text style={styles.addText}>＋</Text>
          </Pressable>
        </View>
      </View>
      {themes.map((theme) => (
        <Pressable key={theme.id} onPress={() => onChange({ ...settings, musicTheme: theme.id })} style={styles.settingRow}>
          <Text style={styles.resultName}>{theme.label}</Text>
          <Text style={styles.addText}>{settings.musicTheme === theme.id ? "Selected" : ""}</Text>
        </Pressable>
      ))}
      <Pressable onPress={() => onChange({ ...settings, vibration: !settings.vibration })} style={styles.settingRow}>
        <Text style={styles.resultName}>Vibration</Text>
        <Text style={styles.addText}>{settings.vibration ? "On" : "Off"}</Text>
      </Pressable>
      <Pressable onPress={() => onChange({ ...settings, facesOnly: !settings.facesOnly })} style={styles.settingRow}>
        <Text style={styles.resultName}>Only photos with faces</Text>
        <Text style={styles.addText}>{settings.facesOnly ? "On" : "Off"}</Text>
      </Pressable>
      <Pressable onPress={onClearData} style={styles.settingRow}>
        <Text style={styles.error}>Clear saved data</Text>
      </Pressable>
      <Pressable onPress={onClose} style={styles.back}>
        <Text style={styles.backText}>Close settings</Text>
      </Pressable>
    </View>
  )
}

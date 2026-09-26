import { Pressable, Text, View } from "react-native"
import { styles } from "./styles"

export type AlbumSummary = { id: string; title: string; assetCount: number }

export function AlbumOption({
  album,
  selected,
  favorited,
  blacklistedView,
  onSelect,
  onToggleFavorite,
  onHide,
  onRestore,
}: {
  album: AlbumSummary
  selected: boolean
  favorited: boolean
  blacklistedView: boolean
  onSelect: () => void
  onToggleFavorite: () => void
  onHide: () => void
  onRestore: () => void
}) {
  return (
    <View style={styles.albumOption}>
      <Pressable accessibilityRole="button" disabled={blacklistedView} onPress={onSelect} style={styles.albumSelect}>
        <Text style={styles.albumOptionName}>{album.title}</Text>
        <Text style={styles.albumCount}>
          {album.assetCount} items {selected ? "· Selected" : ""}
        </Text>
      </Pressable>
      {blacklistedView ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Restore ${album.title}`} onPress={onRestore}>
          <Text style={styles.addText}>Restore</Text>
        </Pressable>
      ) : (
        <View style={styles.albumActions}>
          <Pressable accessibilityRole="button" accessibilityLabel={`${favorited ? "Unstar" : "Star"} ${album.title}`} onPress={onToggleFavorite}>
            <Text style={styles.starText}>{favorited ? "★" : "☆"}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Blacklist ${album.title}`} onPress={onHide}>
            <Text style={styles.albumActionText}>Hide</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native"
import { AlbumOption, type AlbumSummary } from "./AlbumOption"
import { GameButton } from "./GameButton"
import { colors } from "./theme"
import { styles } from "./styles"

export function PlayersScreen({
  players,
  selectedAlbumTitle,
  albumLoaded,
  loadingAlbums,
  busy,
  message,
  showAlbumPicker,
  showBlacklistedAlbums,
  albums,
  selectedAlbumId,
  favoriteAlbumIds,
  onChangePlayer,
  onAddPlayer,
  onOpenAlbumPicker,
  onToggleBlacklistedView,
  onSelectAlbum,
  onToggleFavorite,
  onHideAlbum,
  onRestoreAlbum,
  onStartRound,
  onBack,
}: {
  players: string[]
  selectedAlbumTitle: string
  albumLoaded: boolean
  loadingAlbums: boolean
  busy: boolean
  message: string
  showAlbumPicker: boolean
  showBlacklistedAlbums: boolean
  albums: AlbumSummary[]
  selectedAlbumId: string | null
  favoriteAlbumIds: string[]
  onChangePlayer: (index: number, value: string) => void
  onAddPlayer: () => void
  onOpenAlbumPicker: () => void
  onToggleBlacklistedView: () => void
  onSelectAlbum: (album: AlbumSummary) => void
  onToggleFavorite: (album: AlbumSummary) => void
  onHideAlbum: (album: AlbumSummary) => void
  onRestoreAlbum: (album: AlbumSummary) => void
  onStartRound: () => void
  onBack: () => void
}) {
  return (
    <>
      <Text style={styles.eyebrow}>FIRST, GATHER YOUR PEOPLE</Text>
      <Text style={styles.title}>Who&apos;s around{`\n`}the table?</Text>
      <Text style={styles.body}>Add everyone playing. Pass the phone when it&apos;s their turn to guess.</Text>
      <View style={styles.playerList}>
        {players.map((name, index) => (
          <View style={styles.playerInputRow} key={index}>
            <Text style={styles.playerIndex}>{String(index + 1).padStart(2, "0")}</Text>
            <TextInput
              accessibilityLabel={`Player ${index + 1} name`}
              value={name}
              onChangeText={(value) => onChangePlayer(index, value)}
              placeholder="Player name"
              placeholderTextColor="#9aa39c"
              style={styles.input}
              returnKeyType="next"
            />
          </View>
        ))}
      </View>
      <Pressable style={styles.addPlayer} onPress={onAddPlayer}>
        <Text style={styles.addText}>＋  Add another player</Text>
      </Pressable>
      <View style={styles.albumBox}>
        <View style={styles.albumHeading}>
          <View>
            <Text style={styles.miniLabel}>PHOTO ALBUM</Text>
            <Text style={styles.albumName}>{selectedAlbumTitle}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onOpenAlbumPicker} disabled={loadingAlbums || !albumLoaded}>
            <Text style={styles.addText}>{loadingAlbums ? "Loading…" : "Change"}</Text>
          </Pressable>
        </View>
        {showAlbumPicker ? (
          <>
            <View style={styles.albumFilterRow}>
              <Text style={styles.albumCount}>{showBlacklistedAlbums ? "BLACKLISTED ALBUMS" : `${albums.length} AVAILABLE ALBUMS`}</Text>
              <Pressable accessibilityRole="button" onPress={onToggleBlacklistedView}>
                <Text style={styles.addText}>{showBlacklistedAlbums ? "Show available" : "View blacklisted"}</Text>
              </Pressable>
            </View>
            {albums.map((album) => (
              <AlbumOption
                key={album.id}
                album={album}
                selected={selectedAlbumId === album.id}
                favorited={favoriteAlbumIds.includes(album.id)}
                blacklistedView={showBlacklistedAlbums}
                onSelect={() => onSelectAlbum(album)}
                onToggleFavorite={() => onToggleFavorite(album)}
                onHide={() => onHideAlbum(album)}
                onRestore={() => onRestoreAlbum(album)}
              />
            ))}
          </>
        ) : null}
      </View>
      <View style={styles.permissionNote}>
        <Text style={styles.noteIcon}>✳</Text>
        <Text style={styles.noteText}>Keepsake scans photos on this phone and only uses pictures that have both a date and location. Nothing is uploaded.</Text>
      </View>
      {message ? <Text style={styles.error}>{message}</Text> : null}
      <GameButton
        title={!albumLoaded ? "Loading saved folder…" : busy ? "Finding your photos…" : "Find a photo  →"}
        onPress={onStartRound}
        disabled={busy || !albumLoaded}
      />
      {busy ? <ActivityIndicator color={colors.green} style={styles.spinner} /> : null}
      <Pressable onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>Go back</Text>
      </Pressable>
    </>
  )
}

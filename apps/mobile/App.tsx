import { StatusBar } from "expo-status-bar"
import * as MediaLibrary from "expo-media-library"
import { useState } from "react"
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { PermissionsAndroid } from "react-native"

type Photo = { uri: string; date: Date; latitude: number; longitude: number }
type Guess = { date: string; place: string }
type Player = { name: string; guess: Guess }
type Screen = "home" | "players" | "guess" | "reveal"

const colors = { ink: "#1e2b25", muted: "#718078", green: "#315e49", paper: "#f5f3ec", white: "#fffefa", line: "#dce1d8", orange: "#d27b50" }

function dateFromExif(value: unknown): Date | null {
  if (typeof value !== "string") return null
  const match = value.match(/^(\d{4})[:\-](\d{2})[:\-](\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/)
  if (!match) return null
  const [, year, month, day, hour = "0", minute = "0", second = "0"] = match
  const date = new Date(+year, +month - 1, +day, +hour, +minute, +second)
  return Number.isNaN(date.getTime()) ? null : date
}

function dateFromGuess(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const [, year, month, day] = match
  const date = new Date(+year, +month - 1, +day)
  return date.getFullYear() === +year && date.getMonth() === +month - 1 && date.getDate() === +day ? date : null
}

function calendarDaysApart(first: Date, second: Date) {
  const firstDay = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate())
  const secondDay = Date.UTC(second.getFullYear(), second.getMonth(), second.getDate())
  return Math.abs(firstDay - secondDay) / 86_400_000
}

function coordinates(latitude: number, longitude: number) {
  return `${Math.abs(latitude).toFixed(3)}° ${latitude < 0 ? "S" : "N"}, ${Math.abs(longitude).toFixed(3)}° ${longitude < 0 ? "W" : "E"}`
}

function Button({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled} style={[styles.button, disabled && styles.buttonDisabled]}><Text style={styles.buttonText}>{title}</Text></Pressable>
}

function LogoMark() {
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

export default function App() {
  const [screen, setScreen] = useState<Screen>("home")
  const [players, setPlayers] = useState(["", ""])
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [turn, setTurn] = useState(0)
  const [dateGuess, setDateGuess] = useState("")
  const [placeGuess, setPlaceGuess] = useState("")
  const [results, setResults] = useState<Player[]>([])
  const [placeWinners, setPlaceWinners] = useState<string[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [round, setRound] = useState(1)

  function beginSetup() {
    setPlayers(["", ""])
    setScores({})
    setRound(1)
    setMessage("")
    setScreen("players")
  }

  async function startRound() {
    const names = players.map((name) => name.trim()).filter(Boolean)
    if (names.length < 2) {
      setMessage("Add at least two players to get started.")
      return
    }
    if (new Set(names.map((name) => name.toLocaleLowerCase())).size !== names.length) {
      setMessage("Give each player a different name so scores stay clear.")
      return
    }
    setBusy(true)
    setMessage("")
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(false, ["photo"])
      if (!permission.granted) {
        setMessage("Photo access is needed to find pictures with a date and location.")
        return
      }
      if (permission.accessPrivileges && permission.accessPrivileges !== "all") {
        setMessage("Please allow access to all photos so the game can pick from your Camera album.")
        return
      }
      if (Platform.OS === "android" && Number(Platform.Version) >= 29) {
        const locationPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION)
        if (locationPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          setMessage("Allow Keepsake Club to access photo locations in Android Settings, then try again.")
          return
        }
      }
      const albums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true })
      const cameraAlbum = albums.find((album) => /camera|dcim/i.test(album.title))
      if (!cameraAlbum) {
        setMessage("We couldn't find a Camera album in your photo library.")
        return
      }
      const assets: MediaLibrary.Asset[] = []
      let page = await MediaLibrary.getAssetsAsync({ album: cameraAlbum, mediaType: [MediaLibrary.MediaType.photo], first: 500, sortBy: [[MediaLibrary.SortBy.creationTime, false]] })
      assets.push(...page.assets)
      while (page.hasNextPage) {
        page = await MediaLibrary.getAssetsAsync({ album: cameraAlbum, mediaType: [MediaLibrary.MediaType.photo], first: 500, after: page.endCursor, sortBy: [[MediaLibrary.SortBy.creationTime, false]] })
        assets.push(...page.assets)
      }
      const candidates: Photo[] = []
      let datedPhotos = 0
      let locatedPhotos = 0
      for (let offset = 0; offset < assets.length; offset += 40) {
        const batch = await Promise.all(assets.slice(offset, offset + 40).map(async (asset) => {
          try {
            const info = await MediaLibrary.getAssetInfoAsync(asset, { shouldDownloadFromNetwork: false })
            const exif = (info.exif ?? {}) as Record<string, unknown>
            const exifDate = dateFromExif(exif.DateTimeOriginal ?? exif.DateTimeDigitized ?? exif.DateTime)
            const date = exifDate ?? (asset.creationTime > 0 ? new Date(asset.creationTime) : null)
            const location = info.location
            if (date) datedPhotos++
            if (location) locatedPhotos++
            if (date && location && info.uri) return { uri: info.uri, date, latitude: location.latitude, longitude: location.longitude }
          } catch {
            // Ignore photos whose metadata cannot be read from the device.
          }
          return null
        }))
        candidates.push(...batch.filter((candidate): candidate is Photo => candidate !== null))
        setMessage(`Checking camera photos… ${Math.min(offset + 40, assets.length)} of ${assets.length}`)
      }
      if (!assets.length) {
        setMessage("Your Camera album is empty.")
        return
      }
      if (!candidates.length) {
        setMessage(`No playable photos among ${assets.length} Camera photos: ${datedPhotos} have a date and ${locatedPhotos} have GPS. Camera location tagging may be off.`)
        return
      }
      setPhoto(candidates[Math.floor(Math.random() * candidates.length)])
      setPlayers(names)
      setResults([])
      setPlaceWinners([])
      setTurn(0)
      setDateGuess("")
      setPlaceGuess("")
      setScreen("guess")
    } catch {
      setMessage("We couldn't read the photo library. Check access in Android Settings and try again.")
    } finally {
      setBusy(false)
    }
  }

  function submitGuess() {
    if (!dateFromGuess(dateGuess) || !placeGuess.trim()) return
    const next = [...results, { name: players[turn], guess: { date: dateGuess.trim(), place: placeGuess.trim() } }]
    setResults(next)
    setDateGuess("")
    setPlaceGuess("")
    if (turn + 1 === players.length) setScreen("reveal")
    else setTurn(turn + 1)
  }

  function togglePlacePoint(name: string) {
    setPlaceWinners((winners) => winners.includes(name) ? winners.filter((winner) => winner !== name) : [...winners, name])
  }

  function finishRound() {
    const nextScores = { ...scores }
    for (const result of results) {
      const guessedDate = dateFromGuess(result.guess.date)
      const days = guessedDate && photo ? calendarDaysApart(guessedDate, photo.date) : Number.POSITIVE_INFINITY
      nextScores[result.name] = (nextScores[result.name] ?? 0) + Number(Number.isFinite(days) && days === nearestDays) + Number(placeWinners.includes(result.name))
    }
    setScores(nextScores)
    setRound(round + 1)
    setMessage("")
    setScreen("players")
  }

  const dateLabel = photo?.date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
  const nearestDays = photo ? Math.min(...results.map(({ guess }) => {
    const guessedDate = dateFromGuess(guess.date)
    return guessedDate ? calendarDaysApart(guessedDate, photo.date) : Number.POSITIVE_INFINITY
  })) : Number.POSITIVE_INFINITY

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <View style={styles.topline}>
            <LogoMark />
            <Text style={styles.brand}>KEEPSAKE CLUB</Text>
            <Text style={styles.round}>ROUND {String(round).padStart(2, "0")}</Text>
          </View>

          {screen === "home" && <>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>A LITTLE TIME TRAVEL</Text>
              <Text style={styles.title}>How well do you{`\n`}remember?</Text>
              <Text style={styles.body}>A photo from your camera roll. A table full of stories. Take turns guessing when and where it happened.</Text>
            </View>
            <View style={styles.previewCard}>
              <View style={styles.previewImage}><Text style={styles.previewSun}>✳</Text><View style={styles.hillOne} /><View style={styles.hillTwo} /><Text style={styles.previewCaption}>A moment, somewhere</Text></View>
              <View style={styles.previewDetails}><View><Text style={styles.miniLabel}>WHEN WAS THIS?</Text><Text style={styles.hiddenValue}>••••••••••</Text></View><View style={styles.previewDivider} /><View><Text style={styles.miniLabel}>WHERE WAS THIS?</Text><Text style={styles.hiddenValue}>••••••••</Text></View><View style={styles.lock}><Text style={styles.lockText}>✦</Text></View></View>
            </View>
            <View style={styles.featureRow}><Text style={styles.featureNumber}>01</Text><Text style={styles.featureText}>One phone goes around the table. Guesses stay secret until everyone is in.</Text></View>
            <View style={styles.featureRow}><Text style={styles.featureNumber}>02</Text><Text style={styles.featureText}>Closest date gets a point. The host decides whose place guess is close.</Text></View>
            <Button title="Start a game  →" onPress={beginSetup} />
            <Text style={styles.footnote}>PRIVATE BY DESIGN · PHOTOS STAY ON THIS PHONE</Text>
          </>}

          {screen === "players" && <>
            <Text style={styles.eyebrow}>FIRST, GATHER YOUR PEOPLE</Text>
            <Text style={styles.title}>Who&apos;s around{`\n`}the table?</Text>
            <Text style={styles.body}>Add everyone playing. Pass the phone when it&apos;s their turn to guess.</Text>
            <View style={styles.playerList}>{players.map((name, index) => <View style={styles.playerInputRow} key={index}><Text style={styles.playerIndex}>{String(index + 1).padStart(2, "0")}</Text><TextInput accessibilityLabel={`Player ${index + 1} name`} value={name} onChangeText={(value) => setPlayers(players.map((item, i) => i === index ? value : item))} placeholder="Player name" placeholderTextColor="#9aa39c" style={styles.input} returnKeyType="next" /></View>)}</View>
            <Pressable style={styles.addPlayer} onPress={() => setPlayers([...players, ""])}><Text style={styles.addText}>＋  Add another player</Text></Pressable>
            <View style={styles.permissionNote}><Text style={styles.noteIcon}>✳</Text><Text style={styles.noteText}>Keepsake scans photos on this phone and only uses pictures that have both a date and location. Nothing is uploaded.</Text></View>
            {message ? <Text style={styles.error}>{message}</Text> : null}
            <Button title={busy ? "Finding your photos…" : "Find a photo  →"} onPress={startRound} disabled={busy} />
            {busy ? <ActivityIndicator color={colors.green} style={styles.spinner} /> : null}
            <Pressable onPress={() => setScreen("home")} style={styles.back}><Text style={styles.backText}>Go back</Text></Pressable>
          </>}

          {screen === "guess" && photo && <>
            <Text style={styles.eyebrow}>PASS THE PHONE TO</Text>
            <Text style={styles.title}>{players[turn]}</Text>
            <Text style={styles.body}>Everyone else, look away. Your answer stays hidden until the reveal.</Text>
            <View style={styles.photoFrame}><Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="cover" /><View style={styles.photoTag}><Text style={styles.photoTagText}>A MEMORY, UNDATED</Text></View></View>
            <Text style={styles.fieldLabel}>WHEN WAS THIS TAKEN?</Text>
            <TextInput accessibilityLabel="Guess the date in year-month-day format" value={dateGuess} onChangeText={setDateGuess} placeholder="YYYY-MM-DD" placeholderTextColor="#9aa39c" style={styles.answerInput} />
            {dateGuess.length > 0 && !dateFromGuess(dateGuess) ? <Text style={styles.dateHint}>Enter a valid date as YYYY-MM-DD.</Text> : null}
            <Text style={styles.fieldLabel}>WHERE WERE WE?</Text>
            <TextInput value={placeGuess} onChangeText={setPlaceGuess} placeholder="Your best guess" placeholderTextColor="#9aa39c" style={styles.answerInput} />
            <Text style={styles.turnCount}>GUESS {turn + 1} OF {players.length} · PRIVATE UNTIL REVEAL</Text>
            <Button title={turn + 1 === players.length ? "Lock in my guess  →" : "Next player  →"} onPress={submitGuess} disabled={!dateFromGuess(dateGuess) || !placeGuess.trim()} />
          </>}

          {screen === "reveal" && photo && <>
            <Text style={styles.eyebrow}>THE MOMENT OF TRUTH</Text>
            <Text style={styles.title}>Remember this?</Text>
            <View style={styles.photoFrame}><Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="cover" /></View>
            <View style={styles.answerCard}><Text style={styles.miniLabel}>TAKEN ON</Text><Text style={styles.answerTitle}>{dateLabel}</Text><Text style={styles.miniLabel}>SOMEWHERE AROUND</Text><Text style={styles.answerPlace}>{coordinates(photo.latitude, photo.longitude)}</Text><Text style={styles.hostHint}>Ask the group: whose place guess was closest?</Text></View>
            <Text style={styles.sectionLabel}>THE GUESSES</Text>
            {results.map((result) => {
              const guessedDate = dateFromGuess(result.guess.date)
              const days = guessedDate ? calendarDaysApart(guessedDate, photo.date) : Number.POSITIVE_INFINITY
              const datePoint = Number.isFinite(days) && days === nearestDays
              const placePoint = placeWinners.includes(result.name)
              return <View style={styles.resultRow} key={result.name}><View style={styles.resultInitial}><Text style={styles.initialText}>{result.name.charAt(0).toUpperCase()}</Text></View><View style={styles.resultInfo}><Text style={styles.resultName}>{result.name}</Text><Text style={styles.resultGuess}>{result.guess.date} · {result.guess.place}</Text><Text style={styles.scoreBreakdown}>Date {datePoint ? "+1" : "—"} · Place {placePoint ? "+1" : "—"}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`${placePoint ? "Remove" : "Award"} place point for ${result.name}`} onPress={() => togglePlacePoint(result.name)} style={[styles.judgeButton, placePoint && styles.judgeSelected]}><Text style={[styles.judgeText, placePoint && styles.judgeTextSelected]}>{placePoint ? "Place ✓" : "Right place?"}</Text></Pressable></View>
            })}
            <Text style={styles.scoreNote}>+1 for the closest date · tap “Right place?” to award the place point</Text>
            <Text style={styles.sectionLabel}>TOTAL SCORES</Text>
            {players.map((name) => {
              const datePoint = results.some((item) => {
                const guessedDate = dateFromGuess(item.guess.date)
                return item.name === name && guessedDate !== null && photo !== null && calendarDaysApart(guessedDate, photo.date) === nearestDays
              })
              return <View key={name} style={styles.scoreRow}><Text style={styles.resultName}>{name}</Text><Text style={styles.totalScore}>{(scores[name] ?? 0) + Number(datePoint) + Number(placeWinners.includes(name))}</Text></View>
            })}
            <Button title="Play another round  →" onPress={finishRound} />
            <Pressable onPress={() => { finishRound(); setScreen("home") }} style={styles.back}><Text style={styles.backText}>Finish game</Text></Pressable>
          </>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  fill: { flex: 1 },
  page: { width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 25, paddingTop: 12, paddingBottom: 40 },
  topline: { height: 52, flexDirection: "row", alignItems: "center", marginBottom: 37 },
  logoMark: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.green, alignItems: "center", justifyContent: "center", marginRight: 9 },
  logoPhoto: { width: 21, height: 25, borderRadius: 4, backgroundColor: colors.white, overflow: "hidden", position: "relative" },
  logoSun: { position: "absolute", width: 5, height: 5, top: 4, right: 4, borderRadius: 3, backgroundColor: colors.orange },
  logoHillBack: { position: "absolute", width: 14, height: 9, left: 0, bottom: 0, borderTopRightRadius: 9, backgroundColor: "#a7b899", transform: [{ rotate: "-8deg" }] },
  logoHillFront: { position: "absolute", width: 12, height: 7, right: -1, bottom: 0, borderTopLeftRadius: 8, backgroundColor: colors.green, transform: [{ rotate: "8deg" }] },
  brand: { fontSize: 11, letterSpacing: 1.7, fontWeight: "700", color: colors.ink },
  round: { marginLeft: "auto", fontSize: 9, letterSpacing: 1.2, color: colors.muted, fontWeight: "700" },
  heroCopy: { marginBottom: 24 },
  eyebrow: { color: colors.green, fontSize: 10, letterSpacing: 1.8, fontWeight: "700", marginBottom: 11 },
  title: { color: colors.ink, fontSize: 39, lineHeight: 43, letterSpacing: -1.3, fontFamily: "Georgia", marginBottom: 12 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21, marginBottom: 22, maxWidth: 390 },
  previewCard: { backgroundColor: colors.white, borderRadius: 19, padding: 10, marginBottom: 21, borderWidth: 1, borderColor: colors.line },
  previewImage: { height: 172, borderRadius: 12, overflow: "hidden", backgroundColor: "#d8dfcf", justifyContent: "flex-end", padding: 16 },
  previewSun: { position: "absolute", right: 24, top: 16, color: "#f2be73", fontSize: 39 },
  hillOne: { position: "absolute", height: 100, bottom: 0, left: -30, right: 110, borderTopRightRadius: 90, backgroundColor: "#93a88e", transform: [{ rotate: "-9deg" }] },
  hillTwo: { position: "absolute", height: 80, bottom: -26, left: 65, right: -28, borderTopLeftRadius: 90, backgroundColor: "#617e68", transform: [{ rotate: "-8deg" }] },
  previewCaption: { color: colors.white, fontSize: 12, fontWeight: "600", zIndex: 1 },
  previewDetails: { flexDirection: "row", alignItems: "center", paddingHorizontal: 7, paddingTop: 14, paddingBottom: 5 },
  miniLabel: { color: colors.muted, fontSize: 8, letterSpacing: 1.1, fontWeight: "700", marginBottom: 5 },
  hiddenValue: { color: colors.ink, fontSize: 14, letterSpacing: 1.5 },
  previewDivider: { height: 30, width: 1, backgroundColor: colors.line, marginHorizontal: 16 },
  lock: { marginLeft: "auto", width: 29, height: 29, borderRadius: 15, backgroundColor: "#edf1e9", alignItems: "center", justifyContent: "center" },
  lockText: { color: colors.green, fontSize: 14 },
  featureRow: { flexDirection: "row", marginBottom: 14, alignItems: "flex-start" },
  featureNumber: { color: colors.orange, fontSize: 10, fontWeight: "700", letterSpacing: 0.8, width: 33, paddingTop: 2 },
  featureText: { color: colors.ink, fontSize: 12, lineHeight: 18, flex: 1 },
  button: { backgroundColor: colors.green, minHeight: 55, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 12 },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: "white", fontSize: 14, fontWeight: "700", letterSpacing: 0.25 },
  footnote: { textAlign: "center", fontSize: 8, letterSpacing: 1.2, color: colors.muted, marginTop: 17 },
  playerList: { marginTop: 8 },
  playerInputRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: colors.line },
  playerIndex: { width: 43, color: colors.orange, fontWeight: "700", fontSize: 11 },
  input: { height: 55, flex: 1, fontSize: 16, color: colors.ink },
  addPlayer: { paddingVertical: 17 },
  addText: { color: colors.green, fontWeight: "700", fontSize: 13 },
  permissionNote: { flexDirection: "row", padding: 14, backgroundColor: "#e9ede5", borderRadius: 13, marginTop: 9, marginBottom: 15 },
  noteIcon: { color: colors.green, fontSize: 15, marginRight: 10, marginTop: 1 },
  noteText: { flex: 1, color: colors.muted, fontSize: 11, lineHeight: 17 },
  error: { color: "#a44833", fontSize: 12, lineHeight: 17, marginVertical: 8 },
  spinner: { marginTop: 14 },
  back: { alignItems: "center", padding: 17 },
  backText: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  photoFrame: { height: 300, overflow: "hidden", borderRadius: 17, backgroundColor: "#e4e5de", marginVertical: 8, position: "relative" },
  photo: { width: "100%", height: "100%" },
  photoTag: { position: "absolute", left: 12, bottom: 12, backgroundColor: "rgba(30,43,37,0.82)", borderRadius: 7, paddingVertical: 7, paddingHorizontal: 9 },
  photoTagText: { color: "white", fontSize: 8, letterSpacing: 1.1, fontWeight: "700" },
  fieldLabel: { color: colors.muted, fontSize: 9, letterSpacing: 1.2, fontWeight: "700", marginTop: 14, marginBottom: 6 },
  answerInput: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 49, color: colors.ink, fontSize: 14 },
  dateHint: { color: "#a44833", fontSize: 10, marginTop: 5 },
  turnCount: { color: colors.muted, textAlign: "center", fontSize: 8, letterSpacing: 1.2, marginTop: 18 },
  answerCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 17, marginTop: 9, marginBottom: 22 },
  answerTitle: { color: colors.ink, fontSize: 23, fontFamily: "Georgia", marginBottom: 14 },
  answerPlace: { color: colors.ink, fontSize: 14, fontWeight: "600" },
  hostHint: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 12 },
  sectionLabel: { color: colors.muted, fontSize: 9, letterSpacing: 1.4, fontWeight: "700", marginBottom: 7 },
  resultRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.line },
  resultInitial: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#e3e9df", alignItems: "center", justifyContent: "center", marginRight: 10 },
  initialText: { color: colors.green, fontWeight: "700" },
  resultInfo: { flex: 1 },
  resultName: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  resultGuess: { color: colors.muted, fontSize: 10, marginTop: 3 },
  scoreBreakdown: { color: colors.green, fontSize: 9, marginTop: 3, fontWeight: "600" },
  judgeButton: { borderWidth: 1, borderColor: colors.line, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 7 },
  judgeSelected: { backgroundColor: "#e2ece0", borderColor: colors.green },
  judgeText: { color: colors.muted, fontSize: 9, fontWeight: "700" },
  judgeTextSelected: { color: colors.green },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderColor: colors.line },
  totalScore: { color: colors.green, fontSize: 14, fontWeight: "700" },
  scoreNote: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 12, marginBottom: 7 },
})

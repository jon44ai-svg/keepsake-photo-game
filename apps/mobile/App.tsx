import { StatusBar } from "expo-status-bar"
import * as MediaLibrary from "expo-media-library"
import DateTimePicker from "@react-native-community/datetimepicker"
import * as Haptics from "expo-haptics"
import { useEffect, useRef, useState } from "react"
import { Animated, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, useColorScheme } from "react-native"
import { PermissionsAndroid } from "react-native"
import { dateFromExif } from "./src/domain/date"
import { sortAlbums as sortAlbumList } from "./src/domain/albums"
import { calendarDaysApart, dateFromGuess, nextPhoto, type Photo as DomainPhoto } from "./src/domain/game"
import { defaultSettings, storage, type Settings } from "./src/storage"
import { themes } from "./src/audio"
import { setSoundtrackVolume, startSoundtrack, stopSoundtrack } from "./src/soundtrack/play"
import { detectFaces } from "./src/faceDetection"
import { BrandHeader } from "./src/components/BrandHeader"
import { GuessScreen } from "./src/components/GuessScreen"
import { HomeScreen } from "./src/components/HomeScreen"
import { PlayersScreen } from "./src/components/PlayersScreen"
import { RevealScreen } from "./src/components/RevealScreen"
import { SettingsPanel } from "./src/components/SettingsPanel"
import { styles } from "./src/components/styles"

type Photo = DomainPhoto
type Guess = { date: string; place: string }
type Player = { name: string; guess: Guess }
type Screen = "home" | "players" | "guess" | "reveal"
type SelectedAlbum = Pick<MediaLibrary.Album, "id" | "title">

export default function App() {
  const [screen, setScreen] = useState<Screen>("home")
  const [players, setPlayers] = useState(["", ""])
  const [selectedAlbum, setSelectedAlbum] = useState<SelectedAlbum | null>(null)
  const [photoAlbums, setPhotoAlbums] = useState<MediaLibrary.Album[]>([])
  const [allPhotoAlbums, setAllPhotoAlbums] = useState<MediaLibrary.Album[]>([])
  const [showAlbumPicker, setShowAlbumPicker] = useState(false)
  const [showBlacklistedAlbums, setShowBlacklistedAlbums] = useState(false)
  const [favoriteAlbumIds, setFavoriteAlbumIds] = useState<string[]>([])
  const [blacklistedAlbumIds, setBlacklistedAlbumIds] = useState<string[]>([])
  const [loadingAlbums, setLoadingAlbums] = useState(false)
  const [albumLoaded, setAlbumLoaded] = useState(false)
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [roundPhotos, setRoundPhotos] = useState<Photo[]>([])
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const photoOpacity = useRef(new Animated.Value(1)).current
  const systemScheme = useColorScheme()
  const darkMode = settings.theme === "dark" || (settings.theme === "system" && systemScheme === "dark")
  const [turn, setTurn] = useState(0)
  const [dateGuess, setDateGuess] = useState("")
  const [placeGuess, setPlaceGuess] = useState("")
  const [results, setResults] = useState<Player[]>([])
  const [placeWinners, setPlaceWinners] = useState<string[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [round, setRound] = useState(1)

  useEffect(() => {
    Promise.all([storage.loadAlbum<SelectedAlbum>(), storage.loadSettings(), storage.loadAlbumPreferences()])
      .then(([saved, savedSettings, albumPreferences]) => {
        if (saved) setSelectedAlbum(saved)
        setSettings(savedSettings)
        setFavoriteAlbumIds(albumPreferences.favoriteIds)
        setBlacklistedAlbumIds(albumPreferences.blacklistedIds)
      })
      .catch(() => {})
      .finally(() => setAlbumLoaded(true))
  }, [])

  useEffect(() => {
    if (!albumLoaded) return
    storage.saveSettings(settings).catch(() => {})
  }, [settings, albumLoaded])

  useEffect(() => {
    if (!albumLoaded) return
    storage.saveAlbumPreferences({ favoriteIds: favoriteAlbumIds, blacklistedIds: blacklistedAlbumIds }).catch(() => {})
  }, [favoriteAlbumIds, blacklistedAlbumIds, albumLoaded])

  useEffect(() => {
    if (!albumLoaded) return
    storage
      .loadGame<{ round: number; players: string[]; scores: Record<string, number>; roundPhotos: Array<Omit<Photo, "date"> & { date: string }>; photoIndex: number }>()
      .then((saved) => {
        if (!saved || !saved.roundPhotos?.length) return
        const restored = saved.roundPhotos.map((item) => ({ ...item, date: new Date(item.date) }))
        setRound(saved.round)
        setPlayers(saved.players)
        setScores(saved.scores)
        setRoundPhotos(restored)
        setPhoto(restored[saved.photoIndex] ?? restored[0])
        setScreen("guess")
      })
      .catch(() => {})
  }, [albumLoaded])

  useEffect(() => {
    if (!photo || !roundPhotos.length) return
    storage.saveGame({ round, players, scores, roundPhotos, photoIndex: roundPhotos.findIndex((item) => item.id === photo.id) }).catch(() => {})
  }, [photo, roundPhotos, round, players, scores])

  useEffect(() => {
    photoOpacity.setValue(0.2)
    Animated.spring(photoOpacity, { toValue: 1, useNativeDriver: true }).start()
  }, [photo, photoOpacity])

  useEffect(() => {
    if (!settings.music) return
    startSoundtrack(settings.musicTheme, settings.volume)
    return () => stopSoundtrack()
  }, [settings.music, settings.musicTheme])

  useEffect(() => {
    if (settings.music) setSoundtrackVolume(settings.volume)
  }, [settings.music, settings.volume])

  function beginSetup() {
    setPlayers(["", ""])
    setScores({})
    setRound(1)
    setMessage("")
    setScreen("players")
  }

  async function getPhotoAlbums() {
    const permission = await MediaLibrary.requestPermissionsAsync(false, ["photo"])
    if (!permission.granted) {
      setMessage("Photo access is needed to choose an album.")
      return null
    }
    if (permission.accessPrivileges && permission.accessPrivileges !== "all") {
      setMessage("Please allow access to all photos to choose an album.")
      return null
    }
    return MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true })
  }

  function sortAlbums(albums: MediaLibrary.Album[], favorites = favoriteAlbumIds, blacklist = blacklistedAlbumIds) {
    return sortAlbumList(albums, favorites, blacklist)
  }

  async function openAlbumPicker() {
    setLoadingAlbums(true)
    setMessage("")
    try {
      const albums = await getPhotoAlbums()
      if (albums) {
        setAllPhotoAlbums(albums.filter((album) => album.assetCount > 0))
        setPhotoAlbums(sortAlbums(albums))
        setShowAlbumPicker(true)
      }
    } catch {
      setMessage("We couldn't read your photo albums. Check access in Android Settings and try again.")
    } finally {
      setLoadingAlbums(false)
    }
  }

  function toggleFavoriteAlbum(album: { id: string }) {
    setFavoriteAlbumIds((ids) => {
      const next = ids.includes(album.id) ? ids.filter((id) => id !== album.id) : [...ids, album.id]
      setPhotoAlbums((albums) => sortAlbums(albums, next))
      return next
    })
  }

  function toggleBlacklistedAlbum(album: { id: string }) {
    setBlacklistedAlbumIds((ids) => {
      const next = ids.includes(album.id) ? ids.filter((id) => id !== album.id) : [...ids, album.id]
      setPhotoAlbums((albums) => sortAlbums(albums, favoriteAlbumIds, next))
      return next
    })
    if (selectedAlbum?.id === album.id) {
      setSelectedAlbum(null)
      storage.saveAlbum(null).catch(() => {})
    }
  }

  function restoreAlbum(album: { id: string; title: string; assetCount: number }) {
    const full = allPhotoAlbums.find((item) => item.id === album.id)
    setBlacklistedAlbumIds((ids) => {
      const next = ids.filter((id) => id !== album.id)
      setPhotoAlbums((albums) =>
        albums.some((item) => item.id === album.id)
          ? sortAlbums(albums, favoriteAlbumIds, next)
          : full
            ? sortAlbums([...albums, full], favoriteAlbumIds, next)
            : sortAlbums(albums, favoriteAlbumIds, next),
      )
      return next
    })
  }

  async function chooseAlbum(album: { id: string; title: string }) {
    const choice = { id: album.id, title: album.title }
    try {
      await storage.saveAlbum(choice)
      setSelectedAlbum(choice)
      setShowAlbumPicker(false)
      setMessage("")
    } catch {
      setMessage("We couldn't save that album on this device. Try again.")
    }
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
      if (Platform.OS === "android" && Number(Platform.Version) >= 29) {
        const locationPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION)
        if (locationPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          setMessage("Allow Keepsake Club to access photo locations in Android Settings, then try again.")
          return
        }
      }
      const albums = await getPhotoAlbums()
      if (!albums) return
      const availableAlbums = albums.filter((album) => !blacklistedAlbumIds.includes(album.id))
      const defaultAlbum =
        availableAlbums.find((album) => album.title.trim().toLowerCase() === "camera") ??
        availableAlbums.find((album) => album.title.trim().toLowerCase() === "dcim") ??
        availableAlbums.find((album) => /^camera(?:\b|[_ -])/i.test(album.title)) ??
        availableAlbums.find((album) => /dcim/i.test(album.title))
      const cameraAlbum = selectedAlbum ? albums.find((album) => album.id === selectedAlbum.id) : defaultAlbum
      if (cameraAlbum && blacklistedAlbumIds.includes(cameraAlbum.id)) {
        setSelectedAlbum(null)
        setPhotoAlbums(sortAlbums(albums))
        setShowAlbumPicker(true)
        setMessage("Your saved album is blacklisted. Choose another photo album.")
        return
      }
      if (selectedAlbum && !cameraAlbum) {
        setPhotoAlbums(sortAlbums(albums))
        setShowAlbumPicker(true)
        setMessage("Your saved album is no longer available. Choose another photo album.")
        return
      }
      if (!cameraAlbum) {
        setPhotoAlbums(sortAlbums(albums))
        setShowAlbumPicker(true)
        setMessage("Choose a photo album to play.")
        return
      }
      const cached = await storage.loadPhotoIndex<{ albumId: string; assetCount: number; photos: Array<Omit<Photo, "date"> & { date: string }> }>()
      let candidates: Photo[] = []
      const cacheMatchesAlbum = cached?.albumId === cameraAlbum.id && cached.assetCount === cameraAlbum.assetCount
      if (cacheMatchesAlbum) {
        candidates = cached.photos.map((item) => ({ ...item, date: new Date(item.date) }))
        setMessage(`Using ${candidates.length} cached playable photos.`)
      } else {
        const assets: MediaLibrary.Asset[] = []
        let page = await MediaLibrary.getAssetsAsync({
          album: cameraAlbum,
          mediaType: [MediaLibrary.MediaType.photo],
          first: 500,
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        })
        assets.push(...page.assets)
        while (page.hasNextPage) {
          page = await MediaLibrary.getAssetsAsync({
            album: cameraAlbum,
            mediaType: [MediaLibrary.MediaType.photo],
            first: 500,
            after: page.endCursor,
            sortBy: [[MediaLibrary.SortBy.creationTime, false]],
          })
          assets.push(...page.assets)
        }
        let datedPhotos = 0
        let locatedPhotos = 0
        let metadataErrors = 0
        for (let offset = 0; offset < assets.length; offset += 40) {
          const batch = await Promise.all(
            assets.slice(offset, offset + 40).map(async (asset) => {
              try {
                const info = await MediaLibrary.getAssetInfoAsync(asset, { shouldDownloadFromNetwork: false })
                const exif = (info.exif ?? {}) as Record<string, unknown>
                const exifDate = dateFromExif(exif.DateTimeOriginal ?? exif.DateTimeDigitized ?? exif.DateTime)
                const date = exifDate ?? (asset.creationTime > 0 ? new Date(asset.creationTime) : null)
                const location = info.location
                if (date) datedPhotos++
                if (location) locatedPhotos++
                if (date && location && info.uri) {
                  const faces = await detectFaces(info.uri)
                  return { id: asset.id, uri: info.uri, date, latitude: location.latitude, longitude: location.longitude, hasFace: faces > 0 }
                }
              } catch {
                metadataErrors++
              }
              return null
            }),
          )
          candidates.push(...batch.filter((candidate): candidate is Photo => candidate !== null))
          setMessage(`Checking camera photos… ${Math.min(offset + 40, assets.length)} of ${assets.length}`)
        }
        if (!assets.length) {
          setMessage(`Your "${cameraAlbum.title}" album is empty.`)
          return
        }
        await storage.savePhotoIndex({ albumId: cameraAlbum.id, assetCount: cameraAlbum.assetCount, photos: candidates })
        if (!candidates.length) {
          setMessage(
            `No playable photos in "${cameraAlbum.title}": ${assets.length} scanned, ${datedPhotos} with a date, ${locatedPhotos} with GPS${metadataErrors ? `, ${metadataErrors} metadata reads failed` : ""}.`,
          )
          return
        }
      }
      if (!candidates.length) {
        setMessage("No playable photos are available in this album.")
        return
      }
      const playable = settings.facesOnly ? candidates.filter((candidate) => candidate.hasFace) : candidates
      if (!playable.length) {
        setMessage("No photos with detected faces were found. Turn off the face-only filter or choose another album.")
        return
      }
      const selected = playable.sort(() => Math.random() - 0.5).slice(0, Math.min(5, playable.length))
      setRoundPhotos(selected)
      setPhoto(selected[0])
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
    setPlaceWinners((winners) => (winners.includes(name) ? winners.filter((winner) => winner !== name) : [...winners, name]))
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
  const nearestDays = photo
    ? Math.min(
        ...results.map(({ guess }) => {
          const guessedDate = dateFromGuess(guess.date)
          return guessedDate ? calendarDaysApart(guessedDate, photo.date) : Number.POSITIVE_INFINITY
        }),
      )
    : Number.POSITIVE_INFINITY

  const pickerAlbums = (
    showBlacklistedAlbums ? allPhotoAlbums.filter((album) => blacklistedAlbumIds.includes(album.id)) : photoAlbums
  ).map((album) => ({ id: album.id, title: album.title, assetCount: album.assetCount }))

  return (
    <SafeAreaView style={[styles.safe, darkMode && styles.safeDark]}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <BrandHeader round={round} onOpenSettings={() => setShowSettings(true)} />

          {showSettings ? (
            <SettingsPanel
              settings={settings}
              themes={[...themes]}
              onChange={setSettings}
              onClearData={() =>
                storage.clearAll().then(() => {
                  setSelectedAlbum(null)
                  setSettings(defaultSettings)
                  setMessage("Saved data cleared.")
                })
              }
              onClose={() => setShowSettings(false)}
            />
          ) : null}

          {screen === "home" ? <HomeScreen onStart={beginSetup} /> : null}

          {screen === "players" ? (
            <PlayersScreen
              players={players}
              selectedAlbumTitle={selectedAlbum?.title ?? "Camera (default)"}
              albumLoaded={albumLoaded}
              loadingAlbums={loadingAlbums}
              busy={busy}
              message={message}
              showAlbumPicker={showAlbumPicker}
              showBlacklistedAlbums={showBlacklistedAlbums}
              albums={pickerAlbums}
              selectedAlbumId={selectedAlbum?.id ?? null}
              favoriteAlbumIds={favoriteAlbumIds}
              onChangePlayer={(index, value) => setPlayers(players.map((item, i) => (i === index ? value : item)))}
              onAddPlayer={() => setPlayers([...players, ""])}
              onOpenAlbumPicker={openAlbumPicker}
              onToggleBlacklistedView={() => setShowBlacklistedAlbums(!showBlacklistedAlbums)}
              onSelectAlbum={chooseAlbum}
              onToggleFavorite={toggleFavoriteAlbum}
              onHideAlbum={toggleBlacklistedAlbum}
              onRestoreAlbum={restoreAlbum}
              onStartRound={startRound}
              onBack={() => setScreen("home")}
            />
          ) : null}

          {screen === "guess" && photo ? (
            <GuessScreen
              playerName={players[turn]}
              photo={photo}
              photoOpacity={photoOpacity}
              photoIndex={roundPhotos.findIndex((item) => item.id === photo.id)}
              photoCount={roundPhotos.length}
              dateGuess={dateGuess}
              placeGuess={placeGuess}
              turn={turn}
              playerCount={players.length}
              datePicker={
                showDatePicker ? (
                  <DateTimePicker
                    value={dateFromGuess(dateGuess) ?? new Date()}
                    mode="date"
                    onChange={(_, value) => {
                      setShowDatePicker(false)
                      if (value) setDateGuess(value.toISOString().slice(0, 10))
                    }}
                  />
                ) : null
              }
              onOpenDatePicker={() => setShowDatePicker(true)}
              onPlaceChange={setPlaceGuess}
              onReroll={() => {
                const next = nextPhoto({
                  photos: roundPhotos,
                  photoIndex: roundPhotos.findIndex((item) => item.id === photo.id),
                  turn,
                  results,
                  placeWinners,
                })
                setPhoto(next.photos[next.photoIndex])
                if (settings.vibration) Haptics.selectionAsync()
              }}
              onSubmit={submitGuess}
            />
          ) : null}

          {screen === "reveal" && photo && dateLabel ? (
            <RevealScreen
              photo={photo}
              dateLabel={dateLabel}
              results={results.map((result) => {
                const guessedDate = dateFromGuess(result.guess.date)
                const days = guessedDate ? calendarDaysApart(guessedDate, photo.date) : Number.POSITIVE_INFINITY
                return { ...result, datePoint: Number.isFinite(days) && days === nearestDays }
              })}
              placeWinners={placeWinners}
              players={players}
              scores={scores}
              onTogglePlace={togglePlacePoint}
              onNextRound={finishRound}
              onFinish={() => {
                finishRound()
                setScreen("home")
              }}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

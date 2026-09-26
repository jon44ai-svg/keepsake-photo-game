import AsyncStorage from "@react-native-async-storage/async-storage"

const keys = {
  album: "keepsake.album",
  game: "keepsake.game",
  settings: "keepsake.settings",
  photoIndex: "keepsake.photo-index",
  albumPreferences: "keepsake.album-preferences",
} as const

export type Settings = {
  theme: "light" | "dark" | "system"
  volume: number
  music: boolean
  musicTheme: "piano-dawn" | "guitar-road" | "piano-memory"
  vibration: boolean
  facesOnly: boolean
  scanBatchSize: number
}

export const defaultSettings: Settings = {
  theme: "system",
  volume: 0.7,
  music: true,
  musicTheme: "piano-dawn",
  vibration: true,
  facesOnly: false,
  scanBatchSize: 40,
}

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key)
    if (!value) return fallback
    const parsed: unknown = JSON.parse(value)
    if (fallback && typeof fallback === "object" && !Array.isArray(fallback) && parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return { ...fallback, ...parsed } as T
    }
    return parsed as T
  } catch {
    return fallback
  }
}

export const storage = {
  loadSettings: () => read(keys.settings, defaultSettings),
  saveSettings: (settings: Settings) => AsyncStorage.setItem(keys.settings, JSON.stringify(settings)),
  loadGame: <T>() => read<T | null>(keys.game, null),
  saveGame: (game: unknown) => AsyncStorage.setItem(keys.game, JSON.stringify(game)),
  loadPhotoIndex: <T>() => read<T | null>(keys.photoIndex, null),
  savePhotoIndex: (photos: unknown) => AsyncStorage.setItem(keys.photoIndex, JSON.stringify(photos)),
  clearPhotoIndex: () => AsyncStorage.removeItem(keys.photoIndex),
  clearGame: () => AsyncStorage.removeItem(keys.game),
  saveAlbum: (album: unknown) => AsyncStorage.setItem(keys.album, JSON.stringify(album)),
  loadAlbum: <T>() => read<T | null>(keys.album, null),
  loadAlbumPreferences: () => read(keys.albumPreferences, { favoriteIds: [] as string[], blacklistedIds: [] as string[] }),
  saveAlbumPreferences: (preferences: { favoriteIds: string[]; blacklistedIds: string[] }) => AsyncStorage.setItem(keys.albumPreferences, JSON.stringify(preferences)),
  clearAll: () => AsyncStorage.multiRemove(Object.values(keys)),
}

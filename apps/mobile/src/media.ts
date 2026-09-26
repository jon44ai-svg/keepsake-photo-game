import * as MediaLibrary from "expo-media-library"
import FaceDetection from "@react-native-ml-kit/face-detection"
import { dateFromExif } from "./domain/date"
import type { Photo } from "./domain/game"

export type SelectedAlbum = Pick<MediaLibrary.Album, "id" | "title">

export async function requestPhotoAccess() {
  return MediaLibrary.requestPermissionsAsync(false, ["photo"])
}

export async function listAlbums() {
  const permission = await requestPhotoAccess()
  if (!permission.granted || permission.accessPrivileges === "limited") return []
  return (await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true })).filter((album) => album.assetCount > 0)
}

export async function scanAlbum(album: MediaLibrary.Album, onProgress?: (value: string) => void): Promise<Photo[]> {
  const assets: MediaLibrary.Asset[] = []
  let page = await MediaLibrary.getAssetsAsync({
    album,
    mediaType: [MediaLibrary.MediaType.photo],
    first: 500,
    sortBy: [[MediaLibrary.SortBy.creationTime, false]],
  })
  assets.push(...page.assets)
  while (page.hasNextPage) {
    page = await MediaLibrary.getAssetsAsync({
      album,
      mediaType: [MediaLibrary.MediaType.photo],
      first: 500,
      after: page.endCursor,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    })
    assets.push(...page.assets)
  }

  const candidates: Photo[] = []
  for (let offset = 0; offset < assets.length; offset += 40) {
    const batch = await Promise.all(assets.slice(offset, offset + 40).map(async (asset) => {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(asset, { shouldDownloadFromNetwork: false })
        const exif = (info.exif ?? {}) as Record<string, unknown>
        const date = dateFromExif(exif.DateTimeOriginal ?? exif.DateTimeDigitized ?? exif.DateTime)
        const location = info.location
        if (!date || !location || !info.uri) return null
        const faces = await FaceDetection.detect(info.uri)
        return {
          id: asset.id,
          uri: info.uri,
          date,
          latitude: location.latitude,
          longitude: location.longitude,
          hasFace: faces.length > 0,
        }
      } catch {
        return null
      }
    }))
    candidates.push(...batch.filter((photo): photo is Photo => photo !== null))
    onProgress?.(`Checking photos… ${Math.min(offset + 40, assets.length)} of ${assets.length}`)
  }
  return candidates
}

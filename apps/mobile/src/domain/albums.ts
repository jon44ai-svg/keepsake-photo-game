export type AlbumSummary = { id: string; title: string; assetCount: number }

export function sortAlbums<T extends AlbumSummary>(albums: T[], favoriteIds: string[], blacklistedIds: string[]): T[] {
  return albums
    .filter((album) => album.assetCount > 0 && !blacklistedIds.includes(album.id))
    .sort((first, second) => Number(favoriteIds.includes(second.id)) - Number(favoriteIds.includes(first.id)) || second.assetCount - first.assetCount || first.title.localeCompare(second.title))
}

import { describe, expect, it } from "vitest"
import { sortAlbums } from "./albums"

describe("album ordering", () => {
  it("puts starred albums first, then sorts by image count and hides blacklisted albums", () => {
    const albums = [
      { id: "small", title: "Small", assetCount: 10 },
      { id: "starred", title: "Starred", assetCount: 1 },
      { id: "hidden", title: "Hidden", assetCount: 100 },
    ]
    expect(sortAlbums(albums, ["starred"], ["hidden"]).map((album) => album.id)).toEqual(["starred", "small"])
  })
})

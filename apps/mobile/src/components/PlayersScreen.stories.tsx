import type { Meta, StoryObj } from "@storybook/react-native"
import { PlayersScreen } from "./PlayersScreen"

const albums = [
  { id: "1", title: "Camera", assetCount: 412 },
  { id: "2", title: "Trip — Lisbon", assetCount: 88 },
  { id: "3", title: "Screenshots", assetCount: 1204 },
]

const noop = () => {}

const meta = {
  title: "Screens/Players",
  component: PlayersScreen,
  args: {
    players: ["Sam", "Alex", ""],
    selectedAlbumTitle: "Camera (default)",
    albumLoaded: true,
    loadingAlbums: false,
    busy: false,
    message: "",
    showAlbumPicker: false,
    showBlacklistedAlbums: false,
    albums,
    selectedAlbumId: "1",
    favoriteAlbumIds: ["1"],
    onChangePlayer: noop,
    onAddPlayer: noop,
    onOpenAlbumPicker: noop,
    onToggleBlacklistedView: noop,
    onSelectAlbum: noop,
    onToggleFavorite: noop,
    onHideAlbum: noop,
    onRestoreAlbum: noop,
    onStartRound: noop,
    onBack: noop,
  },
} satisfies Meta<typeof PlayersScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const AlbumPickerOpen: Story = { args: { showAlbumPicker: true } }
export const Scanning: Story = { args: { busy: true, message: "Checking camera photos… 120 of 412" } }
export const ErrorMessage: Story = { args: { message: "Add at least two players to get started." } }

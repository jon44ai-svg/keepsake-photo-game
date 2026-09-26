import type { Meta, StoryObj } from "@storybook/react-native"
import { AlbumOption } from "./AlbumOption"

const album = { id: "1", title: "Camera", assetCount: 412 }

const meta = {
  title: "Albums/AlbumOption",
  component: AlbumOption,
  args: {
    album,
    selected: false,
    favorited: false,
    blacklistedView: false,
    onSelect: () => {},
    onToggleFavorite: () => {},
    onHide: () => {},
    onRestore: () => {},
  },
} satisfies Meta<typeof AlbumOption>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const SelectedFavorite: Story = { args: { selected: true, favorited: true } }
export const Blacklisted: Story = { args: { blacklistedView: true } }

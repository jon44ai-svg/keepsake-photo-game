import type { Meta, StoryObj } from "@storybook/react-native"
import { GameButton } from "./GameButton"

const meta = {
  title: "Controls/GameButton",
  component: GameButton,
  args: { title: "Start a game", onPress: () => {} },
} satisfies Meta<typeof GameButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }

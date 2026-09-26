import type { Meta, StoryObj } from "@storybook/react-native"
import { HomeScreen } from "./HomeScreen"

const meta = {
  title: "Screens/Home",
  component: HomeScreen,
  args: { onStart: () => {} },
} satisfies Meta<typeof HomeScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

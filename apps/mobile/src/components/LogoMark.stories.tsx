import type { Meta, StoryObj } from "@storybook/react-native"
import { LogoMark } from "./LogoMark"

const meta = {
  title: "Brand/LogoMark",
  component: LogoMark,
} satisfies Meta<typeof LogoMark>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

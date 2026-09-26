import type { Meta, StoryObj } from "@storybook/react-native"
import { BrandHeader } from "./BrandHeader"

const meta = {
  title: "Brand/BrandHeader",
  component: BrandHeader,
  args: { round: 1, onOpenSettings: () => {} },
} satisfies Meta<typeof BrandHeader>

export default meta
type Story = StoryObj<typeof meta>

export const RoundOne: Story = {}
export const RoundTwelve: Story = { args: { round: 12 } }

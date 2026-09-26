import type { Meta, StoryObj } from "@storybook/react-native"
import { ResultRow } from "./ResultRow"

const meta = {
  title: "Reveal/ResultRow",
  component: ResultRow,
  args: {
    name: "Sam",
    dateGuess: "2019-06-12",
    placeGuess: "Lisbon",
    datePoint: true,
    placePoint: false,
    onTogglePlace: () => {},
  },
} satisfies Meta<typeof ResultRow>

export default meta
type Story = StoryObj<typeof meta>

export const DateWinner: Story = {}
export const PlaceAwarded: Story = { args: { datePoint: false, placePoint: true } }
export const NoPoints: Story = { args: { datePoint: false, placePoint: false } }

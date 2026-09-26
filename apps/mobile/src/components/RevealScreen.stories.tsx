import type { Meta, StoryObj } from "@storybook/react-native"
import { RevealScreen } from "./RevealScreen"

const photo = {
  uri: "https://picsum.photos/seed/keepsake-reveal/800/600",
  date: new Date("2019-06-12"),
  latitude: 38.7223,
  longitude: -9.1393,
}

const noop = () => {}

const meta = {
  title: "Screens/Reveal",
  component: RevealScreen,
  args: {
    photo,
    dateLabel: "June 12, 2019",
    results: [
      { name: "Sam", guess: { date: "2019-06-10", place: "Lisbon" }, datePoint: true },
      { name: "Alex", guess: { date: "2017-01-01", place: "Porto" }, datePoint: false },
      { name: "Jordan", guess: { date: "2019-07-01", place: "Sintra" }, datePoint: false },
    ],
    placeWinners: ["Sam"],
    players: ["Sam", "Alex", "Jordan"],
    scores: { Sam: 2, Alex: 1, Jordan: 0 },
    onTogglePlace: noop,
    onCopyCoordinates: noop,
    onNextRound: noop,
    onFinish: noop,
  },
} satisfies Meta<typeof RevealScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const NoPlaceYet: Story = { args: { placeWinners: [] } }

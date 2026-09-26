import type { Meta, StoryObj } from "@storybook/react-native"
import { Animated } from "react-native"
import { GuessScreen } from "./GuessScreen"

const photo = { id: "p1", uri: "https://picsum.photos/seed/keepsake/800/600" }
const opacity = new Animated.Value(1)
const noop = () => {}

const meta = {
  title: "Screens/Guess",
  component: GuessScreen,
  args: {
    playerName: "Sam",
    photo,
    photoOpacity: opacity,
    photoIndex: 0,
    photoCount: 3,
    dateGuess: "",
    placeGuess: "",
    turn: 0,
    playerCount: 3,
    onOpenDatePicker: noop,
    onPlaceChange: noop,
    onReroll: noop,
    onSubmit: noop,
  },
} satisfies Meta<typeof GuessScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}
export const Filled: Story = {
  args: { dateGuess: "2018-04-22", placeGuess: "Barcelona", turn: 2, playerCount: 3 },
}
export const LastPlayer: Story = {
  args: { dateGuess: "2020-01-01", placeGuess: "Home", turn: 2, playerCount: 3 },
}

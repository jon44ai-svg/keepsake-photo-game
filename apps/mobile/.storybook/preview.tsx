import type { Preview } from "@storybook/react-native"
import { ScrollView, View } from "react-native"
import { colors } from "../src/components/theme"

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: colors.paper }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 25, paddingTop: 12, paddingBottom: 40, maxWidth: 560, width: "100%", alignSelf: "center" }}>
          <Story />
        </ScrollView>
      </View>
    ),
  ],
}

export default preview

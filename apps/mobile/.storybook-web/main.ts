import type { StorybookConfig } from "@storybook/react-native-web-vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  framework: {
    name: "@storybook/react-native-web-vite",
    options: {},
  },
  addons: [],
}

export default config

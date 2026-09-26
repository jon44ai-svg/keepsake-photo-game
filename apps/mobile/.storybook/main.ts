import type { StorybookConfig } from "@storybook/react-native"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [],
  framework: "@storybook/react-native",
}

export default config

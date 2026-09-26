import { registerRootComponent } from "expo"

const isStorybook = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true"

const Root = isStorybook
  ? require("./.storybook").default
  : require("./App").default

registerRootComponent(Root)

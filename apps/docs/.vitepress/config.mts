import { defineConfig } from "vitepress"

export default defineConfig({
  title: "Keepsake Club",
  description: "Local-first pass-the-phone photo guessing game",
  ignoreDeadLinks: [/\/storybook/],
  themeConfig: {
    nav: [
      { text: "Guide", link: "/" },
      { text: "Storybook", link: "/storybook/", target: "_blank" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Overview", link: "/" },
          { text: "Architecture", link: "/architecture" },
          { text: "Build pipeline", link: "/build-pipeline" },
          { text: "Components", link: "/components" },
          { text: "Dependencies", link: "/dependencies" },
          { text: "Storybook", link: "/storybook-guide" },
          { text: "Testing", link: "/testing" },
          { text: "Decisions", link: "/decisions" },
        ],
      },
    ],
  },
})

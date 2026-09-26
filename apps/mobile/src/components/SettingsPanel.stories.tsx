import type { Meta, StoryObj } from "@storybook/react-native"
import { useState } from "react"
import { themes } from "../audio"
import { defaultSettings, type Settings } from "../storage"
import { SettingsPanel } from "./SettingsPanel"

function Interactive(args: { settings: Settings }) {
  const [settings, setSettings] = useState(args.settings)
  return <SettingsPanel settings={settings} themes={[...themes]} onChange={setSettings} onClearData={() => {}} onClose={() => {}} />
}

const meta = {
  title: "Settings/SettingsPanel",
  component: SettingsPanel,
  args: {
    settings: defaultSettings,
    themes: [...themes],
    onChange: () => {},
    onClearData: () => {},
    onClose: () => {},
  },
  render: (args) => <Interactive settings={args.settings} />,
} satisfies Meta<typeof SettingsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const MusicOff: Story = {
  args: { settings: { ...defaultSettings, music: false, vibration: false, facesOnly: true } },
}

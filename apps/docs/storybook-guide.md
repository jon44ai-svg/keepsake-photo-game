# Storybook

Stories live next to components: `apps/mobile/src/**/*.stories.tsx`.

Two hosts share those files:

| Host | Command | Use |
|------|---------|-----|
| Web (`react-native-web`) | `pnpm storybook:web` | Browser UI review; static build under `/storybook/` on the docs site |
| On-device (`@storybook/react-native`) | `pnpm storybook:android` | Real native views on emulator/device |

Screens and controls use mocked props in Storybook. Permissions, EXIF, ML Kit, haptics, and audio still need the real app smoke path.

## Web

```bash
pnpm storybook:web
# http://localhost:7007
```

Static output for Vercel is produced by `pnpm docs:build` into `apps/docs/public/storybook`.

## On-device

```bash
pnpm storybook:android
```

Sets `EXPO_PUBLIC_STORYBOOK_ENABLED=true` so Metro includes Storybook and the app entry mounts the on-device UI instead of the game.

## Stories

- Brand: LogoMark, BrandHeader
- Controls: GameButton
- Settings: SettingsPanel
- Albums: AlbumOption
- Screens: Home, Players, Guess, Reveal
- Reveal: ResultRow

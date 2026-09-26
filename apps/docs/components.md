# Components

Presentational UI lives under `apps/mobile/src/components/`. `App.tsx` owns side effects (permissions, media, storage, haptics, audio) and passes props into these pieces.

## Brand & controls

| Component | Stories |
|-----------|---------|
| `LogoMark` | Brand/LogoMark |
| `BrandHeader` | Brand/BrandHeader |
| `GameButton` | Controls/GameButton |

## Settings & albums

| Component | Stories |
|-----------|---------|
| `SettingsPanel` | Settings/SettingsPanel |
| `AlbumOption` | Albums/AlbumOption |

## Screens

Screens are Storybook-friendly with mocked data. Native APIs stay in `App`.

| Component | Stories |
|-----------|---------|
| `HomeScreen` | Screens/Home |
| `PlayersScreen` | Screens/Players |
| `GuessScreen` | Screens/Guess |
| `RevealScreen` | Screens/Reveal |
| `ResultRow` | Reveal/ResultRow |

Open the built Storybook at [/storybook/](/storybook/) after `pnpm docs:build`, or run `pnpm storybook:web`.

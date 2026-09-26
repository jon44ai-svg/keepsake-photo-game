# Components

Most UI still lives in `apps/mobile/App.tsx` as screen coordinators (`home`, `players`, `guess`, `reveal`) plus small local helpers (`Button`, `LogoMark`).

Reusable presentational pieces live under `apps/mobile/src/components/` and are the ones covered by Storybook.

## Extracted components

### `GameButton`

Primary action control used for game CTAs. Props: `title`, `onPress`, `disabled?`.

Stories: [Controls/GameButton](/storybook/?path=/story/controls-gamebutton--default) (after `pnpm docs:build` or while `pnpm storybook:web` is running).

## Screens (in `App.tsx`)

| Screen | Purpose |
|--------|---------|
| `home` | Permissions, album pick, settings, start |
| `players` | Player names before a round |
| `guess` | Private date/place guesses; pass-the-phone |
| `reveal` | Scores and truth; next round / restart |

New presentational components should be extracted under `src/components/`, get a `*.stories.tsx`, and be listed here.

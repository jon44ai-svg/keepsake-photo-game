# Keepsake Club decisions

## Current product shape

- Android-first, local-only pass-the-phone photo guessing game.
- Prototype scope is approximately 100 hours of human development time.
- Core game loop comes before polish and optional integrations.
- Photo capture dates must come from validated EXIF metadata; library/import dates are not silently used as capture dates.
- Music themes are live `react-native-audio-api` scores on the device. They are not recorded files and they are not uploaded.

## Development workflow

- Use Expo Web or a running Android development build with Metro Fast Refresh for ordinary UI and game-rule changes.
- Rebuild the native development build only after native dependencies, Android permissions, config plugins, or bundled assets change.
- Test media permissions, EXIF/GPS access, face detection, vibration, and audio on Android.

## Documentation and Storybook

- Human docs live in `apps/docs` (VitePress) and deploy to Vercel.
- Canonical decision log is this page (`apps/docs/decisions.md`), not the old root `docs/` stubs.
- Dual Storybook: web (`@storybook/react-native-web-vite`) for the docs site; on-device (`@storybook/react-native`) for native verification. Shared `*.stories.tsx` files.
- Agents update docs and stories when architecture, components, main dependencies, or the build pipeline change.

## Deferred

- Cloud sync, accounts, server storage, reverse geocoding, and automatic place scoring are outside the prototype.

# Build pipeline: TypeScript to Android

Keepsake is an [Expo](https://expo.dev) app (`apps/mobile`). TypeScript is compiled and bundled for a native Android shell — it is not a separate “native rewrite.”

## Layers

```mermaid
flowchart LR
  TS["TypeScript / TSX"]
  Metro["Metro bundler"]
  Bundle["JS bundle Hermes"]
  Native["Expo modules + Android"]
  APK["Installed app / APK"]

  TS --> Metro --> Bundle --> Native --> APK
```

1. **Source** — `App.tsx`, `src/**/*.ts(x)`, assets. Types checked with `tsc` (`pnpm typecheck`).
2. **Metro** — Expo’s bundler resolves modules, transforms TS/JSX, and serves a JS bundle to the device (dev) or embeds it in a release build.
3. **Hermes** — Android runs the bundle on Hermes (Expo default). Fast Refresh updates the JS layer without rebuilding native code.
4. **Native shell** — `expo-modules`, Gradle project under `apps/mobile/android`, permissions and config plugins from `app.json`.
5. **Install** — `expo run:android` builds/installs a development client; EAS can produce an APK (`eas.json` preview profile).

## Commands

| Goal | Command |
|------|---------|
| Dev server (JS) | `pnpm dev` / `pnpm --filter mobile start` |
| Build + launch Android | `pnpm android` |
| Cloud APK | `cd apps/mobile && EAS_SKIP_AUTO_FINGERPRINT=1 pnpm dlx eas-cli build --platform android --profile preview` |
| Expo Web (no native media) | Expo start → press `w` |

## When to rebuild native

Rebuild the development client only after:

- native dependency changes
- Android permissions / `app.json` plugins
- bundled native assets

Ordinary TypeScript, styles, and game-rule edits use Fast Refresh on an already-installed build.

## Web vs Android

Expo Web (`react-native-web`) is useful for UI and domain work that does not need photo permissions, EXIF/GPS, ML Kit, haptics, or device audio. Those behaviors are proven on an emulator or physical Android device. Web Storybook covers presentational components in the browser; on-device Storybook covers the same stories on Android.

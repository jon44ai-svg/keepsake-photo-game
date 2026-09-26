# Keepsake Club

A private, pass-the-phone photo guessing game. The Android Expo app reads a photo album locally, filters to photos with both an EXIF capture date and GPS location, and keeps each player's date and place guesses hidden until everyone has submitted.

## Run the Android app

```bash
pnpm install
pnpm android
```

The Android command builds and launches the app with its development server. On later runs, use `pnpm dev` to start the server separately. Use a development build rather than Expo Go so Android can include the media-location permission needed to read photo GPS metadata. Photo-library and location metadata stay on the device.

To build an installable APK with Expo's cloud builder, sign in to Expo first, then run:

```bash
cd apps/mobile
EAS_SKIP_AUTO_FINGERPRINT=1 pnpm dlx eas-cli build --platform android --profile preview
```

How TypeScript becomes a runnable Android app is documented in [apps/docs/build-pipeline.md](apps/docs/build-pipeline.md).

## Docs site

Human-readable docs (architecture, components, dependencies, Storybook guide) live in `apps/docs` (VitePress):

```bash
pnpm docs          # local VitePress
pnpm docs:build    # Storybook static + VitePress for deploy
```

Deploy from the **repo root** (not `apps/docs`), so the mobile Storybook build is available. Project Root Directory must be `apps/docs`.

```bash
# from repo root (once)
pnpm dlx vercel login
pnpm dlx vercel link
# → set Root Directory to: apps/docs

pnpm dlx vercel          # preview
pnpm dlx vercel --prod   # production
```

If you previously linked inside `apps/docs`, remove `apps/docs/.vercel` and run `vercel link` again from the repo root. Do not set Root Directory to `apps/docs` while also deploying from that folder — Vercel will look for `apps/docs/apps/docs` and fail.

## Storybook

```bash
pnpm storybook:web       # browser (react-native-web)
pnpm storybook:android   # on-device host (EXPO_PUBLIC_STORYBOOK_ENABLED)
```

Stories live next to components under `apps/mobile/src/**/*.stories.tsx`.

## Fast Windows development

Install the Android development build once, then run Metro:

```bash
cd apps/mobile
pnpm start
```

JavaScript, TypeScript, and style edits use Fast Refresh and do not require another native build. Use Expo Web for screen and game-rule work when the screen does not need native media APIs. Use a Windows Android emulator or a physical Android device to verify photo permissions, EXIF/GPS metadata, face detection, vibration, and audio.

Rebuild only after changing native dependencies, Android permissions, Expo config plugins, or bundled native assets.

## Architecture

See [apps/docs/architecture.md](apps/docs/architecture.md). Short version: `src/domain` owns date/round rules; `src/media.ts` owns photo-library access; `src/storage.ts` owns AsyncStorage; UI should call these seams rather than platform APIs directly.

## Privacy

Photos and metadata stay on the device. The app does not upload images, coordinates, guesses, or face-detection results. The settings screen provides an explicit clear-data action.

## Validation

Run `pnpm typecheck` and `pnpm test` from `apps/mobile`. The Android device smoke path is: grant permissions, choose an album, scan photos, play a multi-image round, reroll, submit private guesses, reveal, and restart to verify persistence.

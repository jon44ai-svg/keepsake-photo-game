# Keepsake Club

A private, pass-the-phone photo guessing game. The Android Expo app reads the Camera album locally, filters to photos with both an EXIF capture date and GPS location, and keeps each player's date and place guesses hidden until everyone has submitted.

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

## Fast Windows development

Install the Android development build once, then run Metro:

```bash
cd apps/mobile
pnpm start
```

JavaScript, TypeScript, and style edits use Fast Refresh and do not require
another native build. Use Expo Web for screen and game-rule work when the
screen does not need native media APIs. Use a Windows Android emulator or a
physical Android device to verify photo permissions, EXIF/GPS metadata, face
detection, vibration, and audio.

Rebuild only after changing native dependencies, Android permissions, Expo
config plugins, or bundled native assets.

## Architecture

`src/domain` contains pure date and round rules. `src/media.ts` owns Android
photo-library access and face detection. `src/storage.ts` owns local
AsyncStorage persistence. UI code should call these seams rather than reading
platform APIs directly.

## Privacy

Photos and metadata stay on the device. The app does not upload images,
coordinates, guesses, or face-detection results. The settings screen provides
an explicit clear-data action.

## Validation

Run `pnpm typecheck` and `pnpm test` from `apps/mobile`. The Android device
smoke path is: grant permissions, choose an album, scan photos, play a
multi-image round, reroll, submit private guesses, reveal, and restart to
verify persistence.

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

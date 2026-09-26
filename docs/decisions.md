# Keepsake Club decisions

## Current product shape

- Android-first, local-only pass-the-phone photo guessing game.
- Prototype scope is approximately 100 hours of human development time.
- Core game loop comes before polish and optional integrations.
- Photo capture dates must come from validated EXIF metadata; library/import dates are not silently used as capture dates.

## Development workflow

- Use Expo Web or a running Android development build with Metro Fast Refresh for ordinary UI and game-rule changes.
- Rebuild the native development build only after native dependencies, Android permissions, config plugins, or bundled assets change.
- Test media permissions, EXIF/GPS access, face detection, vibration, and audio on Android.

## Deferred

- Cloud sync, accounts, server storage, reverse geocoding, and automatic place scoring are outside the prototype.

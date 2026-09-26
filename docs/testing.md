# Testing

## Fast loop

Run ordinary UI and domain changes with Metro Fast Refresh. Expo Web is useful
for screens that do not require native media APIs. Keep one Android development
build installed for native verification; it does not need rebuilding for
TypeScript or style changes.

## Automated seams

`src/domain/game.test.ts` tests public game-rule behavior:

- impossible calendar dates are rejected;
- rerolls choose a different image;
- tied closest guesses and manually awarded place points score correctly.

Add component tests at the component interface, not against private state.
The Android smoke path must cover permissions, album scanning, face filtering,
multi-image rounds, rerolling, private guesses, reveal, and restart/resume.

## Device-only behavior

Verify photo permissions, EXIF/GPS metadata, ML Kit face detection, vibration,
audio playback, and the final Android manifest on an emulator or physical
device. Browser tests cannot prove those behaviors.

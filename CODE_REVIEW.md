# Keepsake Club: Plan and Code Review

## Product plan

Keepsake Club was planned as a private, pass-the-phone Android photo guessing
game:

1. Build a local-only Expo Android app.
2. Read photos from the device's Camera album.
3. Select photos with date and GPS metadata.
4. Let multiple players privately guess the date and place.
5. Reveal the real metadata after everyone submits.
6. Award points for the closest date and host-selected place guesses.
7. Remember the selected album between sessions.

## How the plan was implemented

The implementation was delivered across three commits:

- `180ba5d` — created the Expo app, permission flow, photo scanning, guessing
  screens, reveal screen, and scoring.
- `a92e1d8` — added the logo, improved metadata diagnostics, added a fallback
  date source, and handled denied media-location permission.
- `f324254` — added album selection and persisted the selected album with
  AsyncStorage.

The primary implementation is in `apps/mobile/App.tsx`.

### Permissions and album selection

The app requests photo-library access and, on Android 10+, the
`ACCESS_MEDIA_LOCATION` permission. It discovers albums with
`getAlbumsAsync`, defaults to a Camera/DCIM-like album, and allows the player
to choose another non-empty album.

The selected album's ID and title are stored locally under `photo-album`.
When a saved album no longer exists, the app asks the user to choose another
one.

### Photo scanning and metadata

The selected album is read in pages of up to 500 assets. Each asset's detailed
metadata is then loaded in batches of 40. A photo becomes playable when it has:

- a usable date from `DateTimeOriginal`, `DateTimeDigitized`, or `DateTime`;
- a location;
- a usable URI.

One playable photo is selected randomly for the round.

### Guessing, reveal, and scoring

Players are validated for a minimum of two participants and unique names.
Each player enters a date in `YYYY-MM-DD` format and a free-form place guess.
The app only moves to the reveal screen after every player submits.

On reveal, the actual date and coordinates are shown. The closest date receives
one point, with ties receiving the point as well. The host can manually award
place points. Scores are accumulated across rounds and reset when a new game is
started.

## Review findings

### High priority

#### The date fallback can score against the wrong date

The implementation falls back to `asset.creationTime` when EXIF capture
metadata is unavailable. A library creation time may be the time the photo was
imported or copied, not when it was taken. This conflicts with the product
description and can produce incorrect answers and scores.

Recommended decision: either require a validated EXIF capture date, or label
the fallback clearly as a library date and treat it as a different game mode.

### Medium priority

#### Core logic has no automated tests

Date parsing, score calculation, duplicate-name validation, album recovery, and
permission failure paths are central to the game but are not covered by tests.

#### The main component is too broad for long-term maintenance

`App.tsx` owns storage, permissions, media scanning, game state, scoring, and
all screens. This is acceptable for a prototype but makes isolated testing and
future changes difficult.

#### Full-library scanning may be slow

Every round scans the complete selected album and requests detailed metadata
for every asset. Large libraries may produce a long wait, and there is no
cancellation or timeout mechanism.

#### Permission configuration needs device verification

`app.json` includes both newer media permissions and legacy
`READ_EXTERNAL_STORAGE`/`WRITE_EXTERNAL_STORAGE` permissions. The generated
Android manifest should be checked to ensure that unnecessary or deprecated
permissions are not requested.

### Low priority

#### EXIF date validation is permissive

The EXIF parser rejects malformed strings but does not reject values that
JavaScript normalizes, such as month 13 or day 32.

#### Place scoring is intentionally manual

The app displays coordinates and lets the host decide which place guesses are
correct. This matches the current design, but it prevents automatic place
matching or reverse-geocoded scoring.

## Validation status

The TypeScript validation command was attempted with pnpm but did not complete.
pnpm tried to repair or install dependencies and failed with exit code 1, so a
successful typecheck has not been verified.

Android permission behavior, EXIF availability, GPS access, large-library
performance, and the complete round flow still require testing on a development
build and a physical Android device.

## Future implementation plan

### Phase 1: establish a reliable baseline

1. Repair the dependency installation and lockfile workflow.
2. Run the mobile TypeScript check successfully.
3. Generate the Android manifest and verify the final permission set.
4. Add unit tests for date parsing, calendar-distance calculation, scoring,
   duplicate names, and album selection recovery.

### Phase 2: separate domain logic from UI

1. Move date parsing and validation into a small utility module.
2. Move score calculation into a pure game-rules module.
3. Move media permission, album discovery, pagination, and metadata filtering
   into a media-library service.
4. Keep `App.tsx` focused on screen state and presentation.

### Phase 3: resolve date semantics

1. Decide whether the game requires EXIF capture dates.
2. If yes, remove the `creationTime` fallback and explain excluded photos.
3. If no, distinguish capture date from library date in the UI and scoring.
4. Add strict calendar validation for all metadata-derived dates.

### Phase 4: improve scanning and resilience

1. Cache eligible asset IDs and metadata where safe.
2. Avoid rescanning unchanged albums for every round.
3. Add cancellation, progress handling, and retry behavior.
4. Handle albums changing while a scan is in progress.

### Phase 5: verify the real product flow

1. Test denied, partial, and full photo permissions.
2. Test missing GPS, missing EXIF, invalid EXIF, and cloud-only assets.
3. Test empty and deleted albums.
4. Test large libraries on representative Android devices.
5. Test multiple rounds, tied dates, place-point changes, and finishing a game.

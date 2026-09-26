# Architecture

Keepsake is intentionally local-first. The UI coordinates a small number of
seams:

- `src/domain/game.ts`: pure round transitions, date validation, rerolls, and
  scoring.
- `src/domain/date.ts`: strict EXIF parsing and date formatting.
- `src/media.ts`: Android media permissions, album enumeration, metadata
  extraction, and face detection.
- `src/storage.ts`: the only AsyncStorage adapter. Game state, settings, album
  selection, and the eligible photo index are persisted here.
- `App.tsx`: screen state and presentation.

## Data flow

1. The app requests photo access and Android media-location access.
2. The selected album is scanned locally in pages and metadata is filtered.
3. Validated capture dates and GPS coordinates become the local photo index.
4. A round selects several photos and persists the active game.
5. Guesses remain in memory until reveal; score calculation is deterministic.

The current prototype keeps the screen coordinator in `App.tsx`. The domain
and storage seams are extracted first because they provide the highest leverage
for tests and later UI refactors.

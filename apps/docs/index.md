# Keepsake Club

A private, pass-the-phone photo guessing game. The Android Expo app reads a photo album locally, keeps only photos with a validated EXIF capture date and GPS coordinates, and hides each player's date and place guesses until everyone has submitted.

Photos and metadata stay on the device. There is no cloud upload in this prototype.

## Run the app

From the repo root:

```bash
pnpm install
pnpm android
```

Later runs can use `pnpm dev` for Metro Fast Refresh. Use a development build (not Expo Go) so Android can include media-location permission for GPS metadata.

## Docs and Storybook

```bash
pnpm docs              # VitePress site (this guide)
pnpm storybook:web     # Web Storybook (browser)
pnpm storybook:android # On-device Storybook host
pnpm docs:build        # Static docs + Storybook for Vercel
```

Deploy the docs site from `apps/docs` with the Vercel CLI (`vercel link`, then `vercel` / `vercel --prod`). Storybook is published under `/storybook/`.

## Privacy

The app does not upload images, coordinates, guesses, or face-detection results. Settings include an explicit clear-data action.

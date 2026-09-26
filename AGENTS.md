# Agent notes

Canonical docs: `apps/docs/` (VitePress). Root `docs/` files are stubs only.

## After a change, update docs when you touch

| Change | Update |
|--------|--------|
| Seams / data flow | `apps/docs/architecture.md` |
| Expo / Metro / EAS / Android build | `apps/docs/build-pipeline.md` |
| UI components | `apps/docs/components.md` + `*.stories.tsx` |
| Main npm deps | `apps/docs/dependencies.md` |
| Product / workflow choices | `apps/docs/decisions.md` |
| Test strategy | `apps/docs/testing.md` |
| Storybook hosts | `apps/docs/storybook-guide.md` |

Build docs + Storybook: `pnpm docs:build`. Deploy from **repo root**: `pnpm dlx vercel link` (Root Directory = `apps/docs`), then `pnpm dlx vercel`.

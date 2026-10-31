# Aero S persistence update

Deploy these files to the existing `/aeros/` repository root:
- `index.html`
- `manifest.webmanifest`
- `service-worker.js`

Do not replace the existing favicon or `/aeros/icons/` assets.

## Persistence
The app serialises the same complete workspace model used by Save Instance into `localStorage` under `aeros-workspace-v1`. The previous workspace is restored automatically when Aero S is reopened. Save Instance / Load Instance remains the portable JSON backup workflow.

## PWA
The supplied manifest is preserved with `id`, `start_url` and `scope` set to `/aeros/`. The supplied service-worker architecture is preserved, including Aero-only cache cleanup and `/aeros/` request isolation. The cache name is incremented from `aero-s-analyser-v1-4-pwa-2` to `aero-s-analyser-v1-4-pwa-3` because the application shell changed.

# Particle Charge Calculator 2D - Release 1.9.2

Target: https://frozentrone.github.io/aeros/

## Replace/add in repository root
- index.html
- manifest.webmanifest
- service-worker.js
- version.json
- offline.html

## Preserve from the existing repository
- favicon.png
- icons/ (all existing icon assets)
- README.md

Do not delete the existing favicon or icons directory. This package deliberately does not contain replacement binary icon assets.

## Verification
1. Commit all five release files together to the GitHub Pages publishing branch/root.
2. Open the deployed site online once and reload once so version 1.9.2 controls the page.
3. Confirm installation remains available and the app opens after disconnecting from the network.
4. Confirm version.json returns 1.9.2 and service-worker.js contains pccc-v1.9.2.

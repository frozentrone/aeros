# Aero S Grindability Analyser PWA

Upload all files and the `icons` folder to the root of a GitHub repository. In **Settings > Pages**, deploy the `main` branch from `/ (root)`.

For local testing, run `python -m http.server 8080` in this folder and open `http://localhost:8080`. Do not use a `file://` URL for service-worker testing.

When releasing a changed app, increment `CACHE_NAME` in `service-worker.js`.

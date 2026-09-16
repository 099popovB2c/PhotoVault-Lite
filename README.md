# PhotoVault Lite

A local-first Google Photos-style desktop web app. Pick a folder from your computer and browse a private photo timeline without uploading anything.

## Features

- Chromium File System Access API
- Recursive folder scan
- Timeline grouped by month
- Filename search
- Duplicate finder using SHA-256
- Local index export/import
- No backend, no cloud, no analytics

## Run

Serve the folder locally (required by browser security):

```bash
python -m http.server 8080
```

Open `http://localhost:8080` in Chrome/Edge and choose **Open photo folder**.

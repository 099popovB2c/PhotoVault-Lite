# PhotoVault Lite

A privacy-first local photo browser inspired by the useful parts of Google Photos/Immich, without a server or upload requirement.

## v0.2.0

- Folder-based album filtering
- Persistent local favorites
- Newest/oldest/name/size sorting
- Photo detail view with path, folder, size and file date
- Exact duplicate detection with estimated reclaimable space
- Search across filename and relative path
- Local metadata index export
- Installable PWA; no backend, cloud or analytics

## Run

```bash
python -m http.server 8080
```

Open `http://localhost:8080` in Chrome/Edge and select **Open photo folder**. PhotoVault Lite intentionally stays lightweight; it does not claim to replace backup software.

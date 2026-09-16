# PhotoVault Lite

A privacy-first local photo browser inspired by useful Google Photos / Immich workflows, without a server or upload requirement.

## v0.3.0

- Local JPEG EXIF `DateTimeOriginal` reader
- Local EXIF GPS extraction when coordinates exist
- Timeline prefers capture date over file-modified date
- **On this day** memories view
- **Has GPS** smart view
- Local-only recycle bin / hide-and-restore workflow (never deletes the original file)
- Persistent metadata cache, favorites and hidden-state cache in browser storage
- Search can match path and detected coordinates
- Metadata export now includes capture date, GPS, favorites and local recycle-bin state
- Existing folder albums and exact duplicate detection retained

## Run

```bash
python -m http.server 8080
```

Open `http://localhost:8080` in Chrome or Edge and select **Open photo folder**.

PhotoVault Lite reads selected files locally. The recycle bin is index-only; it intentionally does not delete originals.

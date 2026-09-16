# PhotoVault Lite

A privacy-first local photo browser inspired by useful Google Photos / Immich workflows, without a server or upload requirement.

## v0.4.0

- Smart albums: **Recent 30 days**, **Screenshots**, **Large (10 MB+)**, **Portrait** and **Landscape**
- Dynamic **year filter** based on EXIF capture date or file date
- Local image-dimension indexing for orientation smart albums
- **Places** view plots GPS-tagged photos on a local latitude/longitude canvas
- GPS points are grouped into coarse coordinate buckets for quick browsing
- Clicking a local map point opens the corresponding photo details
- No external map tiles, reverse geocoding, analytics or GPS network requests
- Existing EXIF dates/GPS, On This Day, favorites, duplicate finder and local recycle bin remain available
- Metadata export upgraded to schema version 4 with width/height

## Run

```bash
python -m http.server 8080
```

Open `http://localhost:8080` in Chrome or Edge and select **Open photo folder**.

PhotoVault Lite reads selected files locally. The recycle bin is index-only; it intentionally does not delete originals.

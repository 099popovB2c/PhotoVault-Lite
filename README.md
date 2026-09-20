# PhotoVault Lite

PhotoVault Lite is a **privacy-first, local photo browser and organizer** for people who want useful Google Photos / Immich-style workflows without uploading their library to a cloud service or running a photo server.

It runs in the browser, reads only the folder you explicitly select, builds its metadata index locally, and keeps favorites, recycle-bin state and other app metadata on your device.

## Live demo

PhotoVault Lite is deployed as a static web app:

**https://photovault-lite.netlify.app/**

The hosted shell is public, but selected photo files and PhotoVault metadata processing remain in the browser/device.

## What it does

PhotoVault Lite turns a normal photo folder into a searchable local library with:

- timeline-style browsing
- EXIF capture-date support
- GPS metadata detection
- favorites
- duplicate detection
- smart albums
- year filtering
- On This Day memories
- local recycle-bin state
- photo detail/metadata view
- privacy-first Places view for GPS-tagged photos

It is intentionally lighter than a full self-hosted photo server: **no account, database server, Docker stack or upload step is required**.

## How it works

```text
Select a local photo folder
        ↓
Browser reads the selected files
        ↓
PhotoVault indexes dates, dimensions and available metadata
        ↓
Local library views are generated
        ↓
Timeline / Smart Albums / Places / Favorites / Duplicates
```

Original photo files are not uploaded to PhotoVault Lite or to a hosted backend.

### Metadata and indexing

PhotoVault Lite uses available image/file metadata to build its local index. EXIF capture dates are preferred when available, with file dates used as a fallback. Width and height are indexed for orientation-based smart albums.

### Smart albums

v0.4.0 includes automatically generated views for:

- **Recent 30 days**
- **Screenshots**
- **Large files (10 MB+)**
- **Portrait**
- **Landscape**
- dynamic **year filters**

These are derived locally from file metadata; there is no server-side classification service.

### Places

If a photo contains GPS EXIF data, PhotoVault Lite can show it in the local **Places** view. GPS points are grouped into coarse coordinate buckets and plotted on a local latitude/longitude canvas.

PhotoVault Lite deliberately does **not** send those coordinates to Google Maps, OpenStreetMap, a reverse-geocoding service or an analytics provider.

### Duplicates

The app can surface likely duplicate photos so the user can review them. Duplicate detection is an assistance feature rather than an automatic destructive cleanup process.

### Recycle bin

The recycle bin is **index-only**. Moving an item to the PhotoVault Lite recycle bin does not delete the original file from disk. This is intentional safety behavior.

## Privacy model

PhotoVault Lite is designed around local processing:

- no PhotoVault account
- no hosted backend
- no analytics
- no photo upload requirement
- no external map tiles
- no reverse-geocoding requests
- GPS data remains local

The browser can only work with files/folders the user explicitly grants access to.

## Run locally

PhotoVault Lite is a static web application. From the repository directory:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

For the best folder-access experience use a current Chromium-based browser such as Chrome or Edge, then choose **Open photo folder**.

## Typical workflow

```text
1. Open PhotoVault Lite
2. Select a photo folder
3. Let the browser build the local index
4. Browse by timeline or year
5. Review Smart Albums
6. Mark favorites
7. Check duplicates
8. Explore GPS-tagged images in Places
9. Use On This Day for memories
```

## Data portability

PhotoVault Lite can export its local metadata index. v0.4.0 uses metadata schema version 4 and includes image width/height information used by orientation smart albums.

## Current limitations

PhotoVault Lite is intentionally a lightweight local browser, not yet a complete Immich/Google Photos replacement.

Current limitations include:

- no mobile automatic camera backup
- no multi-user/family sharing
- no face recognition/grouping
- no semantic AI search
- no remote access or cloud sync
- Places is a local coordinate visualization, not a full street map
- recycle-bin actions do not remove originals from disk
- browser capabilities differ across platforms and browsers

## Roadmap

Possible next steps:

- smarter duplicate review and metadata merge
- optional map provider with explicit user opt-in
- smart albums with user-defined rules
- integrity checking
- richer EXIF search/filtering
- optional local semantic search
- optional face grouping that stays on-device
- phone-to-PC backup workflow

## Version

Current release: **v0.4.0**

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT

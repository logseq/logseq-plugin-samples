# IMDb Top 250 Importer

This sample plugin imports IMDb Top 250 movies into a **Logseq DB graph**. It’s mainly a learning project to show how to create and write **DB properties** from external data (JSON/API).

## What you’ll get

- A simple in-app UI that lists the movies (with optional grouping).
- One page per movie, tagged with `#movie`.
- Movie metadata written as DB properties (cover, rating, director, …).

## Requirements

- Latest Logseq **Desktop**
- A **DB graph** (the DB property APIs used here are for DB graphs)
- Node.js (LTS recommended)

## What the plugin creates in your graph

On import, the plugin ensures:

- Tags:
  - `#movie`
  - `#director` (used to tag director pages)

- Properties (and attaches them to `#movie`):
  - `cover` (string)
  - `url` (default)
  - `rating` (string)
  - `director` (default)
  - `genre` (many)
  - `year` (string)
  - `duration` (string)
  - `keywords` (string)

Then it creates a page for each movie and fills those properties.

## How to use (quick)

1. Start the plugin (dev mode or built package).
2. Click the **IMDb Top 250** toolbar button.
3. Click **Import All to Logseq**.

Note: the current code intentionally imports only **10 movies** (demo/debug). See **“Demo limit”** below.

## Development (Vite)

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

In Logseq: enable Developer mode, then load the plugin using this project folder.
The plugin manifest is in `package.json` under the `logseq` field, and dev mode points to:

- `logseq.devEntry`: `http://localhost:5173`

Build for production:

```bash
npm run build
```

## Code tour (where the DB property magic is)

All logic lives in `index.tsx`:

- Create properties + attach them to the `#movie` tag:
  - `createRelatedMetadataProperties()`
  - Uses `logseq.Editor.upsertProperty(...)` and `logseq.Editor.addTagProperty(...)`

- Import one movie (create page + write DB properties):
  - `importItemToLogseq()`
  - Uses `logseq.Editor.createPage(...)` and `logseq.Editor.upsertBlockProperty(...)`

- Import all movies (loop + throttle):
  - `importAllToLogseq()`

## Gotchas / tips

- **DB graph only**: if you don’t use a DB graph, property/tag APIs may fail or behave differently.
- **Demo limit (10 movies)**: in `importAllToLogseq()`, there’s a `debugCounter` that stops after 10 items. Remove/adjust it to import all 250.
- **Re-importing**: importing again will try to create pages with the same movie title. Depending on Logseq behavior/version, this may result in no-op, duplicate titles, or errors.

## License

MIT

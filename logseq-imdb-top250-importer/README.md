# IMDb Top 250 Importer

This sample plugin imports IMDb Top 250 movies into a **Logseq DB graph**. It's mainly a learning project to show how to create and write **DB properties** from external data (JSON/API).

## What you'll get

- A modern, interactive UI that lists all 250 movies with flexible grouping options (by decade, year, rating, or director).
- Collapsible groups with expand/collapse all functionality for better navigation.
- One page per movie, tagged with `#movie`.
- Movie metadata written as DB properties (cover, rating, director, genre, year, duration, keywords).
- Automatic creation of director and genre pages with proper tagging.

## Requirements

- Latest Logseq **Desktop**
- A **DB graph** (the DB property APIs used here are for DB graphs)
- Node.js (LTS recommended)

## What the plugin creates in your graph

On import, the plugin ensures:

- **Tags:**
  - `#movie` - Applied to all imported movie pages
  - `#director` - Applied to director pages (auto-created for each director)
  - `#genre` - Applied to genre tags (auto-created for each unique genre)

- **Properties** (attached to `#movie` tag):
  - `cover` (string) - Movie poster image URL
  - `url` (default) - IMDb movie page URL
  - `rating` (string) - IMDb rating score
  - `director` (node, many) - Reference to director page(s)
  - `genre` (node, many) - Movie genres as tag references
  - `year` (string) - Release year
  - `duration` (string) - Movie runtime
  - `keywords` (string) - IMDb keywords

Then it creates a page for each movie and fills those properties with the corresponding data.

## How to use (quick)

1. Start the plugin (dev mode or built package).
2. Click the **IMDb Top 250** toolbar button (movie icon).
3. Browse movies using the grouping options (by decade, year, rating, or director).
4. Use the **Collapse All** / **Expand All** buttons to manage group visibility.
5. Click **Import All to Logseq** to start the import process.
6. The plugin will navigate to the `#movie` tag page after import is complete.

**Note:** The current code intentionally imports only **10 movies** (demo/debug). See **"Demo limit"** below.

## Development (Vite + React)

This plugin uses **Vite** for fast dev builds and **React 18** with **Bulma CSS** for the UI.

To start development:

```bash
npm install  # or yarn install
npm run dev  # or yarn run dev
```

In Logseq: enable Developer mode, then load the plugin using this project folder.
The plugin manifest is in `package.json` under the `logseq` field, and dev mode points to:

- `logseq.devEntry`: `http://localhost:5173`

To build for production:

```bash
npm run build  # or yarn run build
```

## Code tour (where the DB property magic is)

All logic lives in `index.tsx`:

- **UI Components & State Management:**
  - `App` component with React hooks for state management
  - `groupBy` state for flexible grouping (none, decade, year, rating, director)
  - `collapsedGroups` state for managing group expand/collapse
  - Custom SVG icons for better UX (chevrons, expand/collapse, import)

- **Create properties + attach them to tags:**
  - `createRelatedMetadataProperties()`
  - Uses `logseq.Editor.upsertProperty(...)` to create properties
  - Uses `logseq.Editor.createTag(...)` to create `#movie`, `#director`, `#genre` tags
  - Uses `logseq.Editor.addTagProperty(...)` to attach properties to the `#movie` tag

- **Import one movie (create page + write DB properties):**
  - `importItemToLogseq(movie, tipKey)`
  - Uses `logseq.Editor.createPage(...)` to create movie page
  - Uses `logseq.Editor.addBlockTag(...)` to tag pages
  - Uses `logseq.Editor.upsertBlockProperty(...)` to set property values
  - Creates director pages and genre tags with proper relationships

- **Import all movies (loop + throttle):**
  - `importAllToLogseq()`
  - Shows progress messages during import
  - Navigates to `#movie` tag page after completion
  - 100ms throttle between imports to avoid overwhelming Logseq

## Gotchas / tips

- **DB graph only**: if you don't use a DB graph, property/tag APIs may fail or behave differently.
- **Demo limit (10 movies)**: in `importAllToLogseq()`, there's a `debugCounter` that stops after 10 items. Remove or adjust the following lines to import all 250:
- **Re-importing**: importing again will try to create pages with the same movie title. Depending on Logseq behavior/version, this may result in no-op, duplicate titles, or errors.
- **Genre and Director handling**: The plugin automatically creates pages for directors and tags for genres, establishing many-to-many relationships through node properties.
- **Performance**: The plugin includes a 100ms throttle between imports to prevent overwhelming Logseq. Adjust this value in the `setTimeout` call if needed.

## License

MIT

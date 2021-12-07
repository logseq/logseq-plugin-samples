## Emoji Picker Sample

This is picker sample that show you how to use slash command and position popup ui :)

### Demo

![demo](./demo.gif)

### API

[![npm version](https://badge.fury.io/js/%40logseq%2Flibs.svg)](https://badge.fury.io/js/%40logseq%2Flibs)

##### Logseq.App

- `registerSlashCommand: (tag: string, action: BlockCommandCallback | Array<SlashCommandAction>) => boolean`
- `getEditingCursorPosition: () => Promise<BlockCursorPosition | null>`

### Running the Sample

- `npm install && npm run build` in terminal to install dependencies
- navigate to the plugins dashboard: <kbd>t</kbd><kbd>p</kbd>
- click `Load unpacked plugin` button in Logseq Desktop client
- select this sample directory to load it

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

- `npm install && npm run build` in terminal to install dependencies.
- `Load unpacked plugin` in Logseq Desktop client.

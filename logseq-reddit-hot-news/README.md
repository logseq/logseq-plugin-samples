## Reddit Hot News Sample

This is a sample that show you how to manipulate blocks :)

### Demo

![demo](./demo.gif)

### API

[![npm version](https://badge.fury.io/js/%40logseq%2Flibs.svg)](https://badge.fury.io/js/%40logseq%2Flibs)

##### [Logseq.Editor](https://logseq.github.io/plugins/interfaces/ieditorproxy.html)

- `insertBlock: (
  srcBlock: BlockIdentity, content: string, opts?: Partial<{ before: boolean; sibling: boolean; properties: {} }>
  ) => Promise<BlockEntity | null>`
- `insertBatchBlock: (
  srcBlock: BlockIdentity, batch: IBatchBlock | Array<IBatchBlock>, opts?: Partial<{ before: boolean, sibling: boolean }>
  ) => Promise<Array<BlockEntity> | null>`
- `updateBlock: (
  srcBlock: BlockIdentity, content: string, opts?: Partial<{ properties: {} }>
  ) => Promise<void>`
- `removeBlock: (
  srcBlock: BlockIdentity
  )`

### Running the Sample

- `npm install && npm run build` in terminal to install dependencies.
- `Load unpacked plugin` in Logseq Desktop client.

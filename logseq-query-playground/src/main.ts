/// <reference types="svelte" />

import "@logseq/libs";
import { css } from "./util";
import App from "./App.svelte";

function createModel() {
  return {
    openQueryPlayground() {
      logseq.showMainUI();
    },
  };
}

function main() {
  new App({
    target: document.querySelector("#app"),
  });

  const key = logseq.baseInfo.id;

  logseq.setMainUIInlineStyle({
    zIndex: 11
  });

  logseq.provideStyle(css`
    div[data-injected-ui=open-query-playground-${key}] {
      display: inline-flex;
      align-items: center;
      opacity: 0.55;
      font-weight: 500;
      padding: 0 5px;
      position: relative;
      font-size: 1.2em;
    }

    div[data-injected-ui=open-query-playground-${key}]:hover {
      opacity: 0.9;
    }
  `);

  logseq.App.registerUIItem('toolbar', {
    key: "open-query-playground",
    template: `
      <a data-on-click="openQueryPlayground" class="button" style="font-size: 20px">🗄</a>
    `,
  });
}

logseq.ready(createModel()).then(main).catch(console.error);

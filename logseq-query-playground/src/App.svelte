<script lang="ts">
  import Repl from "./Repl.svelte";

  let inner: Element;
  let show = true;
  let query = `[:find (pull ?h [*])
            :where
            [?h :block/marker ?marker]
            [(contains? #{"NOW" "DOING"} ?marker)]]`;

  logseq.on("ui:visible:changed", async ({ visible }) => {
    show = visible;
  });

  const clickOutside = (e: Event) => {
    if (!inner.contains(e.target as any)) {
      window.logseq.hideMainUI();
    }
  };
</script>

{#if show}
  <main on:click={clickOutside}>
    <div bind:this={inner} class="inner"><Repl bind:query={query} /></div>
  </main>
{/if}

<style>
  main {
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: fixed;
    padding: 10vh 5vw;
    backdrop-filter: saturate(0.8) blur(10px);
  }

  .inner {
    border: 3px solid #000;
    background: #eee;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 0 20px #888;
  }
</style>

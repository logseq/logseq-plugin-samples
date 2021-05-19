<script lang="ts">
  import debounce from "lodash.debounce";
  import { AceEditor } from "./AceEditor";
  import Wrapper from "./Wrapper.svelte";

  export let query: string;

  const aceOptions = { fontFamily: "Fira Code", printMargin: false };
  let slowQuery: string;
  const dSlowQuery = debounce(() => {
    slowQuery = query;
  }, 300);

  $: if (query) {
    dSlowQuery();
  }

  async function runQuery() {
    const errorKey = "#lspmsg#error#";
    return await logseq.DB.datascriptQuery(query).then((res) => {
      if (errorKey in res) {
        throw res[errorKey];
      }
      return res;
    });
  }

  let res: ReturnType<typeof runQuery>;
  $: if (slowQuery) {
    res = runQuery();
  }
</script>

<div class="root">
  <Wrapper>
    <span slot="header" class="header">Datascript Query</span>
    <AceEditor
      lang="clojure"
      options={{ ...aceOptions, fontSize: "14px" }}
      bind:value={query}
      theme="dracula"
      height="100%"
      width="100%"
    />
  </Wrapper>
  <Wrapper>
    <span slot="header">Result</span>
    {#await res}
      <pre>...running query</pre>
    {:then result}
      <AceEditor
        options={aceOptions}
        value={JSON.stringify(result, null, 2)}
        theme="solarized_light"
        lang="json"
        height="100%"
        width="100%"
        readonly
      />
    {:catch error}
      <pre class="error">{error.message}</pre>
    {/await}
  </Wrapper>
</div>

<style>
  .root {
    display: flex;
    width: 100%;
    height: 100%;
  }

  pre {
    white-space: pre-wrap;
    font-weight: 600;
    font-size: 14px;
    padding: 1em;
  }

  pre.error {
    color: red;
  }
</style>

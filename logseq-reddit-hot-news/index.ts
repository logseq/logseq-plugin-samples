import '@logseq/libs'
import { LSPluginBaseInfo } from '@logseq/libs/dist/LSPlugin'

const delay = (t = 100) => new Promise(r => setTimeout(r, t))

async function loadRedditData() {
  // const endpoint = 'https://www.reddit.com/r/logseq/hot.json'
  const endpoint = './hot.json'
  const { data: { children } } = await fetch(
    endpoint,
    {
      headers: {
        'User-Agent': 'logseq-reddit-hot-news-plugin',
        'Accept': 'application/json'
      }
    }
  ).then(res => res.json())

  const ret = children || []

  return ret.map(({ data }, i) => {
    const { title, selftext, url, ups, num_comments } = data
    return `
    ${i}. [${title}](${url}) [:small.opacity-50 "🔥 ${ups} 💬 ${num_comments}"]
    **${selftext}**`
  })
}

/**
 * main entry
 * @param baseInfo
 */
function main(baseInfo: LSPluginBaseInfo) {
  let loading = false

  logseq.provideModel({
    async loadReddits() {
      if (loading) return

      const pageName = 'reddit-logseq-hots-news'
      const blockTitle = (new Date()).toLocaleString()

      await logseq.Editor.createPage(pageName, {}, { redirect: true })
      await delay(500) // wait for page redirect and focus first block
      loading = true
      try {
        const pageBlocksTree = await logseq.Editor.getCurrentPageBlocksTree()
        let targetBlock = pageBlocksTree[0]!

        targetBlock = await logseq.Editor.insertBlock(targetBlock.uuid, '🚀 Fetching r/logseq ...', { before: true })

        let blocks = await loadRedditData()

        blocks = blocks.map(it => ({ content: it }))

        await logseq.Editor.insertBatchBlock(targetBlock.uuid, blocks, {
          sibling: false
        })

        await logseq.Editor.updateBlock(targetBlock.uuid, `## 🔖 r/logseq - ${blockTitle}`)
      } catch (e) {
        await logseq.UI.showMsg(e.toString(), 'warning')
        console.error(e)
      } finally {
        loading = false
      }
    }
  })

  logseq.App.registerUIItem('toolbar', {
    key: 'logseq-reddit',
    template: `
      <a data-on-click="loadReddits"
         class="button">
        <i class="ti ti-brand-reddit"></i>
      </a>
    `
  })

  logseq.provideStyle(`
    [data-injected-ui=logseq-reddit-${baseInfo.id}] {
      display: flex;
      align-items: center;
    }
  `)
}

// bootstrap
logseq.ready(main).catch(console.error)

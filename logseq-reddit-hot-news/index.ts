import '@logseq/libs'
import { LSPluginBaseInfo } from '@logseq/libs/dist/libs'

const delay = (t = 100) => new Promise(r => setTimeout(r, t))

async function loadRedditData () {
  const endpoint = 'https://www.reddit.com/r/logseq/hot.json'

  const { data: { children } } = await fetch(endpoint).then(res => res.json())
  const ret = children || []

  return ret.map(({ data }, i) => {
    const { title, selftext, url, ups, downs, num_comments } = data

    return `${i}. [${title}](${url}) [:small.opacity-50 "🔥 ${ups} 💬 ${num_comments}"]
collapsed:: true    
> ${selftext}`
  })
}

/**
 * main entry
 * @param baseInfo
 */
function main (baseInfo: LSPluginBaseInfo) {
  let loading = false

  logseq.provideModel({
    async loadReddits () {

      const info = await logseq.App.getUserConfigs()
      if (loading) return

      const pageName = 'reddit-logseq-hots-news'
      const blockTitle = (new Date()).toLocaleString()

      logseq.App.pushState('page', { name: pageName })

      await delay(300)

      loading = true

      try {
        const currentPage = await logseq.Editor.getCurrentPage()
        if (currentPage?.originalName !== pageName) throw new Error('page error')

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
        logseq.App.showMsg(e.toString(), 'warning')
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

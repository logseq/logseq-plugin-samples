import '@logseq/libs'
import { LSPluginBaseInfo } from '@logseq/libs/dist/libs'

const delay = (t = 100) => new Promise(r => setTimeout(r, t))
const svgReddit = (size = 18) => `<svg t="1623829584885" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2491" width="${size}" height="${size}"><path d="M625.737143 666.843429q9.142857 9.142857 0 17.700571-35.401143 35.401143-113.737143 35.401143t-113.737143-35.401143q-9.142857-8.557714 0-17.700571 3.437714-3.437714 8.557714-3.437714t8.557714 3.437714q27.428571 28.013714 96.548571 28.013714 68.534857 0 96.548571-28.013714 3.437714-3.437714 8.557714-3.437714t8.557714 3.437714zM450.267429 563.419429q0 21.138286-14.848 35.986286t-35.986286 14.848-36.278857-14.848-15.140571-35.986286q0-21.723429 15.140571-36.571429t36.278857-14.848 35.986286 15.140571 14.848 36.278857zM675.986286 563.419429q0 21.138286-15.140571 35.986286t-36.278857 14.848-35.986286-14.848-14.848-35.986286 14.848-36.278857 35.986286-15.140571 36.278857 14.848 15.140571 36.571429zM819.419429 494.884571q0-28.013714-19.968-47.981714t-48.566857-19.968-49.152 20.553143q-74.313143-51.419429-177.737143-54.857143l35.986286-161.718857 114.322286 25.746286q0 21.138286 14.848 35.986286t35.986286 14.848 36.278857-15.140571 15.140571-36.278857-15.140571-36.278857-36.278857-15.140571q-30.866286 0-45.714286 28.598857l-126.317714-28.013714q-10.825143-2.852571-14.262857 9.142857l-39.424 178.322286q-102.838857 4.022857-176.566857 55.442286-19.968-21.138286-49.737143-21.138286-28.598857 0-48.566857 19.968t-19.968 47.981714q0 19.968 10.605714 36.571429t28.306286 25.161143q-3.437714 15.433143-3.437714 32.036571 0 81.115429 80.018286 138.825143t192.585143 57.709714q113.152 0 193.170286-57.709714t80.018286-138.825143q0-18.285714-4.022857-32.548571 17.115429-8.557714 27.428571-24.868571t10.313143-36.278857zM1024 512q0 104.009143-40.594286 198.875429t-109.129143 163.401143-163.401143 109.129143-198.875429 40.594286-198.875429-40.594286-163.401143-109.129143-109.129143-163.401143-40.594286-198.875429 40.594286-198.875429 109.129143-163.401143 163.401143-109.129143 198.875429-40.594286 198.875429 40.594286 163.401143 109.129143 109.129143 163.401143 40.594286 198.875429z" p-id="2492" fill="#707070"></path></svg>`

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
      <a data-on-click="loadReddits">
        ${svgReddit()}
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

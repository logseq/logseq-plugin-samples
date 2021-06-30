/**
 * User model
 */
function createModel () {
  return {
    openMindMap () {
      // logseq.App.showMsg('hello, mind map')
      logseq.showMainUI()
    },
  }
}

function main () {
  logseq.provideStyle(`
    @import url("https://at.alicdn.com/t/font_2409735_lkeod9mm2ej.css");
  `)

  logseq.setMainUIInlineStyle({
    position: 'fixed',
    zIndex: 12,
  })

  logseq.App.registerUIItem('pagebar', {
    key: 'another-open-mind2',
    template: `
     <a data-on-click="openMindMap" title="open mind map">
       <i class="iconfont icon-icons-mind_map" style="font-size: 18px; line-height: 1em;"></i> 
     </a> 
    `,
  })

  // main ui
  const root = document.querySelector('#app')
  const btnClose = document.createElement('button')
  const displayMap = document.createElement('div')

  // events
  displayMap.id = 'map'
  displayMap.classList.add('mind-display', 'hidden')
  btnClose.textContent = 'CLOSE'
  btnClose.classList.add('close-btn')

  btnClose.addEventListener('click', () => {
    logseq.hideMainUI()
  }, false)

  document.addEventListener('keydown', function (e) {
    if (e.keyCode === 27) {
      logseq.hideMainUI()
    }
  }, false)

  logseq.on('ui:visible:changed', async ({ visible }) => {
    if (!visible) {
      displayMap.classList.add('hidden')
      displayMap.innerHTML = ''
      return
    }

    const blocks = await logseq.Editor.getCurrentPageBlocksTree()
    initMindMap(displayMap, btnClose, blocks)
  })

  // mount to root
  root.append(displayMap)
}

/**
 * @param el
 * @param btnClose
 * @param data
 */
function initMindMap (el, btnClose, data) {
  const root = {
    id: 'root',
    topic: '📖',
    root: true,
    expanded: true,
    children: [],
  }

  try {
    if (data[0][`preBlock?`]) {
      const preBlock = data.shift()
      const [[, { title }]] = preBlock.body?.filter(
        it => (it[0] === 'Properties'))
      root.topic = title
    }
  } catch (e) {
    console.debug(e)
  }

  const walkTransformBlocks = (blocks, depth = 0) => {
    return blocks.map((it) => {
      const { children, uuid, title, content } = it

      const end = content.indexOf(':')
      const topic = content.substr(0, end === -1 ? 256 : end).
        replace(/^[#\s]+/, '').
        substr(0, 128).
        replace(/[\r\n]+/, '').
        trim()

      const ret = {
        id: uuid, topic, // title?.[0]?.[1],
        selected: true, new: true,
        direction: depth, expanded: false,
      }

      if (children) {
        ret.children = walkTransformBlocks(children, ++depth)
      }

      return ret
    })
  }

  root.children = walkTransformBlocks(data)

  console.debug(root)

  // el.textContent = JSON.stringify(root, null, 2)
  let options = {
    el: '#map',
    direction: MindElixir.LEFT,
    // create new map data
    // data: MindElixir.new('new topic'),
    // the data return from `.getAllData()`
    data: { nodeData: root },
    draggable: true, // default true
    contextMenu: true, // default true
    toolBar: true, // default true
    nodeMenu: false, // default true
    editable: true,
    keypress: true, // default true
    locale: 'en', // [zh_CN,zh_TW,en,ja] waiting for PRs
    overflowHidden: false, // default false
    primaryLinkStyle: 2, // [1,2] default 1
    primaryNodeVerticalGap: 15, // default 25
    primaryNodeHorizontalGap: 15, // default 65
    contextMenuOption: {
      focus: true,
      link: true,
    },
  }

  let mind = new MindElixir(options)
  mind.init()

  const patchRightBottomBar = () => {
    const barWrap = document.querySelector('toolbar.rb')
    barWrap.appendChild(btnClose)
  }

  setTimeout(() => {
    patchRightBottomBar()
    mind.initSide()
    el.classList.remove('hidden')
  }, 16)
}

// bootstrap
logseq.ready(createModel(), main).catch(console.error)

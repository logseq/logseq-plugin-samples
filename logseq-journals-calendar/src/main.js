import '@logseq/libs'
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import VCalendar from 'v-calendar'

/**
 * user model
 */
function createModel () {
  return {
    openCalendar () {
      logseq.showMainUI()
    },
  }
}

/**
 * app entry
 */
function main () {
  logseq.setMainUIInlineStyle({
    position: 'fixed',
    zIndex: 11,
  })

  const key = logseq.baseInfo.id

  logseq.provideStyle(`
    @import url("https://at.alicdn.com/t/font_2409735_haugsknp36e.css");
    
    div[data-injected-ui=open-calendar-${key}] {
      display: flex;
      align-items: center;
      font-weight: 500;
      position: relative;
      top: 0px;
    }
    
    div[data-injected-ui=open-calendar-${key}] a {
      opacity: 1;
      padding: 6px;
    }
    
    div[data-injected-ui=open-calendar-${key}] iconfont {
      font-size: 18px;
    }
  `)

  // external btns
  logseq.App.registerUIItem('toolbar', {
    key: 'open-calendar',
    template: `
      <a class="button" data-on-click="openCalendar">
        <i class="iconfont icon-calendar"></i>
      </a>
    `,
  })

  // main UI
  createApp(App).use(VCalendar, {}).mount('#app')
}

// bootstrap
logseq.ready(createModel()).then(main)

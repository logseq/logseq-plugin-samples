import '@logseq/libs'
// @ts-ignore
import { translate } from 'google-translate-api-browser/dist/browser/cjs.js'

/**
 * main entry
 */
async function main () {
  logseq.UI.showMsg('hello, a translator :)')

  logseq.Editor.onInputSelectionEnd((e) => {
    const { x, y } = e.point
    const dsl = (text: string, text2: string = '') => {
      return {
        key: 'selection-end-text-dialog',
        close: 'outside',
        template: `
        <div style="padding: 10px; overflow: auto;">
          <h3>${text}</h3>
          <h3>${text2}</h3>
        </div>
      `,
        style: {
          left: x + 'px',
          top: y + 'px',
          width: '300px',
          backgroundColor: 'var(--ls-primary-background-color)',
          color: 'var(--ls-primary-text-color)',
          boxShadow: '1px 2px 5px var(--ls-secondary-background-color)',
        },
        attrs: {
          title: 'A Translator',
        },
      }
    }

    logseq.provideUI(dsl('Loading...'))

    translate(e.text, { to: 'zh' }).then((res) => {
      //@ts-ignore
      logseq.provideUI(dsl(e.text, decodeURIComponent(res.text)))
    }).catch((e) => {
      logseq.provideUI(dsl('ERROR'))
      console.error(e)
    })
  })
}

// bootstrap
logseq.ready(main).catch(console.error)

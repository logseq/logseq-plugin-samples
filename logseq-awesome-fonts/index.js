/** @jsx h */
import '@logseq/libs'

import { h, render } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'

const googleFonts = [
  'Noto Serif SC', 'Nunito',
  'Prata', 'PT Sans',
]

function GoogleFontSelect (props) {

  useEffect(() => {
    const { googleFontFamily } = props

    logseq.provideStyle({
      key: 'editor-blocks-container-style',
      style: `
       .blocks-container {
         font-family: ${googleFontFamily ? googleFontFamily : 'inherit'}
       }
      `,
    })
  }, [props.googleFontFamily])

  const changeGoogleFont = useCallback((googleFontFamily) => {
    logseq.updateSettings({ googleFontFamily })
  }, [])

  return (
    <div className="rt">
      <label>
        <strong>
          Google fonts:
        </strong>
        <select onChange={(e) => {
          changeGoogleFont(e.target.value)
        }}
                value={props.googleFontFamily}>
          {googleFonts.map((it) => {
            return <option value={it} key={it}>{it}</option>
          })}
        </select>
      </label>
    </div>
  )
}

function ContentWidthMode (props) {
  const modes = ['small', 'normal', 'middle', 'widen']

  useEffect(() => {
    const mode = props.contentWidthMode || 'normal'
    const width = ['580px', '700px', '70%', '90%'][modes.indexOf(mode)]

    logseq.provideStyle({
      key: 'content-widen-mode',
      style: `
        :root {
          --ls-main-content-max-width: ${width};
        }
      `,
    })
  }, [props.contentWidthMode])

  return (
    <div className="rt">
      <label>
        <strong>
          Content width:
        </strong>
        <select onChange={(e) => {
          logseq.updateSettings({
            contentWidthMode: e.target.value,
          })
        }}
                value={props.contentWidthMode || 'normal'}>
          {modes.map((it) => {
            return <option value={it} key={it}>{it}</option>
          })}
        </select>
      </label>
    </div>
  )
}

function ZoomFactorRange (props) {
  useEffect(() => {
    let { zoomFactor } = props

    if (zoomFactor) {
      logseq.App.setZoomFactor(zoomFactor / 100)
    }
  }, [props.zoomFactor])

  return (
    <div className="rt">
      <label>
        <strong>
          Zoom factor:
        </strong>
        <input type="range" min="100" max="130" value={props.zoomFactor}
               step="2"
               onChange={(e) => {
                 logseq.updateSettings({
                   zoomFactor: e.target.value,
                 })

                 if (logseq.isMainUIVisible) {
                   logseq.hideMainUI()
                   logseq.App.showMsg(
                     'You can continue to up/down key zoom in/out :)"')
                 }
               }}/>
      </label>
    </div>
  )
}

function App () {
  const [settings, setSettings] = useState(logseq.settings)

  useEffect(() => {
    logseq.on('settings:changed', (a) => {
      setSettings(a)
    })
  }, [])

  return (
    <div>
      <GoogleFontSelect googleFontFamily={settings.googleFontFamily}/>
      <ContentWidthMode contentWidthMode={settings.contentWidthMode}/>
      <ZoomFactorRange zoomFactor={settings.zoomFactor}/>

      <p className="ctl">
        <button onClick={() => {
          logseq.hideMainUI()
        }}>OK
        </button>
      </p>
    </div>
  )
}

function main () {
  const doc = document

  render(<App/>, doc.querySelector('#app'))

  logseq.provideModel({
      sayHello ({ dataset }) {
        logseq.App.showMsg(dataset.args)
      },

      openFontsPanel (e) {
        const { rect } = e

        logseq.setMainUIInlineStyle({
          top: `${rect.top + 20}px`,
          left: `${rect.right - 10}px`,
        })

        logseq.toggleMainUI()
      },
    },
  )

  const id = logseq.baseInfo.id

  logseq.provideStyle(`
    @import url("https://at.alicdn.com/t/font_2409735_r7em724douf.css");
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC&family=Prata&family=PT+Sans&family=Nunito&display=swap');
  `)

  logseq.setMainUIInlineStyle({
    position: 'fixed',
    width: '290px',
    zIndex: 999,
    transform: 'translateX(-50%)',
  })

  logseq.App.registerUIItem('toolbar',
    {
      key: 'awesome-fonts-btn',
      template: `
        <a 
           style="font-weight: bold"
           data-on-click="openFontsPanel" 
           data-rect
        >
          <i class="iconfont icon-font"></i>
        </a>
    `,
    })

  document.addEventListener('keydown', function (e) {
    if (e.keyCode === 27) {
      logseq.hideMainUI()
    }
  }, false)
}

// bootstrap
logseq.ready(main).catch(console.error)

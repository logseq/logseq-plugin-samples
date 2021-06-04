import '@logseq/libs'
import { EmojiButton } from '@joeattardi/emoji-button'

/**
 * main entry
 */
async function main () {
  const appUserConfig = await logseq.App.getUserConfigs()
  const emojiPickerEl = document.createElement('div')
  emojiPickerEl.classList.add('emoji-picker-trigger')
  document.getElementById('app').appendChild(emojiPickerEl)

  let picker = null
  let makePicker = () => {
    if (picker) return picker
    picker = new EmojiButton({
      position: 'bottom-start',
      theme: appUserConfig.preferredThemeMode,
    })

    picker.on('emoji', async (selection) => {
      logseq.hideMainUI()
      await logseq.Editor.insertAtEditingCursor(selection.emoji)
    })

    // Hack search key arrow down
    const searchInput = document.querySelector('.emoji-picker__search')! as HTMLInputElement

    searchInput.addEventListener('keydown', (e) => {
      const isDown = (e as KeyboardEvent).which === 40
      if (!isDown) return
      const emojiCnt = document.querySelector('.emoji-picker__container')! as HTMLDivElement
      (emojiCnt.querySelector('.emoji-picker__emoji') as HTMLElement).focus()
      e.preventDefault()
    })

    //ESC
    document.addEventListener('keydown', function (e) {
      if (e.keyCode === 27) {
        logseq.hideMainUI({ restoreEditingCursor: true })
      }
      e.stopPropagation()
    }, false)

    document.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('.emoji-picker__wrapper')) {
        logseq.hideMainUI({ restoreEditingCursor: true })
      }
    })

    logseq.App.onThemeModeChanged(({ mode }) => {
      picker.setTheme(mode)
    })

    return picker
  }

  // Emoji picker
  logseq.Editor.registerSlashCommand(
    '😀 Emoji picker', async () => {
      const {
        left,
        top,
        rect,
      } = await logseq.Editor.getEditingCursorPosition()
      Object.assign(emojiPickerEl.style, {
        top: top + rect.top + 'px',
        left: left + rect.left + 'px',
      })
      logseq.showMainUI()

      setTimeout(() => {
        makePicker().showPicker(emojiPickerEl)
      }, 100)
    },
  )
}

// bootstrap
logseq.ready(main).catch(console.error)

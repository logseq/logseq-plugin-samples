function main () {
  logseq.Editor.registerSlashCommand(
    '💥 Big Bang',
    async () => {
      const { content, uuid } = await logseq.Editor.getCurrentBlock()

      logseq.App.showMsg(`
        [:div.p-2
          [:h1 "#${uuid}"]
          [:h2.text-xl "${content}"]]
      `)
    },
  )

  logseq.Editor.registerBlockContextMenuItem('🦜 Send A Tweet',
    ({ blockId }) => {
      logseq.App.showMsg(
        '🦜 Tweet from block content #' + blockId,
      )
    })
}

// bootstrap
logseq.ready(main).catch(console.error)

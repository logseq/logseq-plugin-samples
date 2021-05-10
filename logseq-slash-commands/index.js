function main () {
  console.log('hello world')

  logseq.provideModel({
    async helloSlashCommand () {
      const { content, uuid }= await logseq.Editor.getCurrentBlock()

      logseq.App.showMsg(`
        [:div.p-2
          [:h1 "#${uuid}"]
          [:h2.text-xl "${content}"]]
      `)
    },
  })

  logseq.Editor.registerSlashCommand(
    '💥 Big Bang',
    [
      // [
      //   'editor/input',
      //   '{{renderer 1 2 3}}',
      //   {
      //     'last-pattern': '/',
      //     'backward-pos': 2,
      //   },
      // ]
      [
        'editor/hook',
        'helloSlashCommand',
      ],
      ['editor/clear-current-slash'],
    ],
  )

  logseq.Editor.registerBlockContextMenu('🦜 Send A Tweet',
    ({ blockId }) => {
      logseq.App.showMsg(
        '🦜 Tweet from block content #' + blockId,
      )
    })
}

//bootstrap
logseq.ready().then(main)

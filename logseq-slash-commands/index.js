function main () {
  console.log('hello world')

  logseq.provideModel({
    helloSlashCommand () {
      logseq.App.showMsg('💥 Hello Big Bang :)')
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
}

//bootstrap
logseq.ready().then(main)

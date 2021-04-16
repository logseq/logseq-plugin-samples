import '@logseq/libs'

/**
 * entry
 */
function main () {
  logseq.App.showMsg('❤️ Message from Hello World Plugin :)')

  logseq.provideStyle(`
    @import url("https://at.alicdn.com/t/font_2409735_r7em724douf.css");
  `)
}

// bootstrap
logseq.ready(main).catch(console.error)

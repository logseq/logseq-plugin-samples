/**
 * entry
 */
function main () {
  logseq.App.showMsg('❤️ Message from Hello World Plugin :)')
}

// bootstrap
logseq.ready(main).catch(console.error)

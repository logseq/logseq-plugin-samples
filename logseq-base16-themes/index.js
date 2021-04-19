const fs = require('fs')
const pkg = require('./package.json')

const cssFiles = fs.readdirSync('./css')

function fixCheckbox (filePath) {
  const content = fs.readFileSync(filePath).toString().replace(
`.dark-theme .form-checkbox {
    background-color: var(--base00);
    border-color: var(--base04);
}`, `
.dark-theme .form-checkbox {
    background-color: var(--base02);
    border-color: var(--base04);
}`)

  fs.writeFileSync(filePath, content)
}

// cssFiles.forEach(it => {
//   fixCheckbox(`./css/${it}`)
// })

const out = cssFiles.map(it => {
  const description = fs.readFileSync(`./css/${it}`).toString().split('\n')[0]

  return {
    name: it.replace('.css', ''),
    url: `./css/${it}`,
    description,
    mode: 'dark' // it.includes('light') ? 'light' : 'dark',
  }
})

pkg.logseq.themes = out

fs.writeFileSync(
  './package.json',
  JSON.stringify(pkg, null, 2),
)

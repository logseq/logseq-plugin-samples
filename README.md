## Logseq Plugin Samples

This repository contains sample code illustrating the Logseq Plugin API. You can read, play with or adapt from these
samples to create your own plugins.

Plugins API: https://logseq.github.io/plugins/

### Prerequisites

You need to have [node](https://nodejs.org/) and [npm(or yarn)](https://yarnpkg.com/getting-started/install) installed
on your system to run the examples. Then install the latest Logseq Desktop App
from [here](https://github.com/logseq/logseq/releases).

#### Using `nvm` to install `node` and `npm`

For those who are not familiar with the installation of Node.js and NPM, a simple solution would be to install **Node
Version Manager (NVM)**[(link)](https://github.com/nvm-sh/nvm). The installation is straightforward: just download and
run the [installation bash script](https://github.com/nvm-sh/nvm/blob/v0.38.0/install.sh). You may need to give access
permissions to the script.

After installing `nvm`, using the command `nvm install 16`(for current) or `nvm install 14`(for LTS), you'll be able to
install the current version of node and npm on your machine. Because `nvm` installs locally, there is no need
for the `sudo` command.

For those familiar, `nvm` acts similarly to `anaconda`: the same way you can select your version of python with
anaconda, you can choose your version of node.js.

### Usage

- `git clone https://github.com/logseq/logseq-plugin-samples`
- open Logseq Desktop client and turn on `Developer mode` in user settings panel
- open the toolbar dot menus and navigate to plugins page
- read the README file of the sample you want to load, then determine if it should be
  rebuilt (`npm install && npm run build`)
- click `Load unpacked package` button, then select the sample directory to load it

### Getting Started

- 🌱 [Hello World Sample](./logseq-hello-world)
- 🎨 [Custom Theme Sample](./logseq-bujo-themes)
- 🗓 [Journals Calendar Sample](./logseq-journals-calendar)
- 🛠 [Custom Editor Fonts Sample](./logseq-awesome-fonts)
- 😀 [Emoji Picker Sample](./logseq-emoji-picker)
- 📰 [Reddit Hot News Sample](./logseq-reddit-hot-news)

### License

[MIT](./LICENSE)

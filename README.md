<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/trickwork-banner-dark.png">
    <img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/trickwork-banner.png" alt="TrickWork" width="100%">
  </picture>
</p>

<p align="center">
  <a href="https://github.com/junkerderprovinz/trickwork/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/junkerderprovinz/trickwork/ci.yml?branch=main&label=CI&style=for-the-badge&logo=githubactions&logoColor=white" alt="CI" height="36"></a>&nbsp;
  <a href="https://github.com/junkerderprovinz/trickwork/actions/workflows/container.yml"><img src="https://img.shields.io/github/actions/workflow/status/junkerderprovinz/trickwork/container.yml?branch=main&label=Container&style=for-the-badge&logo=githubactions&logoColor=white" alt="Container build" height="36"></a>&nbsp;
  <a href="https://hub.docker.com/r/junkerderprovinz/trickwork"><img src="https://img.shields.io/docker/pulls/junkerderprovinz/trickwork?style=for-the-badge&logo=docker&logoColor=white&label=Pulls&color=1d99f3" alt="Docker Pulls" height="36"></a>&nbsp;
  <a href="https://github.com/junkerderprovinz/trickwork/releases"><img src="https://img.shields.io/github/downloads/junkerderprovinz/trickwork/total?style=for-the-badge&logo=github&logoColor=white&label=Downloads&color=1d99f3" alt="Downloads" height="36"></a>&nbsp;
  <a href="https://github.com/junkerderprovinz/trickwork/pkgs/container/trickwork"><img src="https://img.shields.io/badge/Arch-amd64%20%7C%20arm64-success?style=for-the-badge&logo=linux&logoColor=white" alt="Arch" height="36"></a>&nbsp;
  <a href="https://wails.io"><img src="https://img.shields.io/badge/Desktop-Wails-DF0000?style=for-the-badge&logoColor=white" alt="Wails desktop" height="36"></a>&nbsp;
  <a href="https://ca.unraid.net/apps/trickwork-0h072450hg59wx"><img src="https://img.shields.io/badge/Unraid-Template-f15a2c?style=for-the-badge&logo=unraid&logoColor=white" alt="Unraid" height="36"></a>&nbsp;
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPL--3.0-blue?style=for-the-badge&logo=gnu&logoColor=white" alt="License: AGPL-3.0" height="36"></a>
</p>

<br>

<p align="center">
TrickWork turns your images into <b>proportional-font-aware ASCII art</b>, with a <b>live interactive
preview</b> and <b>TXT / XHTML / RTF / PNG export</b>. It's the feature set of the abandoned
<a href="https://sourceforge.net/projects/ascgen2/">ASCGen2</a>, rebuilt: characters are picked by how much
visual "ink" they cover at your chosen font, not just by brightness, so proportional (non-monospace) fonts
render correctly instead of looking stretched or squashed.<br>
<br>
Ships two ways from one shared TypeScript/Canvas core, so the desktop app and the self-hosted container are
always pixel-for-pixel the same tool: a <b>desktop app</b> for Windows, macOS and Linux (via Wails) and a
<b>self-hosted Docker container</b> (with an Unraid Community Applications template). Stateless: no
database, no accounts, nothing to configure beyond the port.
</p>

<br>

<p><a id="table-of-contents" href="#table-of-contents"><picture><source media="(prefers-color-scheme: dark)" srcset=".github/assets/sections/table-of-contents-dark.svg"><img src=".github/assets/sections/table-of-contents.svg" alt="Table of Contents" width="100%"></picture></a></p>

1. [Download](#1-download)
2. [Support](#2-support)
3. [What it looks like](#3-what-it-looks-like)
4. [What it does](#4-what-it-does)
5. [How it compares](#5-how-it-compares)
6. [Getting started](#6-getting-started)
7. [Documentation](#7-documentation)
8. [How AI is used here](#8-how-ai-is-used-here)

<br>

<p><a id="1-download" href="#1-download"><picture><source media="(prefers-color-scheme: dark)" srcset=".github/assets/sections/1-download-dark.svg"><img src=".github/assets/sections/1-download.svg" alt="1. Download" width="100%"></picture></a></p>

<!-- download-buttons: written by scripts/gen_download_buttons.py -->
<p align="center">
  <picture><source media="(prefers-color-scheme: dark)" srcset=".github/assets/sections/group-server-dark.svg"><img src=".github/assets/sections/group-server.svg" alt="Server" width="100%"></picture>
</p>
<p align="center">
  <a href="https://ca.unraid.net/apps/trickwork-0h072450hg59wx"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(0,0,841.9,245.3))" alt="Install from Unraid&#x27;s Community Applications" width="160" height="46.618"></a>
  &nbsp;
  <a href="https://mos-official.net/apps.html?search=TrickWork"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(866,0,841.9,245.3))" alt="Install from the MOS Hub" width="160" height="46.618"></a>
  &nbsp;
  <a href="https://github.com/junkerderprovinz/zimaos-apps#install"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(1732,0,841.9,245.3))" alt="Install from the ZimaOS and CasaOS store" width="160" height="46.618"></a>
  &nbsp;
  <a href="https://github.com/junkerderprovinz/umbrel-apps#install"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(2598,0,841.9,245.3))" alt="Install from the umbrelOS community app store" width="160" height="46.618"></a>
</p>
<p align="center">
  <a href="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/compose.yaml"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(3464,0,841.9,245.3))" alt="Download the docker-compose file" width="160" height="46.618"></a>
  &nbsp;
  <a href="https://github.com/junkerderprovinz/trickwork/releases/latest"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(4330,0,841.9,245.3))" alt="Download the source archive" width="160" height="46.618"></a>
  &nbsp;
  <a href="https://junkerderprovinz.github.io/trickwork/"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(5196,0,841.9,245.3))" alt="Read the documentation" width="160" height="46.618"></a>
</p>
<br>
<p align="center">
  <picture><source media="(prefers-color-scheme: dark)" srcset=".github/assets/sections/group-desktop-dark.svg"><img src=".github/assets/sections/group-desktop.svg" alt="Desktop" width="100%"></picture>
</p>
<p align="center">
  <a href="https://github.com/junkerderprovinz/trickwork/releases/latest/download/trickwork-windows-amd64-installer.exe"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(6062,0,841.9,245.3))" alt="Download for Windows" width="160" height="46.618"></a><a href="https://github.com/junkerderprovinz/trickwork/releases/latest/download/trickwork-windows-arm64-installer.exe"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(6928,0,457.783,245.3))" alt="Download for Windows on ARM" width="87" height="46.618"></a><a href="https://github.com/junkerderprovinz/trickwork/releases/latest/download/trickwork-windows-amd64-portable.exe"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(7410,0,457.783,245.3))" alt="Download the portable Windows app" width="87" height="46.618"></a>
  &nbsp;
  <a href="https://github.com/junkerderprovinz/trickwork/releases/latest/download/trickwork-macos-universal.dmg"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(7892,0,841.9,245.3))" alt="Download for macOS" width="160" height="46.618"></a>
  &nbsp;
  <a href="https://github.com/junkerderprovinz/trickwork/releases/latest/download/trickwork-linux-amd64"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(8758,0,841.9,245.3))" alt="Download for Linux" width="160" height="46.618"></a><a href="https://github.com/junkerderprovinz/trickwork/releases/latest/download/trickwork-linux-arm64"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(9624,0,457.783,245.3))" alt="Download for Linux on ARM" width="87" height="46.618"></a>
</p>
<p align="center">
  <a href="https://github.com/junkerderprovinz/trickwork/releases/latest/download/trickwork-linux-amd64.flatpak"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(10106,0,841.9,245.3))" alt="Download the Flatpak" width="160" height="46.618"></a><a href="https://github.com/junkerderprovinz/trickwork/releases/latest/download/trickwork-linux-arm64.flatpak"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(10972,0,457.783,245.3))" alt="Download the Flatpak for ARM" width="87" height="46.618"></a>
</p>
<!-- /download-buttons -->

<br>

<p><a id="2-support" href="#2-support"><picture><source media="(prefers-color-scheme: dark)" srcset=".github/assets/sections/2-support-dark.svg"><img src=".github/assets/sections/2-support.svg" alt="2. Support" width="100%"></picture></a></p>

<p align="center">
A one-knight job: I build it, keep it running, work through the issues and add what people ask for, until nothing is missing. It is free, with no accounts, no telemetry, no ads and no paid tier. No asterisk anywhere. Nothing readable ever leaves your own walls. Forged on evenings and weekends, with heart and stubbornness.
</p>

<p align="center">
If it has earned a place on your server or computer, toss a coin to your knight: it helps cover the costs and keeps the project alive. It also makes this knight's heart beat a little faster. Three ways below, whichever suits you.
</p>

<br>

<!-- give-buttons: written by scripts/gen_download_buttons.py -->
<p align="center">
  <a href="https://buymeacoffee.com/junkerderprovinz"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(11454,0,841.9,245.3))" alt="Buy me a coffee" width="160" height="46.618"></a>
  &nbsp;
  <a href="https://www.paypal.com/donate/?hosted_button_id=76FVV52TKXTUS"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(12320,0,841.9,245.3))" alt="PayPal" width="160" height="46.618"></a>
  &nbsp;
  <a href="https://junkerderprovinz.github.io/junkerderprovinz/"><img src="https://raw.githubusercontent.com/junkerderprovinz/trickwork/main/.github/assets/download-buttons/buttons.svg?v=40a51a49f406#svgView(viewBox(13186,0,841.9,245.3))" alt="Donate with crypto" width="160" height="46.618"></a>
</p>
<!-- /give-buttons -->


<br>

<p><a id="3-what-it-looks-like" href="#3-what-it-looks-like"><picture><source media="(prefers-color-scheme: dark)" srcset=".github/assets/sections/3-what-it-looks-like-dark.svg"><img src=".github/assets/sections/3-what-it-looks-like.svg" alt="3. What it looks like" width="100%"></picture></a></p>

<p align="center">
  <img src=".github/assets/screenshots/container.png" alt="TrickWork in a browser window at nas.local:3210, turning a knight's helmet into ASCII art" width="100%">
  <br><em>The container: open it in any browser, drop a picture and the preview follows every slider.</em>
</p>

<br>

<p align="center">
  <img src=".github/assets/screenshots/desktop.png" alt="The TrickWork desktop app showing the knight's helmet as ASCII art beside the Transform and Filters cards" width="100%">
  <br><em>The desktop app for Windows, macOS and Linux is the same tool in a window of its own.</em>
</p>

<br>

<p align="center">
  <img src=".github/assets/screenshots/desktop-settings.png" alt="The Look tab of TrickWork's settings with shape, theme, animations, labels and rainbow colours" width="100%">
  <br><em>In Settings you pick the shape, the theme, the accent colour and one of 26 languages.</em>
</p>

<br>

<p><a id="4-what-it-does" href="#4-what-it-does"><picture><source media="(prefers-color-scheme: dark)" srcset=".github/assets/sections/4-what-it-does-dark.svg"><img src=".github/assets/sections/4-what-it-does.svg" alt="4. What it does" width="100%"></picture></a></p>

- **Characters picked by ink, not by brightness.** TrickWork measures how much of each character is inked at the font you chose, so proportional fonts come out right instead of stretched or squashed.
- **A live preview.** Every slider, the character set and the font update it at once.
- **Image adjustments.** Crop, rotate and flip, levels, brightness and contrast, invert, dithering, colour output and sharpening, all with undo and redo.
- **A batch queue.** Drop several images at once; each converts and exports on its own, and one bad file never blocks the rest.
- **Four export formats.** TXT, a styled XHTML document, RTF and a rendered PNG, the one format that keeps a proportional font's look exactly.
- **Ten character sets.** Nine of ASCGen2's original ramps, a 70-character detailed ramp, or a string of your own.

The full list is on the [Start here](https://junkerderprovinz.github.io/trickwork/) page of the documentation.

<br>

<p><a id="5-how-it-compares" href="#5-how-it-compares"><picture><source media="(prefers-color-scheme: dark)" srcset=".github/assets/sections/5-how-it-compares-dark.svg"><img src=".github/assets/sections/5-how-it-compares.svg" alt="5. How it compares" width="100%"></picture></a></p>

Every actively-maintained image-to-ASCII tool (`chafa`, `ascii-image-converter`, `jp2a`, `img2txt`/libcaca) is
CLI-only, monospace-only, and has no live preview. ASCGen2 (the direct inspiration for this project, C#/.NET,
GPLv2, last updated 2015) had all three of those (proportional-width awareness, a real-time GUI, multi-format
export), and nothing since has replaced it. TrickWork is that combination, rebuilt from scratch.

<br>

<p><a id="6-getting-started" href="#6-getting-started"><picture><source media="(prefers-color-scheme: dark)" srcset=".github/assets/sections/6-getting-started-dark.svg"><img src=".github/assets/sections/6-getting-started.svg" alt="6. Getting started" width="100%"></picture></a></p>

- **Desktop app:** pick your system from the buttons at the top. Windows may warn about an unsigned download the first time; click **More info**, then **Run anyway**.
- **Flatpak:** grab the file from the Flatpak button and open it with your software centre, or run `flatpak install --user trickwork-linux-amd64.flatpak`. It brings everything it needs.
- **Docker:**

  ```bash
  docker run -d --name trickwork --restart unless-stopped -p 3210:3210 ghcr.io/junkerderprovinz/trickwork:latest
  ```

  Then open `http://localhost:3210/`. No environment variables, no volumes.
- **Unraid:** open **Apps**, search for **TrickWork** and install it from Community Applications.

Updates, the requirements and the Unraid template by hand are on the [installing page](https://junkerderprovinz.github.io/trickwork/installing/).

### Other Docker hosts

[compose.yaml](compose.yaml) runs TrickWork on any Linux server with Docker. Put it in a folder of its own and start it with `docker compose up -d`.

- **Synology:** in Container Manager, create a project from the file (DSM 7.2 or newer).
- **Proxmox:** run it in a VM or an LXC container that has Docker.
- **MOS:** install TrickWork from the [MOS Hub](https://mos-official.net/apps.html?search=TrickWork).
- **ZimaOS and CasaOS:** add the [community store](https://github.com/junkerderprovinz/zimaos-apps#install) and install TrickWork from it.
- **umbrelOS:** add the [community app store](https://github.com/junkerderprovinz/umbrel-apps#install) and install TrickWork from it.

<br>

<p><a id="7-documentation" href="#7-documentation"><picture><source media="(prefers-color-scheme: dark)" srcset=".github/assets/sections/7-documentation-dark.svg"><img src=".github/assets/sections/7-documentation.svg" alt="7. Documentation" width="100%"></picture></a></p>

The [documentation site](https://junkerderprovinz.github.io/trickwork/) has the full guide:

- [Start here](https://junkerderprovinz.github.io/trickwork/): what TrickWork does, what sets it apart, the credits and the license
- [Installing](https://junkerderprovinz.github.io/trickwork/installing/): desktop, Flatpak, Docker and Unraid, and how the desktop app updates itself
- [How it works and building it](https://junkerderprovinz.github.io/trickwork/development/): the engine and the development commands

<br>

<p><a id="8-how-ai-is-used-here" href="#8-how-ai-is-used-here"><picture><source media="(prefers-color-scheme: dark)" srcset=".github/assets/sections/8-how-ai-is-used-here-dark.svg"><img src=".github/assets/sections/8-how-ai-is-used-here.svg" alt="8. How AI is used here" width="100%"></picture></a></p>

One knight builds this, and AI is one of the tools I work with, the same way I work with an editor or a compiler. It helps me write code and documentation and it checks my work, and that saves me a good many evenings. It does not make the decisions, though. I read and understand everything before it ships, and if something here breaks, that is on me and not on the tool.

You do not have to take my word for it. The code is open and every release note is written by hand. The issue tracker shows how problems actually get handled, including the ones I got wrong the first time. If you find something that is not right, open an issue and I will look at it.

<br>

Bugs, ideas or feature requests? Please [open a GitHub issue](https://github.com/junkerderprovinz/trickwork/issues).

# Installing

TrickWork comes in two forms built from one engine, so the desktop app and the
container always produce the same art from the same image.

## Desktop app

Download the build for your system from the
[latest release](https://github.com/junkerderprovinz/trickwork/releases/latest):

| System | File |
|---|---|
| Windows 10/11, installer | `trickwork-windows-amd64-installer.exe` |
| Windows 10/11, portable | `trickwork-windows-amd64-portable.exe` |
| macOS | `trickwork-macos-universal.dmg` |
| Linux | `trickwork-linux-amd64` (needs `libwebkit2gtk-4.1-0`) |

The portable Windows file and the Linux binary run without installing
anything; on Linux, make the file executable first with `chmod +x`.

!!! note "Windows SmartScreen"
    Windows may show "Windows protected your PC" the first time you run a
    freshly downloaded, unsigned program. Click **More info**, then
    **Run anyway**.

## Docker

```bash
docker run -d \
  --name trickwork \
  --restart unless-stopped \
  -p 3210:3210 \
  ghcr.io/junkerderprovinz/trickwork:latest
```

Then open `http://localhost:3210/`. The image runs on amd64 and arm64 and needs
no environment variables and no volumes. It is also on Docker Hub as
`junkerderprovinz/trickwork`.

## Unraid

TrickWork is in Unraid's Community Applications: open **Apps**, search for
**TrickWork** and install it
([its page in the catalogue](https://ca.unraid.net/apps/trickwork-0h072450hg59wx)).

## From source

The source code of every release is on its
[release page](https://github.com/junkerderprovinz/trickwork/releases/latest),
and the [README](https://github.com/junkerderprovinz/trickwork#9-development)
explains how to build it.

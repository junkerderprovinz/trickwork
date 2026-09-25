# Installing

TrickWork comes in two forms built from one engine, so the desktop app and the
container always produce the same art from the same image.

## Requirements

- **Container:** any amd64 or arm64 Docker host. No database and no volumes.
- **Desktop:** Windows 10 or 11 (x64 or ARM), macOS, or Linux with
  `libwebkit2gtk-4.1-0`.

## Desktop app

Download the build for your system from the
[latest release](https://github.com/junkerderprovinz/trickwork/releases/latest):

| System | File |
|---|---|
| Windows 10/11, installer | `trickwork-windows-amd64-installer.exe` |
| Windows 10/11, portable | `trickwork-windows-amd64-portable.exe` |
| Windows 11 on ARM | `trickwork-windows-arm64-installer.exe` or `-portable.exe` |
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

To add the template by hand instead, run this in the Unraid console:

```bash
mkdir -p /boot/config/plugins/dockerMan/templates-user && \
curl -fsSL -o /boot/config/plugins/dockerMan/templates-user/my-trickwork.xml \
  https://raw.githubusercontent.com/junkerderprovinz/unraid-apps/main/trickwork/trickwork.xml
```

Then pick **Docker, Add Container, trickwork** under *User templates*, choose a
port and press **Apply**. The file name keeps its `my-` prefix, which is what
makes Unraid treat it as a user template.

## From source

The source code of every release is on its
[release page](https://github.com/junkerderprovinz/trickwork/releases/latest),
and [How it works and building it](development.md) explains how to build it.

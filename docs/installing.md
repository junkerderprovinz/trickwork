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
| Linux | `trickwork-linux-amd64`, on ARM `trickwork-linux-arm64` (both need `libwebkit2gtk-4.1-0`) |

The portable Windows file and the Linux binary run without installing
anything; on Linux, make the file executable first with `chmod +x`.

The Windows **installer** installs for all users under
`C:\Program Files\TrickWork` and asks for an administrator once, while it
installs; later updates ask nobody (see [Updates](#updates)). A page asks
whether you want a Start menu entry and a desktop shortcut, both ticked at
first, and both go to every user on the computer. The next install, silent or
not, starts from your answer and removes a shortcut you left out.

The installer also cleans up after older versions. An installation from 1.3.0
or earlier under `C:\Program Files\TrickWork\TrickWork` goes, and so does a
copy installed for you alone under `AppData\Local\Programs`, with its
shortcuts and its entry under Apps. It never touches your settings in
`%AppData%\TrickWork` or what the window keeps in `%AppData%\TrickWork.exe`.

### Updates

The desktop app updates itself from GitHub. It asks for the newest release,
downloads the file for your system in the background and checks it against
the release's `checksums.txt`. The new version starts the next time you open
TrickWork, so nothing changes while it runs, and a note in the corner of the
window says when it is ready. Pre-releases are never installed.
**Update automatically** in the **General** tab of **Settings** turns this off; it
is on from the start.

**The installed copy** under Program Files cannot replace itself, since no
user may write there. A scheduled task named **TrickWork Update** does it
instead, once a day and five minutes after the computer starts, whether
TrickWork is open or not. It replaces `TrickWork.exe`, sets the version shown
under Apps and writes what it did, or why it did not, to
`%ProgramData%\TrickWork\update.log`. There is one installation, so the switch
applies to everyone on the computer: it lives in
`%ProgramData%\TrickWork\settings.json`, which every user may change, and the
task skips its run while it is off. An open window notices within a few
minutes when the task has put a new version in place and shows the note. The
replaced program waits beside the new one as `TrickWork.exe.old` until a later
run removes it.

**A portable copy**, such as `trickwork-windows-amd64-portable.exe`, updates
itself while it runs: a minute after it starts and once a day after that, in
its own folder, and it stays portable. The app on macOS and Linux does the
same. A folder it cannot write to, or a macOS app your account cannot change,
stays as it is. The reason is in `update.log` next to the setting:
`%AppData%\TrickWork` on Windows, `~/Library/Application Support/TrickWork` on
macOS and `~/.config/TrickWork` on Linux.

#### Why the task runs as SYSTEM

Program Files belongs to the administrators. A program that replaces itself
there without asking anyone needs an account that may write there, and a
scheduled task under the system account is how Windows provides one; Firefox's
maintenance service and Chrome's updater task work the same way. The task
writes to three places and nowhere else: the installation folder,
`C:\Program Files\TrickWork`; the entry under Apps, in
`HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\TrickWork`; and
`%ProgramData%\TrickWork`, for its log. It reads nothing from any user's
profile and never opens a window. The folder under ProgramData belongs to the
administrators, and only `settings.json` in it is open to other users. The
installer has no page for choosing another folder. Together that leaves no
file a user could swap for one the system account would run or write to. It
downloads only from GitHub over HTTPS and installs a file only when it matches
`checksums.txt`.

#### Uninstalling

Apps, TrickWork, Uninstall asks for an administrator and removes the program
with its shortcuts, its entry under Apps and the remembered shortcut choice.
The scheduled task goes too, and so does `%ProgramData%\TrickWork` with the
switch and the log. In the installation folder it deletes only the files the
installer and the updates put there. Every user's settings in `%AppData%\TrickWork` and
`%AppData%\TrickWork.exe` stay, so a later install picks them up.

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

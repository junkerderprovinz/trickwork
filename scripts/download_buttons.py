"""The download buttons the README shows, read by gen_download_buttons.py.

Each entry names a button the generator knows and where it leads. The rows,
their order, the colours and the words are the generator's, the same in every
repository.
"""

REPO = "trickwork"
RELEASE = "https://github.com/junkerderprovinz/trickwork/releases/latest/download/"

BUTTONS = {
    "windows": RELEASE + "trickwork-windows-amd64-installer.exe",
    "windows-arm": RELEASE + "trickwork-windows-arm64-installer.exe",
    "windows-portable": RELEASE + "trickwork-windows-amd64-portable.exe",
    "macos": RELEASE + "trickwork-macos-universal.dmg",
    "linux": RELEASE + "trickwork-linux-amd64",
    # A browser cannot download an image, so this opens the package page, which
    # carries the pull command and every tag.
    "docker": "https://github.com/junkerderprovinz/trickwork/pkgs/container/trickwork",
    # A release's "Source code (zip)" is the whole repository at that tag, and
    # GitHub gives the newest one no fixed address, so this leads to the release
    # that lists it.
    "source": "https://github.com/junkerderprovinz/trickwork/releases/latest",
    "docs": "https://junkerderprovinz.github.io/trickwork/",
}

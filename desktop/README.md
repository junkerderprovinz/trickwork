# TrickWork: desktop build

Portable Wails v2 wrapper. Reuses the exact same built `ui/` bundle the
container serves, via the root module's `webembed` package.

## Build locally

```
npm run build --workspace core
npm run build --workspace ui
rm -rf ../webembed/dist && cp -r ../ui/dist ../webembed/dist
cd desktop
go mod tidy
wails build
```

Output: `desktop/build/bin/TrickWork[.exe]`, a single portable
binary, no installer, no code signing configured.

## Updates

The binary only updates itself when it knows its version. The tag build in
`.github/workflows/desktop.yml` stamps it:

```
wails build -ldflags "-X main.version=1.4.0"
```

A build without it is a dev build and never looks for updates. The updater
itself lives in `update/` and knows nothing about TrickWork beyond what
`updates.go` passes in: the repository, the version and the release file for
each platform.

To try the whole path locally, build with `-tags updatetest`. That build
reads `TRICKWORK_UPDATE_API` (a stand-in for `https://api.github.com` that
serves `/repos/junkerderprovinz/trickwork/releases/latest`) and
`TRICKWORK_UPDATE_DELAY` (how long to wait before the first check, such as
`15s`). Release builds leave the tag out, so no environment variable can
change where an update comes from.

Linux requires `libgtk-3-dev` and `libwebkit2gtk-4.1-dev` at build time and
`libwebkit2gtk-4.1-0` at runtime.

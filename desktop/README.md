# TrickWork — desktop build

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

Output: `desktop/build/bin/TrickWork[.exe]` — a single portable
binary, no installer, no code signing configured.

Linux requires `libgtk-3-dev` and `libwebkit2gtk-4.1-dev` at build time and
`libwebkit2gtk-4.1-0` at runtime.

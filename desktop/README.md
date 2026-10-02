# TrickWork: desktop build

Portable Wails v3 wrapper. Reuses the exact same built `ui/` bundle the
container serves, via the root module's `webembed` package.

## Build locally

From the repository root, with the Wails CLI of the version `go.mod` names
(`go install github.com/wailsapp/wails/v3/cmd/wails3@v3.0.0-beta.27`):

```
npm install --ignore-scripts
node scripts/desktop.mjs
```

The script builds `core` and `ui`, copies the bundle into `webembed/dist`, has
Wails write the manifest, icons and version resource into `build/`, and
compiles. Output: `desktop/build/bin/TrickWork[.exe]`, a single portable
binary, no code signing configured. On Windows, `--installer` also builds
`build/bin/TrickWork-amd64-installer.exe` from `build/windows/nsis/project.nsi`,
which needs `makensis` on the PATH.

## Updates

The binary only updates itself when it knows its version. The tag build in
`.github/workflows/desktop.yml` stamps it:

```
node scripts/desktop.mjs --version 1.4.0
```

which sets `main.version` through `-ldflags`. A build without it is a dev
build and never looks for updates. The updater itself lives in `update/` and
knows nothing about TrickWork beyond what `updates.go` passes in: the
repository, the version and the release file for each platform.

To try the whole path locally, build with `--updatetest`, which adds the
`updatetest` tag. That build reads `TRICKWORK_UPDATE_API` (a stand-in for
`https://api.github.com` that serves
`/repos/junkerderprovinz/trickwork/releases/latest`) and
`TRICKWORK_UPDATE_DELAY` (how long to wait before the first check, such as
`15s`, which is also how often an installed copy looks for a version the
scheduled task has put in place). Release builds leave the tag out, so
nothing on the computer can change where an update comes from.

The installed copy on Windows is updated by the scheduled task, which starts
`TrickWork.exe --update` as the system account. An updatetest build installs
as **TrickWork Test**, with its own entry, task and folder under ProgramData,
so it can sit beside a real installation:

```
node scripts/desktop.mjs --version 1.4.0 --installer --updatetest
```

That gives `build/bin/TrickWorkTest-amd64-installer.exe`. The task starts
without your environment, so it reads the stand-in's address from
`updatetest-api` in `%ProgramData%\TrickWork Test`, which only an
administrator can write, and `schtasks /Run /TN "TrickWork Test Update"` from
an elevated prompt runs it at once.

Linux requires `libgtk-3-dev` and `libwebkit2gtk-4.1-dev` at build time and
`libwebkit2gtk-4.1-0` at runtime.

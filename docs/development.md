# How it works and building it

## How it works

A single TypeScript and Canvas conversion engine (`core/`) is the only place
the algorithm lives. It is built once and embedded in both packages, so the
desktop app and the container never drift apart or disagree on what an image
should look like. There is no server-side logic to speak of: every operation is
load an image, adjust, export, and nothing is remembered between sessions.

The desktop app is a [Wails](https://wails.io) wrapper around the same engine
and interface the container serves.

## Building it

```bash
npm install
npm run build              # builds core/ then ui/
npm run test --workspace core
npm run typecheck
npm run e2e --workspace ui  # Playwright; run `npx playwright install --with-deps chromium` first
```

### Container image

```bash
docker build -t trickwork:dev -f container/Dockerfile .
docker run -p 3210:3210 trickwork:dev
```

### Desktop app

```bash
node scripts/desktop.mjs
```

The result is `desktop/build/bin/TrickWork` (`TrickWork.exe` on Windows).
It is a dev build, which never updates itself; only a build with
`--version x.y.z`, as the release workflow makes, does.
`desktop/README.md` names the Wails CLI the script needs and explains how to
try an update against a local stand-in for GitHub.

// Builds the desktop app for the platform it runs on, the way CI does.
//
//     node scripts/desktop.mjs [--version x.y.z] [--arch amd64|arm64] [--installer] [--updatetest]
//
// Windows gets TrickWork.exe and, with --installer, the NSIS installer. macOS
// gets TrickWork.app holding one binary for both architectures. Linux gets the
// bare binary. Everything lands in desktop/build/bin.
//
// Only a build given --version knows its version, which the release workflow
// takes from the tag. Any other build is a dev build that never updates itself.
//
// --updatetest builds with the updatetest tag (desktop/updatetest.go). Its
// installer puts "TrickWork Test" beside a real installation, so the updates
// can be tried against a local stand-in for GitHub.
//
// The interface is built first and copied into webembed/dist, which the
// container embeds too. Wails' generated files (manifest, version resource,
// Info.plist, the installer's helper macros, the icons) are written into
// desktop/build on every run and ignored by git, so a build leaves the tree as
// it found it.

import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const desktop = join(root, 'desktop')
const bin = join(desktop, 'build', 'bin')

const args = process.argv.slice(2)
const option = (name) => {
  const at = args.indexOf(name)
  return at >= 0 ? args[at + 1] : undefined
}
const hostArch = process.arch === 'arm64' ? 'arm64' : 'amd64'
const arch = option('--arch') ?? hostArch
const version = option('--version') ?? ''
const installer = args.includes('--installer')
const updatetest = args.includes('--updatetest')
const tags = (extra = '') => (updatetest ? 'production,updatetest' : 'production') + extra

// NSIS and Info.plist take three numbers only.
if (version !== '' && !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`--version wants three numbers such as 1.4.0, not ${version}`)
  process.exit(1)
}
const numeric = version || '0.0.0'

function run(command, commandArgs, { cwd = desktop, env = {} } = {}) {
  const res = spawnSync(command, commandArgs, { cwd, stdio: 'inherit', env: { ...process.env, ...env } })
  if (res.status !== 0) {
    console.error(`failed: ${command} ${commandArgs.join(' ')}`)
    process.exit(res.status ?? 1)
  }
}

function goBuild(out, { goos, goarch, cgo, tags, ldflags = '', env = {} }) {
  run('go', [
    'build', '-tags', tags, '-trimpath', '-buildvcs=false',
    '-ldflags', `-s -w ${ldflags} -X main.version=${version}`,
    '-o', out, '.',
  ], { env: { GOOS: goos, GOARCH: goarch, CGO_ENABLED: cgo, ...env } })
}

// Wails writes its own version resource with the strings under the language
// 0000, which Windows does not read, so the file's properties would show them
// blank.
function writeWindowsVersion() {
  const info = {
    fixed: { file_version: `${numeric}.0`, product_version: `${numeric}.0` },
    info: {
      '0409': {
        ProductVersion: version || 'dev',
        CompanyName: 'TrickWork',
        FileDescription: 'TrickWork',
        LegalCopyright: 'junkerderprovinz',
        ProductName: 'TrickWork',
        Comments: 'Turns images into proportional-font-aware ASCII art',
      },
    },
  }
  writeFileSync(join(desktop, 'build', 'windows', 'info.json'), JSON.stringify(info, null, '\t') + '\n')
}

console.log(`building TrickWork ${version || 'dev'}`)

// One fixed string through a shell: Node refuses to spawn npm's .cmd without a
// shell, and deprecates an argument array with one (DEP0190).
const ui = spawnSync('npm run build', { cwd: root, stdio: 'inherit', shell: true })
if (ui.status !== 0) {
  console.error('the interface did not build, so the app would embed a stale copy')
  process.exit(ui.status ?? 1)
}
// Replaced rather than merged, so a file removed from the interface leaves the
// app too.
const embed = join(root, 'webembed', 'dist')
rmSync(embed, { recursive: true, force: true })
cpSync(join(root, 'ui', 'dist'), embed, { recursive: true })

rmSync(bin, { recursive: true, force: true })
mkdirSync(bin, { recursive: true })

run('wails3', [
  'update', 'build-assets', '-silent',
  '-name', 'TrickWork', '-binaryname', 'TrickWork',
  '-config', 'build/config.yml', '-dir', 'build',
  '-productversion', numeric,
])
run('wails3', [
  'generate', 'icons', '-input', 'build/appicon.png',
  '-windowsfilename', 'build/windows/icon.ico', '-macfilename', 'build/darwin/icons.icns',
])

if (process.platform === 'win32') {
  writeWindowsVersion()
  const syso = join(desktop, `wails_windows_${arch}.syso`)
  run('wails3', [
    'generate', 'syso', '-arch', arch, '-icon', 'build/windows/icon.ico',
    '-manifest', 'build/windows/wails.exe.manifest', '-info', 'build/windows/info.json', '-out', syso,
  ])
  const exe = join(bin, 'TrickWork.exe')
  try {
    goBuild(exe, { goos: 'windows', goarch: arch, cgo: '0', tags: tags(), ldflags: '-H windowsgui' })
  } finally {
    // Go links every .syso in the package, and one left behind would end up in
    // the next build for the other architecture.
    rmSync(syso, { force: true })
  }

  if (installer) {
    const nsis = join(desktop, 'build', 'windows', 'nsis')
    run('wails3', ['generate', 'webview2bootstrapper', '-dir', nsis])
    // project.nsi carries a byte order mark, and wails_tools.nsh, which Wails
    // writes without one, would otherwise be read in the system code page.
    run('makensis', [
      '-INPUTCHARSET', 'UTF8',
      ...(updatetest ? ['-DINFO_PRODUCTNAME=TrickWork Test', '-DINFO_PROJECTNAME=TrickWorkTest'] : []),
      `-DARG_WAILS_${arch.toUpperCase()}_BINARY=${exe}`,
      join(nsis, 'project.nsi'),
    ])
  }
} else if (process.platform === 'darwin') {
  // Both architectures in one binary, so one download serves every Mac. The
  // deployment target matches what Wails' own template builds for.
  const mac = { MACOSX_DEPLOYMENT_TARGET: '12.0', CGO_CFLAGS: '-mmacosx-version-min=12.0', CGO_LDFLAGS: '-mmacosx-version-min=12.0' }
  for (const a of ['amd64', 'arm64']) {
    goBuild(join(bin, `TrickWork-${a}`), { goos: 'darwin', goarch: a, cgo: '1', tags: tags(), env: mac })
  }
  const app = join(bin, 'TrickWork.app', 'Contents')
  mkdirSync(join(app, 'MacOS'), { recursive: true })
  mkdirSync(join(app, 'Resources'), { recursive: true })
  run('lipo', ['-create', '-output', join(app, 'MacOS', 'TrickWork'), join(bin, 'TrickWork-amd64'), join(bin, 'TrickWork-arm64')])
  rmSync(join(bin, 'TrickWork-amd64'))
  rmSync(join(bin, 'TrickWork-arm64'))
  cpSync(join(desktop, 'build', 'darwin', 'icons.icns'), join(app, 'Resources', 'icons.icns'))
  cpSync(join(desktop, 'build', 'darwin', 'Info.plist'), join(app, 'Info.plist'))
  // An ad-hoc signature over the whole bundle, as Wails' own template does:
  // Apple Silicon refuses to start code that carries none.
  run('codesign', ['--force', '--deep', '--sign', '-', join(bin, 'TrickWork.app')])
} else {
  // GTK 3 and WebKitGTK 4.1, which every current distribution ships and which
  // the builds before this one already needed.
  goBuild(join(bin, 'TrickWork'), { goos: 'linux', goarch: arch, cgo: '1', tags: tags(',gtk3') })
}

console.log(`done: ${version || 'dev'}`)

package main

import (
	"context"
	"io"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/junkerderprovinz/trickwork/desktop/update"
)

// version is the release this binary was built from, set by the tag build with
// -ldflags "-X main.version=1.4.0". A build without it is a dev build and never
// updates itself.
var version string

// The first check waits for the window to settle; one a day follows. An
// installed copy looks every followEvery for a version the scheduled task has
// put in place.
var (
	updateAPI   = "https://api.github.com"
	firstCheck  = time.Minute
	followEvery = 10 * time.Minute
)

const checkEvery = 24 * time.Hour

// updateReadyEvent carries the version that waits for the next start.
const updateReadyEvent = "update:ready"

func newUpdater(logger *log.Logger) *update.Updater {
	return &update.Updater{
		Repo:    "junkerderprovinz/trickwork",
		Version: version,
		Assets: map[string]string{
			"windows/amd64": "trickwork-windows-amd64-portable.exe",
			"windows/arm64": "trickwork-windows-arm64-portable.exe",
			"darwin/amd64":  "trickwork-macos-universal.zip",
			"darwin/arm64":  "trickwork-macos-universal.zip",
			"linux/amd64":   "trickwork-linux-amd64",
			"linux/arm64":   "trickwork-linux-arm64",
		},
		API:  updateAPI,
		Logf: logger.Printf,
	}
}

// openUpdateLog appends to the log at path, since a windowed program on
// Windows has no console to say why an update did not happen. A log grown past
// 256 KiB starts over.
func openUpdateLog(path string) *log.Logger {
	var w io.Writer = os.Stderr
	if os.MkdirAll(filepath.Dir(path), 0o755) == nil {
		flags := os.O_CREATE | os.O_WRONLY | os.O_APPEND
		if info, err := os.Stat(path); err == nil && info.Size() > 256<<10 {
			flags |= os.O_TRUNC
		}
		if f, err := os.OpenFile(path, flags, 0o644); err == nil {
			// The file comes first: MultiWriter stops at the first error, and
			// a windowed program's stderr may be no handle at all.
			w = io.MultiWriter(f, os.Stderr)
		}
	}
	return log.New(w, "", log.LstdFlags)
}

// userUpdateLog is update.log beside update.json.
func userUpdateLog() *log.Logger {
	dir, err := configDir()
	if err != nil {
		return log.New(os.Stderr, "", log.LstdFlags)
	}
	return openUpdateLog(filepath.Join(dir, "update.log"))
}

// keepUpdated runs for the life of the window of a copy that updates itself.
// It is the only caller of the updater in its process, so there is never more
// than one update in flight.
func (a *App) keepUpdated(ctx context.Context) {
	timer := time.NewTimer(firstCheck)
	defer timer.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-timer.C:
		}
		if a.settings.autoUpdate() {
			if v := updateOnce(ctx, a.updater, a.log, &a.swapping); v != "" {
				a.app.Event.Emit(updateReadyEvent, v)
			}
		}
		timer.Reset(checkEvery)
	}
}

// followInstalled runs for the installed copy, which cannot replace itself. It
// waits for the scheduled task to record a newer version in the uninstall
// entry and says once that it starts next time.
func (a *App) followInstalled(ctx context.Context) {
	tick := time.NewTicker(followEvery)
	defer tick.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-tick.C:
		}
		if v := update.InstalledVersion(product); update.Newer(v, version) {
			a.app.Event.Emit(updateReadyEvent, v)
			return
		}
	}
}

// updateOnce checks, downloads and swaps, holding swapping for the swap. It
// returns the version put in place, or "" when there was none.
func updateOnce(ctx context.Context, u *update.Updater, logger *log.Logger, swapping *sync.Mutex) string {
	rel, err := u.Check(ctx)
	if err != nil {
		logger.Printf("update: %v", err)
		return ""
	}
	if rel == nil {
		logger.Printf("update: no newer release")
		return ""
	}
	download, err := u.Fetch(ctx, rel)
	if err != nil {
		logger.Printf("update: not updating to %s: %v", rel.Version, err)
		return ""
	}
	defer os.Remove(download)

	swapping.Lock()
	err = u.Swap(download, rel)
	swapping.Unlock()
	if err != nil {
		logger.Printf("update: not updating to %s: %v", rel.Version, err)
		return ""
	}
	logger.Printf("update: %s is in place and starts next time", rel.Version)
	return rel.Version
}

// AutoUpdate reports the "Update automatically" setting to the window.
func (a *App) AutoUpdate() bool {
	return a.settings.autoUpdate()
}

// SetAutoUpdate stores the setting, which the next check reads: this copy's
// own, or the scheduled task's for the installed copy.
func (a *App) SetAutoUpdate(on bool) error {
	return a.settings.setAutoUpdate(on)
}

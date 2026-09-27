package main

import (
	"context"
	"io"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/junkerderprovinz/trickwork/desktop/update"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// version is the release this binary was built from, set by the tag build with
// -ldflags "-X main.version=1.4.0". A build without it is a dev build and never
// updates itself.
var version string

// The first check waits for the window to settle; one a day follows.
var (
	updateAPI  = "https://api.github.com"
	firstCheck = time.Minute
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
		},
		// Wails names the installer's entry after the company and the
		// product, and both are TrickWork.
		UninstallKey: "TrickWorkTrickWork",
		API:          updateAPI,
		Logf:         logger.Printf,
	}
}

// openUpdateLog writes to update.log beside update.json, since a windowed
// program on Windows has no console to say why an update did not happen. A log
// grown past 256 KiB starts over.
func openUpdateLog() *log.Logger {
	var w io.Writer = os.Stderr
	if dir, err := configDir(); err == nil && os.MkdirAll(dir, 0o755) == nil {
		path := filepath.Join(dir, "update.log")
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

// keepUpdated runs for the life of the window. It is the only caller of the
// updater, so there is never more than one update in flight.
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
			a.updateOnce(ctx)
		}
		timer.Reset(checkEvery)
	}
}

func (a *App) updateOnce(ctx context.Context) {
	rel, err := a.updater.Check(ctx)
	if err != nil {
		a.log.Printf("update: %v", err)
		return
	}
	if rel == nil {
		a.log.Printf("update: no newer release")
		return
	}
	download, err := a.updater.Fetch(ctx, rel)
	if err != nil {
		a.log.Printf("update: not updating to %s: %v", rel.Version, err)
		return
	}
	defer os.Remove(download)

	a.swapping.Lock()
	err = a.updater.Swap(download, rel)
	a.swapping.Unlock()
	if err != nil {
		a.log.Printf("update: not updating to %s: %v", rel.Version, err)
		return
	}
	a.log.Printf("update: %s is in place and starts next time", rel.Version)
	runtime.EventsEmit(ctx, updateReadyEvent, rel.Version)
}

// AutoUpdate reports the "Update automatically" setting to the window.
func (a *App) AutoUpdate() bool {
	return a.settings.autoUpdate()
}

// SetAutoUpdate stores the setting. The next daily check reads it.
func (a *App) SetAutoUpdate(on bool) error {
	return a.settings.setAutoUpdate(on)
}

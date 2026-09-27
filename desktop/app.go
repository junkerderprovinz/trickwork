package main

import (
	"context"
	"log"
	"sync"

	"github.com/junkerderprovinz/trickwork/desktop/update"
)

// App exposes Go methods to the frontend through Wails bindings: the native
// save dialog and the "Update automatically" setting.
type App struct {
	ctx      context.Context
	settings *updateSettings
	// installed marks the copy under Program Files, which the scheduled task
	// updates; updater and log are nil there.
	installed bool
	updater   *update.Updater
	log       *log.Logger
	swapping  sync.Mutex
}

func NewApp() *App {
	if isInstalled() {
		return &App{installed: true, settings: loadUpdateSettings(machineSettingsPath())}
	}
	logger := userUpdateLog()
	return &App{
		settings: loadUpdateSettings(userSettingsPath()),
		updater:  newUpdater(logger),
		log:      logger,
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	if version == "" {
		return
	}
	if a.installed {
		go a.followInstalled(ctx)
		return
	}
	a.updater.Cleanup()
	go a.keepUpdated(ctx)
}

// shutdown takes the swap lock and keeps it, so a swap under way finishes and
// none starts while the program exits.
func (a *App) shutdown(context.Context) {
	a.swapping.Lock()
}

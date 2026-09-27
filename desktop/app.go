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
	updater  *update.Updater
	log      *log.Logger
	swapping sync.Mutex
}

func NewApp() *App {
	logger := openUpdateLog()
	return &App{
		settings: loadUpdateSettings(),
		updater:  newUpdater(logger),
		log:      logger,
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.updater.Cleanup()
	if version != "" {
		go a.keepUpdated(ctx)
	}
}

// shutdown takes the swap lock and keeps it, so a swap under way finishes and
// none starts while the program exits.
func (a *App) shutdown(context.Context) {
	a.swapping.Lock()
}

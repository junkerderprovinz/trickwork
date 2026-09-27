package main

import (
	"context"
	"log"
	"sync"

	"github.com/wailsapp/wails/v3/pkg/application"

	"github.com/junkerderprovinz/trickwork/desktop/update"
)

// App is the Wails service behind the frontend's bindings: the native save
// dialog and the "Update automatically" setting.
type App struct {
	app      *application.App
	window   *application.WebviewWindow
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

// ServiceStartup gets the application's context, which ends when it quits.
func (a *App) ServiceStartup(ctx context.Context, _ application.ServiceOptions) error {
	if version == "" {
		return nil
	}
	if a.installed {
		go a.followInstalled(ctx)
		return nil
	}
	a.updater.Cleanup()
	go a.keepUpdated(ctx)
	return nil
}

// ServiceShutdown takes the swap lock and keeps it, so a swap under way
// finishes and none starts while the program exits.
func (a *App) ServiceShutdown() error {
	a.swapping.Lock()
	return nil
}

package main

import (
	"context"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App exposes Go-side methods to the frontend via Wails bindings, so the
// desktop build can offer a native save dialog instead of a browser download
// prompt when exporting (spec §4 "desktop/").
type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// SaveExport opens a native "Save As" dialog for the given suggested
// filename, then writes data to the chosen path. Returns the chosen path,
// or an empty string if the user cancelled.
func (a *App) SaveExport(suggestedFilename string, data []byte) (string, error) {
	path, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: suggestedFilename,
	})
	if err != nil {
		return "", err
	}
	if path == "" {
		return "", nil // user cancelled
	}
	if err := os.WriteFile(path, data, 0o644); err != nil {
		return "", err
	}
	return path, nil
}

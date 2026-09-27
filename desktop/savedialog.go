package main

import (
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// SaveExport opens a native "Save As" dialog for the given suggested
// filename, then writes data to the chosen path. Returns the chosen path,
// or an empty string if the user cancelled. The desktop build exports through
// it because a browser download is unreliable in the Wails webviews.
func (a *App) SaveExport(suggestedFilename string, data []byte) (string, error) {
	path, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: suggestedFilename,
	})
	if err != nil {
		return "", err
	}
	if path == "" {
		return "", nil
	}
	if err := os.WriteFile(path, data, 0o644); err != nil {
		return "", err
	}
	return path, nil
}

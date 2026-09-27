package main

import "os"

// SaveExport opens a native "Save As" dialog for the given suggested
// filename, then writes data to the chosen path. Returns the chosen path,
// or an empty string if the user cancelled. The desktop build exports through
// it because a browser download is unreliable in the Wails webviews.
func (a *App) SaveExport(suggestedFilename string, data []byte) (string, error) {
	path, _ := a.app.Dialog.SaveFile().
		SetFilename(suggestedFilename).
		AttachToWindow(a.window).
		PromptForSingleSelection()
	// Wails on Windows reports a cancel as an error from a package of its own
	// that cannot be matched, so the missing path is what tells.
	if path == "" {
		return "", nil
	}
	if err := os.WriteFile(path, data, 0o644); err != nil {
		return "", err
	}
	return path, nil
}

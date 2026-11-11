package main

import (
	"os"

	"github.com/junkerderprovinz/trickwork/desktop/portal"
)

// portalSave asks the desktop where a Flatpak may save. The tests stand in for
// the portal here.
var portalSave = portal.SaveFile

// SaveExport opens a native "Save As" dialog for the given suggested
// filename, then writes data to the chosen path. Returns the chosen path,
// or an empty string if the user cancelled. The desktop build exports through
// it because a browser download is unreliable in the Wails webviews.
func (a *App) SaveExport(suggestedFilename string, data []byte) (string, error) {
	path, err := a.saveTarget(suggestedFilename)
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

// saveTarget asks where to save. Wails' dialog is GTK's own on Linux, which in
// a Flatpak only shows the sandbox, so there the desktop's portal asks instead.
func (a *App) saveTarget(name string) (string, error) {
	if a.Flatpak() {
		return portalSave(name)
	}
	// Wails on Windows reports a cancel as an error from a package of its own
	// that cannot be matched, so the missing path is what tells.
	path, _ := a.app.Dialog.SaveFile().
		SetFilename(name).
		AttachToWindow(a.window).
		PromptForSingleSelection()
	return path, nil
}

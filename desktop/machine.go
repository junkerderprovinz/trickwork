package main

import "path/filepath"

// product names the installation for all users: its entry under Apps, its
// scheduled task and its folder under ProgramData, and the user's own folder
// for the settings. desktop/installer installs under the same name.
// ownWebview keeps the window's storage in that folder instead of the one
// Wails names after the program file, which a test build shares with a real
// installation.
var (
	product    = "TrickWork"
	ownWebview = false
)

// machineSettingsFile holds the installed copy's switch in the folder under
// ProgramData, the one file there the installer opens to every user.
const machineSettingsFile = "settings.json"

func machineSettingsPath() (string, error) {
	dir, err := machineData()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, machineSettingsFile), nil
}

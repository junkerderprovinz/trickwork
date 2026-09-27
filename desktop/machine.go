package main

import "path/filepath"

// product names the installation for all users: its entry under Apps, its
// scheduled task and its folder under ProgramData. It is INFO_PRODUCTNAME in
// build/windows/nsis/project.nsi, which Wails takes from build/config.yml.
var product = "TrickWork"

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

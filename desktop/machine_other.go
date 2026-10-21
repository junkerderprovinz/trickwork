//go:build !windows

package main

import (
	"errors"
	"os"
	"path/filepath"
)

// isInstalled reports false: only the Windows installer puts a copy in place
// for all users.
func isInstalled() bool { return false }

// installLanguage is the language the Linux installer's welcome page chose,
// which it records in install.json beside the program. Nothing else puts that
// file there, so a copy on macOS or one run from anywhere else has none.
func installLanguage() string {
	exe, err := os.Executable()
	if err != nil {
		return ""
	}
	return readLanguage(filepath.Join(filepath.Dir(exe), "install.json"))
}

func machineData() (string, error) {
	return "", errors.New("only Windows has a folder for all users")
}

func updateInstalled() error {
	return errors.New("--update is what the Windows installer's scheduled task runs")
}

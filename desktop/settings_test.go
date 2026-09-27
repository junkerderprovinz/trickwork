package main

import (
	"os"
	"path/filepath"
	"testing"
)

// useConfigDir points os.UserConfigDir at a fresh folder on every platform.
func useConfigDir(t *testing.T) string {
	dir := t.TempDir()
	t.Setenv("AppData", dir)
	t.Setenv("XDG_CONFIG_HOME", dir)
	t.Setenv("HOME", dir)
	got, err := configDir()
	if err != nil {
		t.Fatal(err)
	}
	return got
}

func TestAutoUpdateIsOnWithoutASettingsFile(t *testing.T) {
	useConfigDir(t)
	if !loadUpdateSettings().autoUpdate() {
		t.Error("off without a settings file")
	}
}

func TestAutoUpdateSurvivesARestart(t *testing.T) {
	useConfigDir(t)
	if err := loadUpdateSettings().setAutoUpdate(false); err != nil {
		t.Fatal(err)
	}
	if loadUpdateSettings().autoUpdate() {
		t.Error("turned off, but on after loading again")
	}
	if err := loadUpdateSettings().setAutoUpdate(true); err != nil {
		t.Fatal(err)
	}
	if !loadUpdateSettings().autoUpdate() {
		t.Error("turned on, but off after loading again")
	}
}

func TestAutoUpdateIsOnWhenTheFileDoesNotSay(t *testing.T) {
	dir := useConfigDir(t)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "update.json"), []byte(`{}`), 0o644); err != nil {
		t.Fatal(err)
	}
	if !loadUpdateSettings().autoUpdate() {
		t.Error("off with a file that does not name the setting")
	}
}

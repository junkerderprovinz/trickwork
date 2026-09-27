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
	if !loadUpdateSettings(userSettingsPath()).autoUpdate() {
		t.Error("off without a settings file")
	}
}

func TestAutoUpdateSurvivesARestart(t *testing.T) {
	useConfigDir(t)
	if err := loadUpdateSettings(userSettingsPath()).setAutoUpdate(false); err != nil {
		t.Fatal(err)
	}
	if loadUpdateSettings(userSettingsPath()).autoUpdate() {
		t.Error("turned off, but on after loading again")
	}
	if err := loadUpdateSettings(userSettingsPath()).setAutoUpdate(true); err != nil {
		t.Fatal(err)
	}
	if !loadUpdateSettings(userSettingsPath()).autoUpdate() {
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
	if !loadUpdateSettings(userSettingsPath()).autoUpdate() {
		t.Error("off with a file that does not name the setting")
	}
}

func TestAutoUpdateIsOnWhenTheFileIsCorrupt(t *testing.T) {
	path := filepath.Join(t.TempDir(), "settings.json")
	if err := os.WriteFile(path, []byte(`{"autoUpdate":`), 0o644); err != nil {
		t.Fatal(err)
	}
	if !readAutoUpdate(path) {
		t.Error("off with a corrupt file")
	}
}

func TestTheScheduledUpdateReadsWhatTheWindowWrote(t *testing.T) {
	path := filepath.Join(t.TempDir(), "settings.json")
	if err := loadUpdateSettings(path, nil).setAutoUpdate(false); err != nil {
		t.Fatal(err)
	}
	if readAutoUpdate(path) {
		t.Error("turned off in the window, but on for the scheduled update")
	}
}

func TestAutoUpdateCannotChangeWithoutAFile(t *testing.T) {
	s := loadUpdateSettings("", os.ErrNotExist)
	if !s.autoUpdate() {
		t.Error("off without a file")
	}
	if err := s.setAutoUpdate(false); err == nil {
		t.Error("turned off with nowhere to keep it")
	}
}

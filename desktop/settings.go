package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

// updateSettings is kept in a file of its own rather than in the webview's
// storage, because the updater reads it before the window has loaded.
type updateSettings struct {
	mu   sync.Mutex
	path string
	on   bool
	err  error
}

type updateSettingsFile struct {
	// A pointer, so a file without the field still means on.
	AutoUpdate *bool `json:"autoUpdate"`
}

// configDir is the folder TrickWork keeps its own files in.
func configDir() (string, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "TrickWork"), nil
}

// userSettingsPath is where a copy that updates itself keeps the switch.
func userSettingsPath() (string, error) {
	dir, err := configDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "update.json"), nil
}

// loadUpdateSettings reads the switch from path. It takes the error of the
// function that found path, so a store without a file refuses every change.
func loadUpdateSettings(path string, err error) *updateSettings {
	if err != nil {
		return &updateSettings{on: true, err: err}
	}
	return &updateSettings{path: path, on: readAutoUpdate(path)}
}

// readAutoUpdate reports the switch in the file at path. A missing, unreadable
// or corrupt file, or one that does not name the switch, reads as on.
func readAutoUpdate(path string) bool {
	data, err := os.ReadFile(path)
	if err != nil {
		return true
	}
	var f updateSettingsFile
	if json.Unmarshal(data, &f) != nil || f.AutoUpdate == nil {
		return true
	}
	return *f.AutoUpdate
}

func (s *updateSettings) autoUpdate() bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.on
}

// setAutoUpdate rewrites the file in place. The installed copy's file sits in
// a folder only administrators may write to, so there is no room for a
// temporary file beside it.
func (s *updateSettings) setAutoUpdate(on bool) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.err != nil {
		return s.err
	}
	data, _ := json.Marshal(updateSettingsFile{AutoUpdate: &on})
	if err := os.MkdirAll(filepath.Dir(s.path), 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(s.path, append(data, '\n'), 0o644); err != nil {
		return err
	}
	s.on = on
	return nil
}

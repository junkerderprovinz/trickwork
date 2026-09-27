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

func loadUpdateSettings() *updateSettings {
	s := &updateSettings{on: true}
	dir, err := configDir()
	if err != nil {
		s.err = err
		return s
	}
	s.path = filepath.Join(dir, "update.json")
	data, err := os.ReadFile(s.path)
	if err != nil {
		return s
	}
	var f updateSettingsFile
	if json.Unmarshal(data, &f) == nil && f.AutoUpdate != nil {
		s.on = *f.AutoUpdate
	}
	return s
}

func (s *updateSettings) autoUpdate() bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.on
}

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
	if err := os.WriteFile(s.path, data, 0o644); err != nil {
		return err
	}
	s.on = on
	return nil
}

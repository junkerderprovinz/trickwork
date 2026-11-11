package main

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
)

const flatpakID = "io.github.junkerderprovinz.trickwork"

// The sandbox lets the app own bus names under its own ID alone, and the
// desktop finds the app's launcher for a window by the same name.
func TestAFlatpakGoesByItsID(t *testing.T) {
	t.Setenv("FLATPAK_ID", flatpakID)
	opts := linuxOptions()
	if opts.ApplicationID != flatpakID || opts.ProgramName != flatpakID {
		t.Errorf("application ID %q, program name %q, want both %q", opts.ApplicationID, opts.ProgramName, flatpakID)
	}
}

func TestOutsideAFlatpakTheNamesStay(t *testing.T) {
	t.Setenv("FLATPAK_ID", "")
	if opts := linuxOptions(); opts.ApplicationID != "" || opts.ProgramName != "" {
		t.Errorf("application ID %q, program name %q", opts.ApplicationID, opts.ProgramName)
	}
}

func TestAFlatpakNeverUpdatesItself(t *testing.T) {
	useConfigDir(t)
	t.Setenv("FLATPAK_ID", flatpakID)
	asked := make(chan struct{}, 1)
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		select {
		case asked <- struct{}{}:
		default:
		}
		http.NotFound(w, r)
	}))
	defer srv.Close()

	api, first, v := updateAPI, firstCheck, version
	updateAPI, firstCheck, version = srv.URL, 0, "1.6.1"
	t.Cleanup(func() { updateAPI, firstCheck, version = api, first, v })

	a := NewApp()
	if !a.Flatpak() {
		t.Error("the window is not told it runs in a Flatpak")
	}
	if a.AutoUpdate() {
		t.Error("the switch reads on in a Flatpak")
	}
	if err := a.SetAutoUpdate(true); !errors.Is(err, errors.ErrUnsupported) {
		t.Errorf("turning it on: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	if err := a.ServiceStartup(ctx, application.ServiceOptions{}); err != nil {
		t.Fatal(err)
	}
	select {
	case <-asked:
		t.Fatal("a Flatpak looked for a release to replace itself with")
	case <-time.After(time.Second):
	}
}

func TestOutsideAFlatpakTheSwitchStays(t *testing.T) {
	useConfigDir(t)
	t.Setenv("FLATPAK_ID", "")
	a := &App{settings: loadUpdateSettings(userSettingsPath())}
	if a.Flatpak() {
		t.Error("a copy outside a Flatpak says it runs in one")
	}
	if err := a.SetAutoUpdate(false); err != nil {
		t.Fatal(err)
	}
	if a.AutoUpdate() {
		t.Error("turned off, but still on")
	}
}

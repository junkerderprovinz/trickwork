package main

import (
	"io"
	"log"
	"testing"
)

// The program in an AppImage runs from a read-only mount of the file, so an
// update has to replace the file the user started, with the release's AppImage.
func TestAnAppImageUpdatesTheFileItWasStartedFrom(t *testing.T) {
	const image = "/home/jane doe/Apps/TrickWork.AppImage"
	t.Setenv("APPIMAGE", image)

	u := newUpdater(log.New(io.Discard, "", 0))

	if u.Path != image {
		t.Errorf("the update replaces %q, want the AppImage", u.Path)
	}
	for platform, want := range map[string]string{
		"linux/amd64": "trickwork-linux-amd64.AppImage",
		"linux/arm64": "trickwork-linux-arm64.AppImage",
	} {
		if got := u.Assets[platform]; got != want {
			t.Errorf("%s fetches %q, want %q", platform, got, want)
		}
	}
}

func TestTheBareProgramUpdatesItself(t *testing.T) {
	t.Setenv("APPIMAGE", "")

	u := newUpdater(log.New(io.Discard, "", 0))

	if u.Path != "" {
		t.Errorf("the update replaces %q, want the running program", u.Path)
	}
	if got := u.Assets["linux/amd64"]; got != "trickwork-linux-amd64" {
		t.Errorf("linux/amd64 fetches %q", got)
	}
}

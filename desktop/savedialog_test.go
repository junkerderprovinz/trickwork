package main

import (
	"os"
	"path/filepath"
	"testing"
)

func usePortal(t *testing.T, answer string) {
	t.Setenv("FLATPAK_ID", flatpakID)
	save := portalSave
	portalSave = func(name string) (string, error) {
		if name != "helmet.txt" {
			t.Errorf("the portal was offered %q", name)
		}
		return answer, nil
	}
	t.Cleanup(func() { portalSave = save })
}

func TestAFlatpakSavesWhereThePortalSays(t *testing.T) {
	want := filepath.Join(t.TempDir(), "helmet.txt")
	usePortal(t, want)
	got, err := (&App{}).SaveExport("helmet.txt", []byte("@#*"))
	if err != nil {
		t.Fatal(err)
	}
	if got != want {
		t.Errorf("saved to %q, want %q", got, want)
	}
	if data, err := os.ReadFile(want); err != nil || string(data) != "@#*" {
		t.Errorf("the file holds %q (%v)", data, err)
	}
}

func TestAFlatpakSavesNothingWhenThePortalIsCancelled(t *testing.T) {
	usePortal(t, "")
	got, err := (&App{}).SaveExport("helmet.txt", []byte("@#*"))
	if got != "" || err != nil {
		t.Errorf("a cancelled dialog returned %q, %v", got, err)
	}
}

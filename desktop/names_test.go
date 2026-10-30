//go:build !updatetest

package main

import (
	"path/filepath"
	"testing"
)

func TestTheReleaseBuildKeepsTheRealNames(t *testing.T) {
	dir := useConfigDir(t)
	if product != "TrickWork" {
		t.Errorf("product %q, want TrickWork", product)
	}
	if ownWebview {
		t.Error("the release build moves the window's storage off Wails' default folder")
	}
	if filepath.Base(dir) != "TrickWork" {
		t.Errorf("settings folder %q, want one named TrickWork", dir)
	}
}

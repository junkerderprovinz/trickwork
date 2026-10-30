//go:build updatetest

package main

import (
	"path/filepath"
	"testing"
)

func TestTheTestBuildKeepsItsDataApart(t *testing.T) {
	dir := useConfigDir(t)
	if product != "TrickWork Test" {
		t.Errorf("product %q, want TrickWork Test", product)
	}
	if !ownWebview {
		t.Error("the test build shares the window's storage with a real installation")
	}
	if filepath.Base(dir) != "TrickWork Test" {
		t.Errorf("settings folder %q, want one named TrickWork Test", dir)
	}
}

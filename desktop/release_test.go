package main

import (
	"os"
	"regexp"
	"strings"
	"testing"
)

// The updater asks for each file by the name desktop.yml gives it on the
// release, so a renamed asset would stop every update without an error.
func TestTheReleaseCarriesEveryFileTheUpdaterAsksFor(t *testing.T) {
	// The Linux files are attached in a loop over both architectures.
	loop := readWorkflow(t)
	yml := strings.ReplaceAll(loop, "${arch}", "amd64") + strings.ReplaceAll(loop, "${arch}", "arm64")
	for _, assets := range []map[string]string{releaseAssets, appImageAssets} {
		for target, name := range assets {
			dated := `"dist/trickwork-${GITHUB_REF_NAME}-` + strings.TrimPrefix(name, "trickwork-") + `"`
			if !strings.Contains(yml, dated) {
				t.Errorf("%s updates from %s, which desktop.yml does not attach as %s", target, name, dated)
			}
		}
	}
}

// An AppImage has to be built on the oldest Ubuntu it is meant to start on, so
// each one gets a matrix entry of its own.
func TestEveryAppImageHasItsOwnBuild(t *testing.T) {
	builds := map[string]string{}
	for _, m := range regexp.MustCompile(`slug: (\S+)\s+args: "([^"]*)"`).FindAllStringSubmatch(readWorkflow(t), -1) {
		builds[m[1]] = m[2]
	}
	for target := range appImageAssets {
		slug := strings.Replace(target, "/", "-", 1) + "-appimage"
		args, ok := builds[slug]
		if !ok {
			t.Errorf("desktop.yml builds no %s", slug)
			continue
		}
		if !strings.Contains(args, "--appimage") || !strings.Contains(args, "--arch "+strings.TrimPrefix(target, "linux/")) {
			t.Errorf("%s builds with %q", slug, args)
		}
	}
}

func readWorkflow(t *testing.T) string {
	t.Helper()
	data, err := os.ReadFile("../.github/workflows/desktop.yml")
	if err != nil {
		t.Fatal(err)
	}
	return string(data)
}

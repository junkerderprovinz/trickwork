// Package webembed holds the single embedded copy of the built ui/ bundle.
// webembed/dist is not committed to source control - it is populated by
// copying ui/dist here immediately before a Go build that needs it (see
// container/Dockerfile's COPY step and desktop/README.md's build step).
package webembed

import (
	"embed"
	"io/fs"
)

//go:embed all:dist
var raw embed.FS

// Dist serves the bundle at its own root (index.html at "/", not
// "/dist/index.html") by stripping the embed's "dist/" prefix.
var Dist fs.FS = mustSub(raw, "dist")

func mustSub(f embed.FS, dir string) fs.FS {
	sub, err := fs.Sub(f, dir)
	if err != nil {
		panic(err)
	}
	return sub
}

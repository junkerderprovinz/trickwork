// Package webembed holds the embedded copy of the built ui/ bundle.
// webembed/dist is not committed; the container and desktop builds copy
// ui/dist here before compiling.
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

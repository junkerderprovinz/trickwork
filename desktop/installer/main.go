// Command installer installs TrickWork on Windows and Linux. The desktop build
// (scripts/desktop.mjs) copies the program into payload/ and builds this
// around it; on macOS the app ships as a disk image instead.
package main

import (
	"embed"
	"fmt"
	"io/fs"
	"os"

	"github.com/junkerderprovinz/pommelporter"
)

var (
	//go:embed payload
	payload embed.FS
	//go:embed logo.svg
	logo []byte
	//go:embed icon.png
	icon []byte
)

// Set by the build: an updatetest build installs as "TrickWork Test", next to
// a real installation.
var (
	name    = "TrickWork"
	id      = "com.junkerderprovinz.trickwork"
	version = "0.0.0"
)

// TrickWork 1.3.0 and earlier, and the per-user builds after it, ran company
// and product together into one name.
const legacy = "TrickWorkTrickWork"

func main() {
	files, err := fs.Sub(payload, "payload")
	if err == nil {
		err = pommelporter.Run(pommelporter.App{
			Name:       name,
			ID:         id,
			Executable: executable,
			Version:    version,
			Publisher:  "junkerderprovinz",
			Homepage:   "https://github.com/junkerderprovinz/trickwork",
			Accent:     "#FCC419",
			Logo:       logo,
			Icon:       icon,
			Categories: []string{"Graphics", "2DGraphics"},
			Payload:    files,
			Legacy: pommelporter.Legacy{
				MachineKeys: []string{`Software\Microsoft\Windows\CurrentVersion\Uninstall\` + legacy},
				UserKeys:    []string{`Software\Microsoft\Windows\CurrentVersion\Uninstall\` + legacy},
				ChoiceKeys:  []string{`Software\` + legacy},
			},
		})
	}
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

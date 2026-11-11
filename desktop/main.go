package main

import (
	"log"
	"os"
	"path/filepath"
	"runtime"

	"github.com/junkerderprovinz/trickwork/desktop/flatpak"
	"github.com/junkerderprovinz/trickwork/webembed"
	"github.com/wailsapp/wails/v3/pkg/application"
)

func main() {
	// Before Wails starts, so the scheduled task's run opens no window and
	// needs no WebView2.
	if len(os.Args) == 2 && os.Args[1] == "--update" {
		if err := updateInstalled(); err != nil {
			os.Exit(1)
		}
		return
	}

	// Wails turns WebKit's DMA-BUF renderer off on NVIDIA itself, but cannot
	// see the driver from inside a Flatpak.
	if flatpak.ID() != "" && os.Getenv("WEBKIT_DISABLE_DMABUF_RENDERER") == "" && flatpak.NVIDIARenders("/sys", os.Getenv) {
		os.Setenv("WEBKIT_DISABLE_DMABUF_RENDERER", "1")
	}

	svc := NewApp()
	opts := application.Options{
		Name:        "TrickWork",
		Description: "Turns images into proportional-font-aware ASCII art",
		Services:    []application.Service{application.NewService(svc)},
		Assets:      application.AssetOptions{Handler: application.AssetFileServerFS(webembed.Dist)},
		// One window, and closing it ends the program on macOS as well.
		Mac:   application.MacOptions{ApplicationShouldTerminateAfterLastWindowClosed: true},
		Linux: linuxOptions(),
	}
	if ownWebview {
		if dir, err := configDir(); err == nil {
			opts.Windows.WebviewUserDataPath = filepath.Join(dir, "webview")
		}
	}
	app := application.New(opts)
	svc.app = app
	// The page draws the title bar on Windows and Linux (ui/src/windowBar.ts),
	// where a frameless window still keeps its shadow, corners and snapping.
	// macOS keeps the traffic lights people reach for.
	svc.window = app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:     "TrickWork",
		Width:     1200,
		Height:    800,
		Frameless: runtime.GOOS != "darwin",
	})

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}

// linuxOptions names the program to GTK inside a Flatpak after the app's ID,
// the only name the sandbox lets it own on the bus and the one the desktop
// matches a window to the app's launcher by.
func linuxOptions() application.LinuxOptions {
	id := flatpak.ID()
	return application.LinuxOptions{ApplicationID: id, ProgramName: id}
}

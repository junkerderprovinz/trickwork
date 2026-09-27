package main

import (
	"log"
	"os"

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

	svc := NewApp()
	app := application.New(application.Options{
		Name:        "TrickWork",
		Description: "Turns images into proportional-font-aware ASCII art",
		Services:    []application.Service{application.NewService(svc)},
		Assets:      application.AssetOptions{Handler: application.AssetFileServerFS(webembed.Dist)},
		// One window, and closing it ends the program on macOS as well.
		Mac: application.MacOptions{ApplicationShouldTerminateAfterLastWindowClosed: true},
	})
	svc.app = app
	svc.window = app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:  "TrickWork",
		Width:  1200,
		Height: 800,
	})

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}

package main

import (
	"os"

	"github.com/junkerderprovinz/trickwork/webembed"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

func main() {
	// Read by hand rather than with the flag package: wails dev and wails
	// build start the program with flags of their own.
	if len(os.Args) == 2 && os.Args[1] == "--update" {
		if err := updateInstalled(); err != nil {
			os.Exit(1)
		}
		return
	}

	app := NewApp()

	err := wails.Run(&options.App{
		Title:  "TrickWork",
		Width:  1200,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: webembed.Dist,
		},
		OnStartup:  app.startup,
		OnShutdown: app.shutdown,
		Bind: []interface{}{
			app,
		},
	})
	if err != nil {
		println("Error:", err.Error())
	}
}

package main

import (
	"github.com/junkerderprovinz/ascii-supergenerator/webembed"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:  "ASCII SuperGenerator",
		Width:  1200,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: webembed.Dist,
		},
		OnStartup: app.startup,
		Bind: []interface{}{
			app,
		},
	})
	if err != nil {
		println("Error:", err.Error())
	}
}

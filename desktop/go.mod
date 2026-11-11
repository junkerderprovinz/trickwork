module github.com/junkerderprovinz/trickwork/desktop

go 1.26.0

toolchain go1.27.4

require (
	github.com/godbus/dbus/v5 v5.2.2
	github.com/junkerderprovinz/trickwork v0.0.0-00010101000000-000000000000
	github.com/wailsapp/wails/v3 v3.1.0
	golang.org/x/sys v0.50.0
)

require (
	github.com/adrg/xdg v0.5.3 // indirect
	github.com/coder/websocket v1.8.14 // indirect
	github.com/ebitengine/purego v0.11.1 // indirect
	github.com/go-ole/go-ole v1.3.0 // indirect
	github.com/mattn/go-colorable v0.1.14 // indirect
	github.com/mattn/go-isatty v0.0.22 // indirect
	golang.org/x/term v0.46.0 // indirect
)

replace github.com/junkerderprovinz/trickwork => ../

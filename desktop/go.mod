module github.com/junkerderprovinz/trickwork/desktop

go 1.26.0

toolchain go1.27.1

require (
	github.com/junkerderprovinz/trickwork v0.0.0-00010101000000-000000000000
	github.com/wailsapp/wails/v3 v3.0.0-beta.27
	golang.org/x/sys v0.48.0
)

require (
	github.com/adrg/xdg v0.5.3 // indirect
	github.com/coder/websocket v1.8.14 // indirect
	github.com/go-ole/go-ole v1.3.0 // indirect
	github.com/godbus/dbus/v5 v5.2.2 // indirect
	github.com/mattn/go-colorable v0.1.14 // indirect
	github.com/mattn/go-isatty v0.0.22 // indirect
)

replace github.com/junkerderprovinz/trickwork => ../

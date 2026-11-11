// Package portal asks the desktop's file chooser where to save a file, through
// the XDG desktop portal. Inside a Flatpak that is the only way to write
// outside the sandbox without access to the person's folders.
package portal

import (
	"errors"
	"fmt"
	"net/url"
	"strconv"
	"time"

	"github.com/godbus/dbus/v5"
)

// SaveFile shows the desktop's Save dialog with name filled in and returns the
// path the person picked, or "" when they cancelled.
func SaveFile(name string) (string, error) {
	// A connection of its own, so the answer cannot be taken by anything
	// else listening on the shared one.
	conn, err := dbus.ConnectSessionBus()
	if err != nil {
		return "", fmt.Errorf("reach the session bus: %w", err)
	}
	defer conn.Close()

	// Subscribed before the call, or a quick answer would go unheard.
	if err := conn.AddMatchSignal(
		dbus.WithMatchInterface("org.freedesktop.portal.Request"),
		dbus.WithMatchMember("Response"),
	); err != nil {
		return "", fmt.Errorf("listen for the portal's answer: %w", err)
	}
	answers := make(chan *dbus.Signal, 4)
	conn.Signal(answers)

	token := "trickwork" + strconv.FormatInt(time.Now().UnixNano(), 36)
	var handle dbus.ObjectPath
	err = conn.Object("org.freedesktop.portal.Desktop", "/org/freedesktop/portal/desktop").
		Call("org.freedesktop.portal.FileChooser.SaveFile", 0, "", "", saveOptions(name, token)).
		Store(&handle)
	if err != nil {
		return "", fmt.Errorf("ask the FileChooser portal: %w", err)
	}

	// No timeout: the dialog stays open as long as the person needs it.
	for sig := range answers {
		if sig.Path != handle || len(sig.Body) < 2 {
			continue
		}
		switch code, _ := sig.Body[0].(uint32); code {
		case 0:
		case 1:
			return "", nil
		default:
			return "", errors.New("the FileChooser portal could not show the dialog")
		}
		results, _ := sig.Body[1].(map[string]dbus.Variant)
		uris, _ := results["uris"].Value().([]string)
		if len(uris) == 0 {
			return "", errors.New("the FileChooser portal named no file")
		}
		return pathFromURI(uris[0])
	}
	return "", errors.New("the session bus closed before the portal answered")
}

// saveOptions is the request's vardict.
func saveOptions(name, token string) map[string]dbus.Variant {
	return map[string]dbus.Variant{
		"handle_token": dbus.MakeVariant(token),
		"current_name": dbus.MakeVariant(name),
		"modal":        dbus.MakeVariant(true),
	}
}

// pathFromURI turns the portal's file URI into a path, which in a sandbox lies
// under the document portal's /run/user/<uid>/doc.
func pathFromURI(uri string) (string, error) {
	u, err := url.Parse(uri)
	if err != nil {
		return "", fmt.Errorf("read the portal's answer %q: %w", uri, err)
	}
	if u.Scheme != "file" || u.Path == "" {
		return "", fmt.Errorf("the portal answered %q, which is no file", uri)
	}
	return u.Path, nil
}

package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/junkerderprovinz/trickwork/webembed"
)

// withCacheControl closes a real gap: Go's stock http.FileServer over an
// embed.FS sets neither Last-Modified (embed.FS reports the zero Time,
// which http.ServeContent's own doc says it skips the header for) nor
// ETag (never a FileServer feature to begin with) nor Cache-Control - a
// browser gets literally no caching guidance at all. In that vacuum a
// browser is free to apply its own heuristic caching to a repeat visit
// (a still-open tab, a bookmark, a bfcache restore) and keep showing a
// version from before the LATEST redeploy indefinitely, with no signal
// telling it otherwise - a real, repeated user report ("still doesn't
// work" across several independently-verified server-side fixes) traced
// to exactly this. Vite's own build already content-hashes every file
// under /assets/ (a new hash on any content change), so those are safe
// to cache forever; index.html - the one file that decides which hashed
// assets get loaded next - must never be cached at all.
func withCacheControl(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/assets/") {
			w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		} else {
			w.Header().Set("Cache-Control", "no-cache")
		}
		h.ServeHTTP(w, r)
	})
}

const readyBanner = `
   _   ____   ____ ____ ___    ____                       _____
  / \ / ___| / ___|_ _|_ _|   / ___|_   _ _ __   ___ _ __ / ____|___ _ __
 / _ \\___ \| |    | | | |   | |  _| | | | '_ \ / _ \ '__| |  _ / _ \ '_ \
/ ___ \___) | |___ | | | |   | |_| | |_| | | | |  __/ |  | |_| |  __/ | | |
/_/   \_\____/ \____|___|___|  \____|\__,_|_| |_|\___|_|   \____\___|_| |_|
`

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3210"
	}

	mux := http.NewServeMux()
	mux.Handle("/", withCacheControl(http.FileServer(http.FS(webembed.Dist))))

	fmt.Println(readyBanner)
	fmt.Println("  TrickWork - image to ASCII art, self-hosted")
	fmt.Println()
	fmt.Printf("  \033[0;32m✓ TRICKWORK IS READY\033[0m - listening on http://0.0.0.0:%s\n", port)
	fmt.Println()

	if err := http.ListenAndServe(":"+port, mux); err != nil {
		fmt.Fprintf(os.Stderr, "server error: %v\n", err)
		os.Exit(1)
	}
}

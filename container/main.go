package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/junkerderprovinz/trickwork/webembed"
)

// withCacheControl adds the caching headers that http.FileServer over an
// embed.FS never sends (no Last-Modified, ETag or Cache-Control), without
// which a browser may keep showing a build from before the last redeploy.
// Vite content-hashes everything under /assets/, so those are cached for
// good; index.html picks the hashed assets and is revalidated every time.
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
/_/   \_\____/ \____|___|___|  \____|\__,_|_| |_|\___|_|   \____\___|_| |_|`

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

package main

import (
	_ "embed"
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

// brandArt is the house ASCII banner printed at startup, a copy of the
// shared banner-raw.txt the other images print.
//
//go:embed banner.txt
var brandArt string

const (
	bannerName     = "TrickWork"
	bannerSubtitle = "Image to ASCII art, self-hosted."
)

// printBanner prints the house ASCII art and the name line to stdout, so Docker
// does not interleave the stderr log into the art.
func printBanner() {
	fmt.Println()
	fmt.Println(strings.TrimRight(brandArt, "\n"))
	fmt.Println()
	fmt.Println("  " + bannerName + " · " + bannerSubtitle)
	fmt.Println()
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3210"
	}

	mux := http.NewServeMux()
	mux.Handle("/", withCacheControl(http.FileServer(http.FS(webembed.Dist))))

	printBanner()
	fmt.Printf("  \033[0;32m✓ TRICKWORK IS READY\033[0m - Open the WebUI now (HTTP %s)\n", port)
	fmt.Println()

	if err := http.ListenAndServe(":"+port, mux); err != nil {
		fmt.Fprintf(os.Stderr, "server error: %v\n", err)
		os.Exit(1)
	}
}

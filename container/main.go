package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/junkerderprovinz/ascii-supergenerator/webembed"
)

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
	mux.Handle("/", http.FileServer(http.FS(webembed.Dist)))

	fmt.Println(readyBanner)
	fmt.Println("  ASCII SuperGenerator - image to ASCII art, self-hosted")
	fmt.Println()
	fmt.Printf("  \033[0;32m✓ ASCII SUPERGENERATOR IS READY\033[0m - listening on http://0.0.0.0:%s\n", port)
	fmt.Println()

	if err := http.ListenAndServe(":"+port, mux); err != nil {
		fmt.Fprintf(os.Stderr, "server error: %v\n", err)
		os.Exit(1)
	}
}

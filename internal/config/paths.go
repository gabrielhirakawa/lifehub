package config

import (
	"os"
	"path/filepath"
)

// GetDataDir returns the path to the data directory.
// It intelligently resolves the path to avoid creating duplicate data folders
// when running from different directories (root vs cmd/server).
func GetDataDir() string {
	// 1. Check if we are at project root (standard behavior)
	if _, err := os.Stat("go.mod"); err == nil {
		return "data"
	}

	// 2. Check if we are in cmd/server (developer convenience)
	// This prevents creating a new 'data' folder inside cmd/server
	if _, err := os.Stat(filepath.Join("..", "..", "go.mod")); err == nil {
		return filepath.Join("..", "..", "data")
	}

	// 3. Default fallback (production binaries or unknown structure)
	return "data"
}

package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite" // Import the SQLite driver
)

var DB *sql.DB

// InitDB initializes the SQLite database connection and creates tables.
func InitDB() error {
	// Ensure the data directory exists
	dataDir := "./data"
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return fmt.Errorf("failed to create data directory: %w", err)
	}

	dbPath := filepath.Join(dataDir, "lifehub.db")
	var err error
	DB, err = sql.Open("sqlite", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	if err := DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Connected to SQLite database at", dbPath)

	if err := createTables(); err != nil {
		return err
	}

	if err := InitUsersTable(); err != nil {
		return fmt.Errorf("failed to create users table: %w", err)
	}

	return nil
}

func createTables() error {
	query := `
	CREATE TABLE IF NOT EXISTS widgets (
		id TEXT PRIMARY KEY,
		type TEXT NOT NULL,
		title TEXT NOT NULL,
		cols INTEGER DEFAULT 1,
		position INTEGER DEFAULT 0,
		is_active BOOLEAN DEFAULT 1,
		content TEXT, -- JSON content
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`

	_, err := DB.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to create widgets table: %w", err)
	}

	return nil
}

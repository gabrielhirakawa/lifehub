package database

import (
	"database/sql"
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

// InitUsersTable creates the users table if it doesn't exist.
func InitUsersTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`
	_, err := DB.Exec(query)
	return err
}

// HasRegisteredUser checks if there is at least one user in the database.
func HasRegisteredUser() (bool, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// CreateUser creates a new user with a hashed password.
func CreateUser(username, password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	query := `INSERT INTO users (username, password) VALUES (?, ?)`
	_, err = DB.Exec(query, username, string(hashedPassword))
	if err != nil {
		return fmt.Errorf("failed to insert user: %w", err)
	}
	return nil
}

// ValidateUser checks if the username and password match.
func ValidateUser(username, password string) (bool, error) {
	var storedHash string
	query := `SELECT password FROM users WHERE username = ?`
	err := DB.QueryRow(query, username).Scan(&storedHash)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil // User not found
		}
		return false, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(password))
	if err != nil {
		return false, nil // Password mismatch
	}

	return true, nil
}

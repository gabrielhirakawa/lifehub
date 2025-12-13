package models

import "time"

// User represents a registered user.
type User struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	Password  string    `json:"-"` // Never return password in JSON
	CreatedAt time.Time `json:"created_at"`
}

package database

import (
	"fmt"
	"database/sql"

)

// InitPushTable creates the push_subscriptions table if it doesn't exist.
func InitPushTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS push_subscriptions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		endpoint TEXT NOT NULL UNIQUE,
		p256dh TEXT NOT NULL,
		auth TEXT NOT NULL,
		user_id INTEGER,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`
	_, err := DB.Exec(query)
	return err
}

// SaveSubscription saves a new push subscription.
func SaveSubscription(userID int, endpoint, p256dh, auth string) error {
	query := `INSERT OR REPLACE INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)`
	_, err := DB.Exec(query, userID, endpoint, p256dh, auth)
	if err != nil {
		return fmt.Errorf("failed to save subscription: %w", err)
	}
	return nil
}

// GetAllSubscriptions retrieves all subscriptions to broadcast messages.
type Subscription struct {
	Endpoint string
	P256dh   string
	Auth     string
	UserID   int
}

func GetAllSubscriptions() ([]Subscription, error) {
	query := `SELECT endpoint, p256dh, auth, user_id FROM push_subscriptions`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subs []Subscription
	for rows.Next() {
		var s Subscription
		var uid sql.NullInt64
		if err := rows.Scan(&s.Endpoint, &s.P256dh, &s.Auth, &uid); err != nil {
			return nil, err
		}
		if uid.Valid {
			s.UserID = int(uid.Int64)
		}
		subs = append(subs, s)
	}
	return subs, nil
}

// GetSubscriptionsByUserID retrieves subscriptions for a specific user.
func GetSubscriptionsByUserID(userID int) ([]Subscription, error) {
	query := `SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?`
	rows, err := DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subs []Subscription
	for rows.Next() {
		var s Subscription
		if err := rows.Scan(&s.Endpoint, &s.P256dh, &s.Auth); err != nil {
			return nil, err
		}
		s.UserID = userID
		subs = append(subs, s)
	}
	return subs, nil
}

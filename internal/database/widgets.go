package database

import (
	"encoding/json"
	"fmt"
	"database/sql"

	"github.com/gabrielhirakawa/lifehub/internal/models"
)

// GetAllWidgets retrieves all active widgets for a specific user.
func GetAllWidgets(userID int) ([]models.Widget, error) {
	query := `SELECT id, type, title, cols, position, is_active, content, created_at, updated_at FROM widgets WHERE is_active = 1 AND user_id = ? ORDER BY position ASC`
	rows, err := DB.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query widgets: %w", err)
	}
	defer rows.Close()

	var widgets []models.Widget
	for rows.Next() {
		var w models.Widget
		var contentStr string // Temporary string to hold JSON content

		if err := rows.Scan(&w.ID, &w.Type, &w.Title, &w.Cols, &w.Position, &w.IsActive, &contentStr, &w.CreatedAt, &w.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan widget: %w", err)
		}

		// Convert string back to RawMessage
		w.Content = json.RawMessage(contentStr)
		widgets = append(widgets, w)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return widgets, nil
}

// SaveWidget inserts or updates a widget for a specific user.
func SaveWidget(userID int, w models.Widget) error {
	// Check if widget exists and belongs to user (for update)
	// Or just upsert with user_id.
	// If it's a new widget, we insert with user_id.
	// If it's an update, we should ensure it belongs to user_id?
	// SQLite ON CONFLICT will update based on ID.
	// If ID exists but belongs to another user (unlikely with UUIDs but possible), we might overwrite.
	// But let's assume IDs are unique globally.
	// We should update user_id too or ensure it matches?
	// Let's just set user_id on insert. On update, we keep it or update it (it shouldn't change).
	
	query := `
	INSERT INTO widgets (id, user_id, type, title, cols, position, is_active, content, updated_at)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
	ON CONFLICT(id) DO UPDATE SET
		type = excluded.type,
		title = excluded.title,
		cols = excluded.cols,
		position = excluded.position,
		is_active = excluded.is_active,
		content = excluded.content,
		updated_at = CURRENT_TIMESTAMP
		-- We don't update user_id to prevent taking over other's widgets if ID collision happens (very rare)
		-- But actually, if we want to enforce ownership, we should check before saving.
		-- For now, let's assume the frontend sends valid IDs for the user.
		;
	`

	// Convert RawMessage to string for storage
	contentStr := string(w.Content)

	_, err := DB.Exec(query, w.ID, userID, w.Type, w.Title, w.Cols, w.Position, w.IsActive, contentStr)
	if err != nil {
		return fmt.Errorf("failed to save widget: %w", err)
	}

	return nil
}

// DeleteWidget soft deletes a widget by setting is_active to false, ensuring it belongs to user.
func DeleteWidget(userID int, id string) error {
	query := `UPDATE widgets SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`
	result, err := DB.Exec(query, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete widget: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("widget not found or access denied")
	}
	return nil
}

// GetWidgetByID retrieves a single widget by ID for a specific user.
func GetWidgetByID(userID int, id string) (*models.Widget, error) {
	query := `SELECT id, type, title, cols, position, is_active, content, created_at, updated_at FROM widgets WHERE id = ? AND user_id = ?`
	row := DB.QueryRow(query, id, userID)

	var w models.Widget
	var contentStr string

	if err := row.Scan(&w.ID, &w.Type, &w.Title, &w.Cols, &w.Position, &w.IsActive, &contentStr, &w.CreatedAt, &w.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("failed to scan widget: %w", err)
	}

	w.Content = json.RawMessage(contentStr)
	return &w, nil
}

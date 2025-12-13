package database

import (
	"encoding/json"
	"fmt"
	"database/sql"

	"github.com/gabrielhirakawa/lifehub/internal/models"
)

// GetAllWidgets retrieves all active widgets from the database.
func GetAllWidgets() ([]models.Widget, error) {
	query := `SELECT id, type, title, cols, position, is_active, content, created_at, updated_at FROM widgets WHERE is_active = 1 ORDER BY position ASC`
	rows, err := DB.Query(query)
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

// SaveWidget inserts or updates a widget.
func SaveWidget(w models.Widget) error {
	query := `
	INSERT INTO widgets (id, type, title, cols, position, is_active, content, updated_at)
	VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
	ON CONFLICT(id) DO UPDATE SET
		type = excluded.type,
		title = excluded.title,
		cols = excluded.cols,
		position = excluded.position,
		is_active = excluded.is_active,
		content = excluded.content,
		updated_at = CURRENT_TIMESTAMP;
	`

	// Convert RawMessage to string for storage
	contentStr := string(w.Content)

	_, err := DB.Exec(query, w.ID, w.Type, w.Title, w.Cols, w.Position, w.IsActive, contentStr)
	if err != nil {
		return fmt.Errorf("failed to save widget: %w", err)
	}

	return nil
}

// DeleteWidget soft deletes a widget by setting is_active to false.
func DeleteWidget(id string) error {
	query := `UPDATE widgets SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
	_, err := DB.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete widget: %w", err)
	}
	return nil
}

// GetWidgetByID retrieves a single widget by ID, even if inactive.
func GetWidgetByID(id string) (*models.Widget, error) {
	query := `SELECT id, type, title, cols, position, is_active, content, created_at, updated_at FROM widgets WHERE id = ?`
	row := DB.QueryRow(query, id)

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

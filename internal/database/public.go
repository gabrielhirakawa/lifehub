package database

import (
	"encoding/json"
	"fmt"

	"github.com/gabrielhirakawa/lifehub/internal/models"
)

// GetPublicWikiPage searches for a wiki page with the given public ID.
func GetPublicWikiPage(publicID string) (*models.WikiPage, error) {
	// 1. Find widgets that might contain this public ID.
	// We use a LIKE query as a coarse filter to avoid scanning all widgets.
	// The pattern looks for the publicID string inside the content.
	query := `SELECT content FROM widgets WHERE type = 'WIKI' AND content LIKE ?`
	pattern := "%" + publicID + "%"

	rows, err := DB.Query(query, pattern)
	if err != nil {
		return nil, fmt.Errorf("failed to query widgets: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var contentStr string
		if err := rows.Scan(&contentStr); err != nil {
			continue
		}

		// 2. Parse the content to find the exact page
		var wrapper models.WidgetContentWrapper
		if err := json.Unmarshal([]byte(contentStr), &wrapper); err != nil {
			continue
		}

		if wrapper.Wiki == nil {
			continue
		}

		for _, page := range wrapper.Wiki.Pages {
			if page.IsPublic && page.PublicID == publicID {
				return &page, nil
			}
		}
	}

	return nil, fmt.Errorf("page not found")
}

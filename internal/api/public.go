package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gabrielhirakawa/lifehub/internal/database"
)

// HandleGetPublicWikiPage serves a public wiki page by its UUID.
// Route: GET /api/public/wiki/{id}
func HandleGetPublicWikiPage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract ID from path
	// Assuming path is /api/public/wiki/{id}
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 5 {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}
	publicID := parts[4]

	if publicID == "" {
		http.Error(w, "Missing public ID", http.StatusBadRequest)
		return
	}

	page, err := database.GetPublicWikiPage(publicID)
	if err != nil {
		http.Error(w, "Page not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(page)
}

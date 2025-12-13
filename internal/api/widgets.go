package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gabrielhirakawa/lifehub/internal/database"
	"github.com/gabrielhirakawa/lifehub/internal/models"
)

// HandleGetWidgets returns all widgets.
func HandleGetWidgets(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	widgets, err := database.GetAllWidgets()
	if err != nil {
		http.Error(w, "Failed to fetch widgets", http.StatusInternalServerError)
		return
	}

	// Return empty array instead of null if no widgets
	if widgets == nil {
		widgets = []models.Widget{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(widgets)
}

// HandleSaveWidget creates or updates a widget.
func HandleSaveWidget(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var widget models.Widget
	if err := json.NewDecoder(r.Body).Decode(&widget); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := database.SaveWidget(widget); err != nil {
		http.Error(w, "Failed to save widget", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"success"}`))
}

// HandleDeleteWidget removes a widget.
// Expects path like /api/widgets/delete?id=... or we can parse path if we use a router.
// For simplicity with stdlib, let's use query param: DELETE /api/widgets?id=...
func HandleDeleteWidget(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract ID from URL path if using /api/widgets/{id} pattern manually
	// Or query param. Let's try to support /api/widgets/{id} by parsing path
	// Assuming route is registered as /api/widgets/delete/
	
	parts := strings.Split(r.URL.Path, "/")
	// Expected: ["", "api", "widgets", "delete", "{id}"]
	if len(parts) < 5 || parts[4] == "" {
		http.Error(w, "Widget ID required", http.StatusBadRequest)
		return
	}
	id := parts[4]

	if err := database.DeleteWidget(id); err != nil {
		http.Error(w, "Failed to delete widget", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"deleted"}`))
}

// HandleGetWidgetByID returns a single widget.
func HandleGetWidgetByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	// Expected: ["", "api", "widgets", "{id}"]
	if len(parts) < 4 || parts[3] == "" {
		http.Error(w, "Widget ID required", http.StatusBadRequest)
		return
	}
	id := parts[3]

	widget, err := database.GetWidgetByID(id)
	if err != nil {
		http.Error(w, "Failed to fetch widget", http.StatusInternalServerError)
		return
	}

	if widget == nil {
		http.Error(w, "Widget not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(widget)
}

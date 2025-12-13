package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gabrielhirakawa/lifehub/internal/database"
	"github.com/gabrielhirakawa/lifehub/internal/models"
)

// HandleGetWidgets returns all widgets for the authenticated user.
func HandleGetWidgets(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, err := GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	widgets, err := database.GetAllWidgets(userID)
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

// HandleSaveWidget creates or updates a widget for the authenticated user.
func HandleSaveWidget(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, err := GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var widget models.Widget
	if err := json.NewDecoder(r.Body).Decode(&widget); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := database.SaveWidget(userID, widget); err != nil {
		http.Error(w, "Failed to save widget", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"success"}`))
}

// HandleDeleteWidget removes a widget for the authenticated user.
func HandleDeleteWidget(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, err := GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	// Expected: ["", "api", "widgets", "delete", "{id}"]
	if len(parts) < 5 || parts[4] == "" {
		http.Error(w, "Widget ID required", http.StatusBadRequest)
		return
	}
	id := parts[4]

	if err := database.DeleteWidget(userID, id); err != nil {
		http.Error(w, "Failed to delete widget", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"deleted"}`))
}

// HandleGetWidgetByID returns a single widget for the authenticated user.
func HandleGetWidgetByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, err := GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	// Expected: ["", "api", "widgets", "{id}"]
	if len(parts) < 4 || parts[3] == "" {
		http.Error(w, "Widget ID required", http.StatusBadRequest)
		return
	}
	id := parts[3]

	widget, err := database.GetWidgetByID(userID, id)
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

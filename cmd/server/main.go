package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gabrielhirakawa/lifehub/internal/api"
	"github.com/gabrielhirakawa/lifehub/internal/database"
)

func main() {
	// Initialize Database
	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	port := ":8080"
	fmt.Printf("Server starting on port %s...\n", port)

	// API Routes
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w)
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("LifeHub Backend is running!"))
	})

	http.HandleFunc("/api/widgets", func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w)
		if r.Method == http.MethodOptions {
			return
		}
		api.HandleGetWidgets(w, r)
	})

	// Handle /api/widgets/{id} for fetching single widget
	http.HandleFunc("/api/widgets/", func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w)
		if r.Method == http.MethodOptions {
			return
		}
		// Check if it's a delete request or get by ID
		if r.Method == http.MethodDelete {
			// This path might conflict if not careful, but let's see.
			// Actually, /api/widgets/delete/ is more specific so it should match first if registered.
			// But wait, http.ServeMux matches longest pattern.
			// /api/widgets/delete/ is longer than /api/widgets/
			// So we are safe.
			// But we need to distinguish between GET /api/widgets (list) and GET /api/widgets/{id}
			// The pattern "/api/widgets" matches exact.
			// The pattern "/api/widgets/" matches prefix.
			
			// So if we request /api/widgets, it goes to the first handler.
			// If we request /api/widgets/TODO, it goes here.
			api.HandleGetWidgetByID(w, r)
		} else if r.Method == http.MethodGet {
			api.HandleGetWidgetByID(w, r)
		}
	})

	http.HandleFunc("/api/widgets/save", func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w)
		if r.Method == http.MethodOptions {
			return
		}
		api.HandleSaveWidget(w, r)
	})

	// Handle /api/widgets/delete/{id}
	http.HandleFunc("/api/widgets/delete/", func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w)
		if r.Method == http.MethodOptions {
			return
		}
		api.HandleDeleteWidget(w, r)
	})

	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal(err)
	}
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}


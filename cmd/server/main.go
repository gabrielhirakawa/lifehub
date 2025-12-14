package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gabrielhirakawa/lifehub/internal/api"
	"github.com/gabrielhirakawa/lifehub/internal/database"
)

func main() {
	// Initialize Database
	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize VAPID Keys
	api.InitVAPID()

	// Initialize JWT Secret
	api.InitJWT()

	port := ":8080"
	fmt.Printf("Server starting on port %s...\n", port)

	// API Routes
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w, r)
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("LifeHub Backend is running!"))
	})

	// --- Auth Routes ---
	http.HandleFunc("/api/auth/status", func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w, r)
		if r.Method == http.MethodOptions {
			return
		}
		api.HandleAuthStatus(w, r)
	})

	http.HandleFunc("/api/auth/register", func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w, r)
		if r.Method == http.MethodOptions {
			return
		}
		api.HandleRegister(w, r)
	})

	http.HandleFunc("/api/auth/login", func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w, r)
		if r.Method == http.MethodOptions {
			return
		}
		api.HandleLogin(w, r)
	})

	http.HandleFunc("/api/auth/logout", func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w, r)
		if r.Method == http.MethodOptions {
			return
		}
		api.HandleLogout(w, r)
	})

	// --- Public Routes ---
	http.HandleFunc("/api/public/wiki/", func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w, r)
		if r.Method == http.MethodOptions {
			return
		}
		api.HandleGetPublicWikiPage(w, r)
	})

	// --- Widget Routes ---
	http.HandleFunc("/api/widgets", api.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w, r)
		api.HandleGetWidgets(w, r)
	}))

	// Handle /api/widgets/{id} for fetching single widget
	http.HandleFunc("/api/widgets/", api.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w, r)
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
	}))

	http.HandleFunc("/api/widgets/save", api.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w, r)
		api.HandleSaveWidget(w, r)
	}))

	// Handle /api/widgets/delete/{id}
	http.HandleFunc("/api/widgets/delete/", api.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w, r)
		api.HandleDeleteWidget(w, r)
	}))

	// --- Push Notification Routes ---
	http.HandleFunc("/api/push/vapid-key", func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w, r)
		api.HandleGetVAPIDKey(w, r)
	})

	http.HandleFunc("/api/push/subscribe", api.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w, r)
		api.HandleSubscribe(w, r)
	}))

	http.HandleFunc("/api/push/send-test", api.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w, r)
		api.HandleSendNotification(w, r)
	}))

	// --- Static Files (Frontend) ---
	// Serve static files from the "dist" directory
	// This handles SPA routing by serving index.html for non-file requests
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Define the static directory
		staticDir := "./dist"

		// Clean the path to prevent directory traversal
		path := filepath.Join(staticDir, filepath.Clean(r.URL.Path))

		// Check if the file exists
		info, err := os.Stat(path)
		if os.IsNotExist(err) || info.IsDir() {
			// If file doesn't exist or is a directory, serve index.html (SPA fallback)
			http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
			return
		}

		// Serve the actual file
		http.ServeFile(w, r, path)
	})

	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal(err)
	}
}

func enableCors(w *http.ResponseWriter, r *http.Request) {
	// Allow specific origins for development
	allowedOrigins := map[string]bool{
		"http://localhost:3000": true,
		"http://127.0.0.1:3000": true,
		"http://127.0.0.1:8080": true,
		"http://localhost:8080": true,
	}

	origin := r.Header.Get("Origin")
	if allowedOrigins[origin] {
		(*w).Header().Set("Access-Control-Allow-Origin", origin)
	} else {
		// Default to localhost:3000 if origin is missing or not in list (fallback)
		(*w).Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	}

	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	(*w).Header().Set("Access-Control-Allow-Credentials", "true")
}


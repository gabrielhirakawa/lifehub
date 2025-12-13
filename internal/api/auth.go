package api

import (
	"encoding/json"
	"net/http"

	"github.com/gabrielhirakawa/lifehub/internal/database"
)

type AuthStatusResponse struct {
	Registered bool `json:"registered"`
}

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Success  bool   `json:"success"`
	Message  string `json:"message,omitempty"`
	Username string `json:"username,omitempty"`
}

// HandleAuthStatus checks if any user is registered.
func HandleAuthStatus(w http.ResponseWriter, r *http.Request) {
	registered, err := database.HasRegisteredUser()
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuthStatusResponse{Registered: registered})
}

// HandleRegister registers a new user.
func HandleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Check if already registered (One Shot)
	registered, err := database.HasRegisteredUser()
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if registered {
		http.Error(w, "Registration is closed", http.StatusForbidden)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Username == "" || req.Password == "" {
		http.Error(w, "Username and password required", http.StatusBadRequest)
		return
	}

	if err := database.CreateUser(req.Username, req.Password); err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuthResponse{
		Success:  true,
		Message:  "User registered successfully",
		Username: req.Username,
	})
}

// HandleLogin validates user credentials.
func HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	valid, err := database.ValidateUser(req.Username, req.Password)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if !valid {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(AuthResponse{Success: false, Message: "Invalid credentials"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuthResponse{
		Success:  true,
		Message:  "Login successful",
		Username: req.Username,
	})
}

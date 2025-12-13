package api

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gabrielhirakawa/lifehub/internal/config"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret []byte

// InitJWT initializes the JWT secret key.
// It tries to load from data/jwt_secret, or generates a new one if not found.
func InitJWT() {
	secretFile := filepath.Join(config.GetDataDir(), "jwt_secret")

	// 1. Try to load existing secret
	if data, err := os.ReadFile(secretFile); err == nil {
		jwtSecret = data
		log.Println("Loaded JWT secret from storage.")
		return
	}

	// 2. Generate new secret
	log.Println("Generating new JWT secret...")
	bytes := make([]byte, 32) // 256-bit key
	if _, err := rand.Read(bytes); err != nil {
		log.Fatal("Failed to generate JWT secret:", err)
	}

	// Encode to hex to be file-system friendly
	encoded := make([]byte, hex.EncodedLen(len(bytes)))
	hex.Encode(encoded, bytes)
	jwtSecret = encoded

	// 3. Save to file
	if err := os.WriteFile(secretFile, jwtSecret, 0600); err != nil {
		log.Printf("Warning: Failed to save JWT secret: %v\n", err)
	} else {
		log.Println("New JWT secret generated and saved.")
	}
}

type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// GenerateToken creates a new JWT token for a user
func GenerateToken(userID int, username string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// AuthMiddleware verifies the JWT token from the cookie
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Allow OPTIONS requests for CORS
		if r.Method == http.MethodOptions {
			next(w, r)
			return
		}

		c, err := r.Cookie("token")
		if err != nil {
			if err == http.ErrNoCookie {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}

		tokenStr := c.Value
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil {
			if err == jwt.ErrSignatureInvalid {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}

		if !token.Valid {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Inject user info into context
		ctx := context.WithValue(r.Context(), "userID", claims.UserID)
		ctx = context.WithValue(ctx, "username", claims.Username)
		next(w, r.WithContext(ctx))
	}
}

// GetUserIDFromContext retrieves the user ID from the request context
func GetUserIDFromContext(r *http.Request) (int, error) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		return 0, fmt.Errorf("user ID not found in context")
	}
	return userID, nil
}

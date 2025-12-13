package api

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/SherClockHolmes/webpush-go"
	"github.com/gabrielhirakawa/lifehub/internal/config"
	"github.com/gabrielhirakawa/lifehub/internal/database"
)

var (
	VapidPrivateKey string
	VapidPublicKey  string
)

type VapidKeys struct {
	PublicKey  string `json:"publicKey"`
	PrivateKey string `json:"privateKey"`
}

func InitVAPID() {
	keysFile := filepath.Join(config.GetDataDir(), "vapid_keys.json")

	// 1. Try to load existing keys
	if file, err := os.ReadFile(keysFile); err == nil {
		var keys VapidKeys
		if err := json.Unmarshal(file, &keys); err == nil {
			VapidPublicKey = keys.PublicKey
			VapidPrivateKey = keys.PrivateKey
			log.Println("Loaded VAPID keys from storage.")
			return
		}
	}

	// 2. If not found or error, generate new ones
	log.Println("Generating new VAPID keys...")
	privateKey, publicKey, err := webpush.GenerateVAPIDKeys()
	if err != nil {
		log.Fatal("Failed to generate VAPID keys:", err)
	}

	VapidPrivateKey = privateKey
	VapidPublicKey = publicKey

	// 3. Save to file for persistence
	keys := VapidKeys{
		PublicKey:  publicKey,
		PrivateKey: privateKey,
	}
	data, _ := json.MarshalIndent(keys, "", "  ")
	if err := os.WriteFile(keysFile, data, 0600); err != nil {
		log.Printf("Warning: Failed to save VAPID keys to %s: %v\n", keysFile, err)
	} else {
		log.Println("New VAPID keys saved to storage.")
	}
}

// HandleGetVAPIDKey returns the public key to the frontend.
func HandleGetVAPIDKey(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"publicKey": VapidPublicKey,
	})
}

type SubscribeRequest struct {
	Endpoint string `json:"endpoint"`
	Keys     struct {
		P256dh string `json:"p256dh"`
		Auth   string `json:"auth"`
	} `json:"keys"`
}

// HandleSubscribe saves the user's subscription.
func HandleSubscribe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, err := GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req SubscribeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := database.SaveSubscription(userID, req.Endpoint, req.Keys.P256dh, req.Keys.Auth); err != nil {
		log.Println("Error saving subscription:", err)
		http.Error(w, "Failed to save subscription", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// HandleSendNotification sends a test notification to all subscribers (or specific user if implemented).
func HandleSendNotification(w http.ResponseWriter, r *http.Request) {
	// For test, we can send to the current user only, or all.
	// Let's send to the current user if logged in, otherwise all (for admin testing).
	// But this endpoint is protected now? Not yet, we need to wrap it.
	
	userID, err := GetUserIDFromContext(r)
	var subs []database.Subscription
	
	if err == nil {
		// Send only to this user
		subs, err = database.GetSubscriptionsByUserID(userID)
	} else {
		// Fallback or Admin mode: Send to all (be careful in prod)
		// For now, let's just require auth for this too.
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if err != nil {
		http.Error(w, "Failed to get subscriptions", http.StatusInternalServerError)
		return
	}

	message := "Hello from LifeHub! This is a test notification."

	for _, s := range subs {
		sub := &webpush.Subscription{
			Endpoint: s.Endpoint,
			Keys: webpush.Keys{
				P256dh: s.P256dh,
				Auth:   s.Auth,
			},
		}

		// Send Notification
		resp, err := webpush.SendNotification([]byte(message), sub, &webpush.Options{
			Subscriber:      "mailto:admin@lifehub.com", // Required by VAPID
			VAPIDPublicKey:  VapidPublicKey,
			VAPIDPrivateKey: VapidPrivateKey,
			TTL:             30,
		})
		if err != nil {
			log.Println("Failed to send push:", err)
		} else {
			log.Println("Push sent, status:", resp.Status)
			defer resp.Body.Close()
		}
	}

	w.Write([]byte("Notifications sent!"))
}

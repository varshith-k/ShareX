package handlers

import (
	"encoding/json"
	"net/http"
	"time"
)

var startTime = time.Now()

func HealthHandler(w http.ResponseWriter, r *http.Request) {

	uptime := time.Since(startTime).String()

	response := map[string]interface{}{
		"status":    "ok",
		"timestamp": time.Now(),
		"uptime":    uptime,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
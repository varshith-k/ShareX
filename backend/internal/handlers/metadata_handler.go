package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"sharex-backend/internal/repository"
	"sharex-backend/internal/database"

)

func MetadataHandler(w http.ResponseWriter, r *http.Request) {
	// Expected format: /file/{token}
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	token := parts[2]

	if database.DB == nil {
	http.Error(w, "Database not initialized", http.StatusInternalServerError)
	return
}

repo := repository.FileRepository{}
file, err := repo.GetByToken(token)

	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(file)
}

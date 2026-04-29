package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"sharex-backend/internal/repository"
	"sharex-backend/internal/services"
	"sharex-backend/internal/utils"
)

func MetadataHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	token := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/file/"))
	if token == "" || strings.Contains(token, "/") {
		utils.WriteJSONError(w, "Invalid token", http.StatusBadRequest)
		return
	}

	repo := &repository.FileRepository{}

	file, err := repo.GetByToken(token)
	if err != nil {
		utils.WriteJSONError(w, "File not found", http.StatusNotFound)
		return
	}

	if !file.IsActive {
		utils.WriteJSONError(w, "File link is revoked", http.StatusForbidden)
		return
	}

	if file.ExpiresAt != nil && file.ExpiresAt.Before(time.Now()) {
		if err := cleanupExpiredFile(file); err != nil {
			utils.WriteJSONError(w, "Unable to clean up expired file", http.StatusInternalServerError)
			return
		}
		utils.WriteJSONError(w, "File link has expired", http.StatusGone)
		return
	}

	if file.PasswordHash != nil {
		password := strings.TrimSpace(r.URL.Query().Get("password"))
		if password == "" {
			writePasswordRequired(w, "Password required to access this file")
			return
		}

		if !services.CheckPasswordHash(password, *file.PasswordHash) {
			writePasswordRequired(w, "Invalid file password")
			return
		}
	}

	response := map[string]interface{}{
		"filename":         file.Filename,
		"size":             file.Size,
		"token":            file.Token,
		"createdAt":        file.CreatedAt,
		"expiresAt":        file.ExpiresAt,
		"isActive":         file.IsActive,
		"isExpired":        file.ExpiresAt != nil && file.ExpiresAt.Before(time.Now()),
		"requiresPassword": file.PasswordHash != nil,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func writePasswordRequired(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	json.NewEncoder(w).Encode(map[string]any{
		"error":            message,
		"requiresPassword": true,
	})
}

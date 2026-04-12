package handlers
import "time"
import (
	"encoding/json"
	"net/http"
	"strings"

	"sharex-backend/internal/repository"
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

	response := map[string]interface{}{
		"filename":  file.Filename,
		"size":      file.Size,
		"token":     file.Token,
		"createdAt": file.CreatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	isExpired := false
	if file.ExpiresAt != nil {
		if time.Now().After(*file.ExpiresAt) {
			isExpired = true
		}
	}

	response := map[string]interface{}{
		"filename":   file.Filename,
		"size":       file.Size,
		"token":      file.Token,
		"createdAt":  file.CreatedAt,
		"expiresAt":  file.ExpiresAt,
		"isExpired":  isExpired,
	}

	json.NewEncoder(w).Encode(response)
}

package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"sharex-backend/internal/utils"
	"sharex-backend/internal/repository"
)

func MetadataHandler(w http.ResponseWriter, r *http.Request) {
	token := strings.TrimPrefix(r.URL.Path, "/file/")

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
	json.NewEncoder(w).Encode(response)
}
package handlers

import (
	"net/http"
	"os"
	"strings"
	"time"

	"sharex-backend/internal/repository"
	"sharex-backend/internal/utils"
)

func DownloadHandler(w http.ResponseWriter, r *http.Request) {

	token := strings.TrimPrefix(r.URL.Path, "/download/")
	if token == "" {
		utils.WriteJSONError(w, "Token missing", http.StatusBadRequest)
		return
	}

	if strings.Contains(token, "/") {
		utils.WriteJSONError(w, "Invalid token format", http.StatusBadRequest)
		return
	}

	repo := repository.FileRepository{}

	// 🔥 DB FILE (IMPORTANT)
	dbFile, err := repo.GetByToken(token)
	if err != nil {
		utils.WriteJSONError(w, "File not found", http.StatusNotFound)
		return
	}

	// 🔥 Check revoked
	if !dbFile.IsActive {
		utils.WriteJSONError(w, "File link is revoked", http.StatusForbidden)
		return
	}

	// 🔥 Check expired
	if dbFile.ExpiresAt != nil {
		if time.Now().After(*dbFile.ExpiresAt) {
			utils.WriteJSONError(w, "File link has expired", http.StatusGone)
			return
		}
	}

	// 🔥 OPEN ACTUAL FILE (different variable!)
	actualFile, err := os.Open(dbFile.Filepath)
	if err != nil {
		utils.WriteJSONError(w, "File not found on disk", http.StatusNotFound)
		return
	}
	defer actualFile.Close()

	// 🔥 Serve file
	http.ServeFile(w, r, dbFile.Filepath)
}
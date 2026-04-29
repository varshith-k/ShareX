package handlers

import (
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"sharex-backend/internal/repository"
	"sharex-backend/internal/services"
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
			if err := cleanupExpiredFile(dbFile); err != nil {
				utils.WriteJSONError(w, "Unable to clean up expired file", http.StatusInternalServerError)
				return
			}
			utils.WriteJSONError(w, "File link has expired", http.StatusGone)
			return
		}
	}

	if dbFile.PasswordHash != nil {
		password := strings.TrimSpace(r.URL.Query().Get("password"))
		if password == "" {
			utils.WriteJSONError(w, "Password required to download this file", http.StatusUnauthorized)
			return
		}

		if !services.CheckPasswordHash(password, *dbFile.PasswordHash) {
			utils.WriteJSONError(w, "Invalid file password", http.StatusUnauthorized)
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
	w.Header().Set("Content-Disposition", "attachment; filename="+strconv.Quote(dbFile.Filename))
	http.ServeContent(w, r, dbFile.Filename, dbFile.CreatedAt, actualFile)
}

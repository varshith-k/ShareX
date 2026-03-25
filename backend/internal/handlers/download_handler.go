package handlers

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"sharex-backend/internal/repository"
)

func DownloadHandler(w http.ResponseWriter, r *http.Request) {
	token := strings.TrimPrefix(r.URL.Path, "/download/")
	token = strings.TrimSpace(token)

	if token == "" || strings.Contains(token, "/") {
		http.Error(w, "Invalid token", http.StatusBadRequest)
		return
	}

	repo := repository.FileRepository{}
	fileMeta, err := repo.GetByToken(token)
	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	file, err := os.Open(fileMeta.Filepath)
	if err != nil {
		http.Error(w, "File missing on server", http.StatusNotFound)
		return
	}
	defer file.Close()

	filename := filepath.Base(fileMeta.Filepath)
	if idx := strings.Index(filename, "_"); idx != -1 && idx+1 < len(filename) {
		filename = filename[idx+1:]
	}

	w.Header().Set("Content-Disposition", `attachment; filename="`+filename+`"`)
	http.ServeContent(w, r, filename, fileMeta.CreatedAt, file)
}

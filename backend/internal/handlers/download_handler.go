package handlers

import (
	"net/http"
	"os"
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

	filename := fileMeta.Filename

	w.Header().Set("Content-Disposition", `attachment; filename="`+filename+`"`)
	http.ServeContent(w, r, filename, fileMeta.CreatedAt, file)
}

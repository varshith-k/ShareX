package handlers

import (
	"net/http"
	"os"
	"strings"

	"sharex-backend/internal/repository"
	"sharex-backend/internal/utils"
)

func DownloadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	token := strings.TrimPrefix(r.URL.Path, "/download/")
	token = strings.TrimSpace(token)

	if token == "" || strings.Contains(token, "/") {
		utils.WriteJSONError(w, "Invalid token", http.StatusBadRequest)
		return
	}

	repo := repository.FileRepository{}
	fileMeta, err := repo.GetByToken(token)
	if err != nil {
		utils.WriteJSONError(w, "File not found", http.StatusNotFound)
		return
	}

	if !fileMeta.IsActive {
		utils.WriteJSONError(w, "File not found", http.StatusNotFound)
		return
	}

	file, err := os.Open(fileMeta.Filepath)
	if err != nil {
		utils.WriteJSONError(w, "File missing on server", http.StatusNotFound)
		return
	}
	defer file.Close()

	filename := fileMeta.Filename

	w.Header().Set("Content-Disposition", `attachment; filename="`+filename+`"`)
	http.ServeContent(w, r, filename, fileMeta.CreatedAt, file)
}

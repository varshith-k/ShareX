package handlers
import "time"
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

	file, err := repo.GetByToken(token)
	if err != nil {
		utils.WriteJSONError(w, "File not found", http.StatusNotFound)
		return
	}

	// 🔥 Check if file is revoked
	if !file.IsActive {
		utils.WriteJSONError(w, "File link is revoked", http.StatusForbidden)
		return
	}

	// 🔥 Check if file is expired
	if file.ExpiresAt != nil {
		if time.Now().After(*file.ExpiresAt) {
			utils.WriteJSONError(w, "File link has expired", http.StatusGone)
			return
		}
	}
	defer file.Close()

	filename := fileMeta.Filename

	w.Header().Set("Content-Disposition", `attachment; filename="`+filename+`"`)
	http.ServeContent(w, r, filename, fileMeta.CreatedAt, file)
}

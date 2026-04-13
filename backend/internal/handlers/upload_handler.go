package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"sharex-backend/internal/middleware"
	"sharex-backend/internal/models"
	"sharex-backend/internal/repository"
	"sharex-backend/internal/utils"
)

const MaxUploadSize = 10 << 20 // 10MB

func UploadHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		utils.WriteJSONError(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 🔥 Limit size
	r.Body = http.MaxBytesReader(w, r.Body, MaxUploadSize)

	// 🔥 Parse multipart (simple, no strict failure)
	_ = r.ParseMultipartForm(MaxUploadSize)

	// 🔥 Get file
	file, handler, err := r.FormFile("file")
	if err != nil {
		utils.WriteJSONError(w, "file not found in request", http.StatusBadRequest)
		return
	}
	defer file.Close()

	if handler.Size == 0 {
		utils.WriteJSONError(w, "file is empty", http.StatusBadRequest)
		return
	}

	// 🔥 Save file
	token := utils.GenerateToken()

	uploadsDir := "uploads"
	os.MkdirAll(uploadsDir, os.ModePerm)

	fp := filepath.Join(uploadsDir, token+"_"+handler.Filename)

	dst, err := os.Create(fp)
	if err != nil {
		utils.WriteJSONError(w, "failed to save file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	size, err := io.Copy(dst, file)
	if err != nil {
		utils.WriteJSONError(w, "error saving file", http.StatusInternalServerError)
		return
	}

	repo := repository.FileRepository{}

	var ownerID *int
	if uid, ok := middleware.UserIDFromContext(r.Context()); ok {
		ownerID = &uid
	}

	newFile := models.File{
		Filename: handler.Filename,
		Filepath: fp,
		Token:    token,
		Size:     size,
		OwnerID:  ownerID,
		IsActive: true,
	}

	err = repo.Create(&newFile)
	if err != nil {
		utils.WriteJSONError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message":     "file uploaded successfully",
		"token":       token,
		"downloadUrl": "/download/" + token,
	})
}
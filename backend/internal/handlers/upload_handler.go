package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"sharex-backend/internal/models"
	"sharex-backend/internal/repository"
	"sharex-backend/internal/utils"
)

const MaxUploadSize = 10 << 20 // 10MB

func UploadHandler(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, MaxUploadSize)

	err := r.ParseMultipartForm(MaxUploadSize)
	if err != nil {
		utils.WriteJSONError(w, "File exceeds maximum allowed size of 10MB", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		utils.WriteJSONError(w, "File not found in request", http.StatusBadRequest)
		return
	}
	defer file.Close()

	if handler.Size == 0 {
		utils.WriteJSONError(w, "File is empty", http.StatusBadRequest)
		return
	}

	token := utils.GenerateToken()

	fp := filepath.Join("uploads", token+"_"+handler.Filename)

	dst, err := os.Create(fp)
	if err != nil {
		utils.WriteJSONError(w, "Unable to save file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	size, err := io.Copy(dst, file)
	if err != nil {
		utils.WriteJSONError(w, "Error saving file", http.StatusInternalServerError)
		return
	}

	repo := repository.FileRepository{}

	newFile := models.File{
		Filename: handler.Filename,
		Filepath: fp,
		Token:    token,
		Size:     size,
	}

	err = repo.Create(&newFile)
	if err != nil {
		utils.WriteJSONError(w, "Database error", http.StatusInternalServerError)
		return
	}

	downloadURL := "/download/" + token

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message":     "File uploaded successfully",
		"token":       token,
		"downloadUrl": downloadURL,
	})
}
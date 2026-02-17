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

func UploadHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20) // 10MB
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "File not found", http.StatusBadRequest)
		return
	}
	defer file.Close()

	token := utils.GenerateToken()

	filepath := filepath.Join("uploads", token+"_"+handler.Filename)

	dst, err := os.Create(filepath)
	if err != nil {
		http.Error(w, "Unable to save file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	size, err := io.Copy(dst, file)
	if err != nil {
		http.Error(w, "Error saving file", http.StatusInternalServerError)
		return
	}

	repo := repository.FileRepository{}

	newFile := models.File{
		Filename: handler.Filename,
		Filepath: filepath,
		Token:    token,
		Size:     size,
	}

	err = repo.Create(&newFile)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"message": "File uploaded successfully",
		"token":   token,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

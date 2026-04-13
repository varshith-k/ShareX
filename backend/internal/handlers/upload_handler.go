package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"sharex-backend/internal/middleware"
	"sharex-backend/internal/models"
	"sharex-backend/internal/repository"
	"sharex-backend/internal/utils"
)

const MaxUploadSize = 10 << 20 // 10MB

func UploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 🔥 Content-Type validation (FIRST)
	contentType := r.Header.Get("Content-Type")
	if contentType == "" {
		utils.WriteJSONError(w, "Content-Type header missing", http.StatusBadRequest)
		return
	}

	if !strings.HasPrefix(contentType, "multipart/form-data") {
		utils.WriteJSONError(w, "Content-Type must be multipart/form-data", http.StatusBadRequest)
		return
	}

	// 🔥 Limit body size
	r.Body = http.MaxBytesReader(w, r.Body, MaxUploadSize)

	// 🔥 Parse multipart form (ONLY ONCE)
	err := r.ParseMultipartForm(MaxUploadSize)
	if err != nil {
		if err.Error() == "http: request body too large" {
			utils.WriteJSONError(w, "File exceeds maximum allowed size of 10MB", http.StatusBadRequest)
		} else {
			utils.WriteJSONError(w, "Invalid multipart/form-data request", http.StatusBadRequest)
		}
		return
	}

	// 🔥 Get file
	file, handler, err := r.FormFile("file")
	if err != nil {
		utils.WriteJSONError(w, "File not found in request", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// 🔥 Empty file check
	if handler.Size == 0 {
		utils.WriteJSONError(w, "File is empty", http.StatusBadRequest)
		return
	}

	// 🔥 Generate token
	token := utils.GenerateToken()

	// 🔥 Ensure upload directory exists
	uploadsDir := "uploads"
	if err := os.MkdirAll(uploadsDir, os.ModePerm); err != nil {
		utils.WriteJSONError(w, "Unable to prepare upload directory", http.StatusInternalServerError)
		return
	}

	// 🔥 Create file path
	fp := filepath.Join(uploadsDir, token+"_"+handler.Filename)

	// 🔥 Save file
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

	// 🔥 Repository save
	repo := repository.FileRepository{}

	var ownerID *int
	if uid, ok := middleware.UserIDFromContext(r.Context()); ok {
		ownerID = &uid
	}

	newFile := models.File{
		Filename:  handler.Filename,
		Filepath:  fp,
		Token:     token,
		Size:      size,
		OwnerID:   ownerID,
		IsActive:  true,
		ExpiresAt: nil,
	}

	err = repo.Create(&newFile)
	if err != nil {
		utils.WriteJSONError(w, "Database error", http.StatusInternalServerError)
		return
	}

	// 🔥 Success response
	downloadURL := "/download/" + token

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message":     "File uploaded successfully",
		"token":       token,
		"downloadUrl": downloadURL,
	})
}
package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"sharex-backend/internal/config"
	"sharex-backend/internal/middleware"
	"sharex-backend/internal/models"
	"sharex-backend/internal/repository"
	"sharex-backend/internal/services"
	"sharex-backend/internal/utils"
)

func UploadHandler(w http.ResponseWriter, r *http.Request) {
	maxUploadSize := config.MaxUploadSizeBytes()

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
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)

	// 🔥 Parse multipart form (ONLY ONCE)
	err := r.ParseMultipartForm(maxUploadSize)
	if err != nil {
		if err.Error() == "http: request body too large" {
			utils.WriteJSONError(w, "File exceeds maximum allowed size", http.StatusBadRequest)
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

	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil {
		utils.WriteJSONError(w, "Unable to read file", http.StatusBadRequest)
		return
	}

	// detect content type
	fileType := http.DetectContentType(buffer)

	// allowed types
	allowedTypes := map[string]bool{
		"image/jpeg":                true,
		"image/png":                 true,
		"application/pdf":           true,
		"application/octet-stream":  true,
		"text/plain; charset=utf-8": true,
	}

	// validate
	if !allowedTypes[fileType] {
		utils.WriteJSONError(w, "Unsupported file type", http.StatusBadRequest)
		return
	}

	// reset file pointer
	file.Seek(0, 0)

	// 🔥 Empty file check
	if handler.Size == 0 {
		utils.WriteJSONError(w, "File is empty", http.StatusBadRequest)
		return
	}

	expiresAt, err := parseExpirationSelection(r.FormValue("expiresInHours"))
	if err != nil {
		utils.WriteJSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	passwordHash, err := parseOptionalFilePassword(r.FormValue("password"))
	if err != nil {
		utils.WriteJSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 🔥 Generate token
	token := utils.GenerateToken()

	// 🔥 Ensure upload directory exists
	uploadsDir := config.UploadDir()
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
		Filename:     handler.Filename,
		Filepath:     fp,
		Token:        token,
		Size:         size,
		OwnerID:      ownerID,
		IsActive:     true,
		ExpiresAt:    expiresAt,
		PasswordHash: passwordHash,
	}

	err = repo.Create(&newFile)
	if err != nil {
		utils.WriteJSONError(w, "Database error", http.StatusInternalServerError)
		return
	}

	// 🔥 Success response
	downloadURL := "/download/" + token

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"message":          "File uploaded successfully",
		"token":            token,
		"downloadUrl":      downloadURL,
		"expiresAt":        expiresAt,
		"requiresPassword": passwordHash != nil,
	})
}

func parseExpirationSelection(value string) (*time.Time, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" || trimmed == "never" {
		return nil, nil
	}

	if trimmed == "1m" {
		expiresAt := time.Now().Add(1 * time.Minute).UTC()
		return &expiresAt, nil
	}

	hours, err := strconv.Atoi(trimmed)
	if err != nil {
		return nil, errInvalidExpiration()
	}

	allowed := map[int]bool{
		24:   true,
		168:  true,
		720:  true,
		2160: true,
	}

	if !allowed[hours] {
		return nil, errInvalidExpiration()
	}

	expiresAt := time.Now().Add(time.Duration(hours) * time.Hour).UTC()
	return &expiresAt, nil
}

func errInvalidExpiration() error {
	return &uploadValidationError{message: "Invalid expiration selection"}
}

func parseOptionalFilePassword(value string) (*string, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil, nil
	}

	if len(trimmed) < 4 {
		return nil, &uploadValidationError{message: "File password must be at least 4 characters"}
	}

	hash, err := services.HashPassword(trimmed)
	if err != nil {
		return nil, &uploadValidationError{message: "Unable to protect file with password"}
	}

	return &hash, nil
}

type uploadValidationError struct {
	message string
}

func (e *uploadValidationError) Error() string {
	return e.message
}

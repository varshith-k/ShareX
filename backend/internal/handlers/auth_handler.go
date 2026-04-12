package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strings"

	"sharex-backend/internal/middleware"
	"sharex-backend/internal/models"
	"sharex-backend/internal/repository"
	"sharex-backend/internal/services"
	"sharex-backend/internal/utils"
)

type registerRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteJSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.Password = strings.TrimSpace(req.Password)

	if req.Name == "" || req.Email == "" || req.Password == "" {
		utils.WriteJSONError(w, "name, email, and password are required", http.StatusBadRequest)
		return
	}

	passwordHash, err := services.HashPassword(req.Password)
	if err != nil {
		utils.WriteJSONError(w, "Unable to process password", http.StatusInternalServerError)
		return
	}

	user := models.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: passwordHash,
	}

	repo := repository.UserRepository{}
	if err := repo.Create(&user); err != nil {
		if errors.Is(err, repository.ErrUserAlreadyExists) {
			utils.WriteJSONError(w, "Email already registered", http.StatusConflict)
			return
		}

		utils.WriteJSONError(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"message": "User registered successfully",
		"user": map[string]any{
			"id":        user.ID,
			"name":      user.Name,
			"email":     user.Email,
			"createdAt": user.CreatedAt,
		},
	})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteJSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	req.Email = strings.TrimSpace(req.Email)
	req.Password = strings.TrimSpace(req.Password)

	if req.Email == "" || req.Password == "" {
		utils.WriteJSONError(w, "email and password are required", http.StatusBadRequest)
		return
	}

	repo := repository.UserRepository{}
	user, err := repo.GetByEmail(req.Email)
	if err != nil {
		utils.WriteJSONError(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	if !services.CheckPasswordHash(req.Password, user.PasswordHash) {
		utils.WriteJSONError(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	token, err := services.GenerateJWT(user.ID, user.Email, user.Name)
	if err != nil {
		utils.WriteJSONError(w, "Unable to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"message": "Login successful",
		"token":   token,
		"user": map[string]any{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

func MeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		utils.WriteJSONError(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	repo := repository.UserRepository{}
	user, err := repo.GetByID(userID)
	if err != nil {
		utils.WriteJSONError(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"user": map[string]any{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

func MyFilesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		utils.WriteJSONError(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	repo := repository.FileRepository{}
	files, err := repo.ListByOwnerID(userID)
	if err != nil {
		utils.WriteJSONError(w, "Database error", http.StatusInternalServerError)
		return
	}

	items := make([]map[string]any, 0, len(files))
	for _, file := range files {
		items = append(items, map[string]any{
			"id":        file.ID,
			"filename":  file.Filename,
			"token":     file.Token,
			"size":      file.Size,
			"isActive":  file.IsActive,
			"createdAt": file.CreatedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"files": items,
	})
}

func DeleteMyFileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.WriteJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		utils.WriteJSONError(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	token := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/me/files/"))
	if token == "" || strings.Contains(token, "/") {
		utils.WriteJSONError(w, "Invalid token", http.StatusBadRequest)
		return
	}

	repo := repository.FileRepository{}
	file, err := repo.GetByToken(token)
	if err != nil {
		utils.WriteJSONError(w, "File not found", http.StatusNotFound)
		return
	}

	if file.OwnerID == nil || *file.OwnerID != userID {
		utils.WriteJSONError(w, "Forbidden", http.StatusForbidden)
		return
	}

	if err := os.Remove(file.Filepath); err != nil {
		if os.IsNotExist(err) {
			utils.WriteJSONError(w, "File not found", http.StatusNotFound)
			return
		}

		utils.WriteJSONError(w, "Unable to delete file", http.StatusInternalServerError)
		return
	}

	if err := repo.DeleteByToken(token); err != nil {
		utils.WriteJSONError(w, "File not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "File deleted successfully",
	})
}

func RevokeMyFileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		utils.WriteJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		utils.WriteJSONError(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	token := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/me/files/revoke/"))
	if token == "" || strings.Contains(token, "/") {
		utils.WriteJSONError(w, "Invalid token", http.StatusBadRequest)
		return
	}

	repo := repository.FileRepository{}
	file, err := repo.GetByToken(token)
	if err != nil {
		utils.WriteJSONError(w, "File not found", http.StatusNotFound)
		return
	}

	if file.OwnerID == nil || *file.OwnerID != userID {
		utils.WriteJSONError(w, "Forbidden", http.StatusForbidden)
		return
	}

	if err := repo.RevokeByToken(token); err != nil {
		utils.WriteJSONError(w, "File not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "File link revoked successfully",
	})
}

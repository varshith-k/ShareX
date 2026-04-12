package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

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

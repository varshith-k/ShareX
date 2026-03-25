package repository

import (
	"testing"

	"sharex-backend/internal/database"
)

func TestGetByToken_InvalidToken(t *testing.T) {
	repo := &FileRepository{}

	// 🔥 Prevent nil pointer crash
	if database.DB == nil {
		t.Skip("Skipping test because database is not initialized")
	}

	invalidToken := "this-token-does-not-exist"

	file, err := repo.GetByToken(invalidToken)

	if err == nil {
		t.Errorf("Expected error for invalid token, got nil")
	}

	if file != nil {
		t.Errorf("Expected file to be nil, got %v", file)
	}
}
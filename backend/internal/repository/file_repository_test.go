package repository

import (
	"testing"

	"sharex-backend/internal/models"
)

func TestGetByToken_ValidToken(t *testing.T) {
	ResetInMemoryStore()

	repo := &FileRepository{}

	testFile := &models.File{
		Filename: "test.txt",
		Filepath: "/tmp/test.txt",
		Token:    "valid-token-123",
		Size:     100,
	}

	// Insert into DB
	err := repo.Create(testFile)
	if err != nil {
		t.Fatalf("Failed to insert test file: %v", err)
	}

	// Fetch using token
	result, err := repo.GetByToken(testFile.Token)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if result == nil {
		t.Fatalf("Expected file, got nil")
	}

	if result.Token != testFile.Token {
		t.Errorf("Expected token %v, got %v", testFile.Token, result.Token)
	}
}

func TestGetByToken_InvalidToken(t *testing.T) {
	ResetInMemoryStore()

	repo := &FileRepository{}

	invalidToken := "this-token-does-not-exist"

	file, err := repo.GetByToken(invalidToken)

	if err == nil {
		t.Errorf("Expected error for invalid token, got nil")
	}

	if file != nil {
		t.Errorf("Expected file to be nil, got %v", file)
	}
}

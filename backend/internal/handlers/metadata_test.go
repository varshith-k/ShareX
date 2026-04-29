package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"testing"
	"time"

	"sharex-backend/internal/models"
	"sharex-backend/internal/repository"
	"sharex-backend/internal/services"
	"sharex-backend/internal/utils"
)

func TestMetadataHandler_InvalidToken(t *testing.T) {
	repository.ResetInMemoryStore()

	req := utils.CreateTestRequest("GET", "/file/invalid-token")
	rr := utils.CreateTestRecorder()

	handler := http.HandlerFunc(MetadataHandler)
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", rr.Code)
	}

	if rr.Body.String() == "" {
		t.Errorf("Expected error response body")
	}
}

func TestMetadataHandler_Success(t *testing.T) {
	repository.ResetInMemoryStore()

	err := (&repository.FileRepository{}).Create(&models.File{
		Filename:  "test-token.txt",
		Filepath:  "uploads/test-token.txt",
		Token:     "test-token",
		Size:      128,
		CreatedAt: time.Now(),
	})
	if err != nil {
		t.Fatalf("Failed to seed repository: %v", err)
	}

	req := utils.CreateTestRequest("GET", "/file/test-token")
	rr := utils.CreateTestRecorder()

	handler := http.HandlerFunc(MetadataHandler)
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rr.Code)
	}

	var response map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Expected JSON response: %v", err)
	}

	if response["filename"] != "test-token.txt" {
		t.Errorf("Expected filename test-token.txt, got %v", response["filename"])
	}
}

func TestMetadataHandler_ProtectedFileRequiresPassword(t *testing.T) {
	repository.ResetInMemoryStore()

	hash, err := services.HashPassword("lock123")
	if err != nil {
		t.Fatal(err)
	}

	err = (&repository.FileRepository{}).Create(&models.File{
		Filename:     "protected.txt",
		Filepath:     "uploads/protected.txt",
		Token:        "protected-token",
		Size:         128,
		CreatedAt:    time.Now(),
		IsActive:     true,
		PasswordHash: &hash,
	})
	if err != nil {
		t.Fatalf("Failed to seed repository: %v", err)
	}

	req := utils.CreateTestRequest("GET", "/file/protected-token")
	rr := utils.CreateTestRecorder()

	http.HandlerFunc(MetadataHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("Expected status 401, got %d", rr.Code)
	}
}

func TestMetadataHandler_ProtectedFileAcceptsValidPassword(t *testing.T) {
	repository.ResetInMemoryStore()

	hash, err := services.HashPassword("lock123")
	if err != nil {
		t.Fatal(err)
	}

	err = (&repository.FileRepository{}).Create(&models.File{
		Filename:     "protected.txt",
		Filepath:     "uploads/protected.txt",
		Token:        "protected-token",
		Size:         128,
		CreatedAt:    time.Now(),
		IsActive:     true,
		PasswordHash: &hash,
	})
	if err != nil {
		t.Fatalf("Failed to seed repository: %v", err)
	}

	req := utils.CreateTestRequest("GET", "/file/protected-token?password=lock123")
	rr := utils.CreateTestRecorder()

	http.HandlerFunc(MetadataHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", rr.Code)
	}
}

func TestMetadataHandler_ExpiredFileIsCleanedUpOnAccess(t *testing.T) {
	repository.ResetInMemoryStore()

	testFile, err := os.CreateTemp("", "sharex-expired-metadata-*.txt")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(testFile.Name())

	if _, err := testFile.WriteString("expired metadata content"); err != nil {
		t.Fatal(err)
	}
	if err := testFile.Close(); err != nil {
		t.Fatal(err)
	}

	expiredTime := time.Now().Add(-1 * time.Hour)
	err = (&repository.FileRepository{}).Create(&models.File{
		Filename:  "expired.txt",
		Filepath:  testFile.Name(),
		Token:     "expired-metadata-token",
		Size:      128,
		CreatedAt: time.Now(),
		IsActive:  true,
		ExpiresAt: &expiredTime,
	})
	if err != nil {
		t.Fatalf("Failed to seed repository: %v", err)
	}

	req := utils.CreateTestRequest("GET", "/file/expired-metadata-token")
	rr := utils.CreateTestRecorder()

	http.HandlerFunc(MetadataHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusGone {
		t.Fatalf("Expected status 410, got %d", rr.Code)
	}

	if _, err := (&repository.FileRepository{}).GetByToken("expired-metadata-token"); err != nil {
		t.Fatalf("Expected expired file metadata to be preserved after access: %v", err)
	}

	if _, err := os.Stat(testFile.Name()); !os.IsNotExist(err) {
		t.Fatalf("Expected expired file on disk to be deleted, got err=%v", err)
	}
}

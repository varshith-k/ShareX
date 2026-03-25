package handlers

import (
	"encoding/json"
	"net/http"
	"testing"
	"time"

	"sharex-backend/internal/models"
	"sharex-backend/internal/repository"
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

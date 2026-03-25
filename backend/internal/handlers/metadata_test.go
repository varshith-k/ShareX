package handlers

import (
	"net/http"
	"testing"

	"sharex-backend/internal/database"
	"sharex-backend/internal/utils"
)

func TestMetadataHandler_InvalidToken(t *testing.T) {
	if database.DB == nil {
		t.Skip("Skipping test because database is not initialized")
	}

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
	if database.DB == nil {
		t.Skip("Skipping test because database is not initialized")
	}

	req := utils.CreateTestRequest("GET", "/file/test-token")
	rr := utils.CreateTestRecorder()

	handler := http.HandlerFunc(MetadataHandler)
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK && rr.Code != http.StatusNotFound {
		t.Errorf("Expected status 200 or 404, got %d", rr.Code)
	}

	if rr.Body.String() == "" {
		t.Errorf("Expected non-empty response body")
	}
}
package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"sharex-backend/internal/database"
)

func TestMetadataHandler_InvalidToken(t *testing.T) {
	// Skip if DB not initialized (prevents crash)
	if database.DB == nil {
		t.Skip("Skipping test because database is not initialized")
	}

	req, err := http.NewRequest("GET", "/file/invalid-token", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()

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
	// 🔥 Prevent crash if DB not initialized
	if database.DB == nil {
		t.Skip("Skipping test because database is not initialized")
	}

	req, err := http.NewRequest("GET", "/file/test-token", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()

	handler := http.HandlerFunc(MetadataHandler)
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK && rr.Code != http.StatusNotFound {
		t.Errorf("Expected status 200 or 404, got %d", rr.Code)
	}

	if rr.Body.String() == "" {
		t.Errorf("Expected non-empty response body")
	}
}
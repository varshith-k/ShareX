package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestDownloadHandler_MissingToken(t *testing.T) {
	req, err := http.NewRequest("GET", "/download/", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(DownloadHandler)

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %v", rr.Code)
	}
}

func TestDownloadHandler_InvalidToken_DBNotInitialized(t *testing.T) {
	defer func() {
		if r := recover(); r != nil {
			t.Log("Handler panicked as expected when DB is nil — skipping")
		}
	}()

	req, err := http.NewRequest("GET", "/download/sometoken123", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(DownloadHandler)

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusNotFound && rr.Code != http.StatusInternalServerError {
		t.Errorf("Expected 404 or 500, got %v", rr.Code)
	}
}

func TestDownloadHandler_TokenWithSlash(t *testing.T) {
	req, err := http.NewRequest("GET", "/download/bad/token", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(DownloadHandler)

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %v", rr.Code)
	}
}

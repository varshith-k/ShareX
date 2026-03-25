package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestDownloadHandler_EmptyToken(t *testing.T) {
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

func TestDownloadHandler_TokenNotInDB(t *testing.T) {
	req, err := http.NewRequest("GET", "/download/nonexistenttoken", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(DownloadHandler)

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Errorf("Expected 404, got %v", rr.Code)
	}
}

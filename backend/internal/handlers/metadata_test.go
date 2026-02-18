package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestMetadataHandler_DBNotInitialized(t *testing.T) {
	req, err := http.NewRequest("GET", "/file/invalidtoken", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(MetadataHandler)

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Errorf("Expected status 500, got %v", rr.Code)
	}
}

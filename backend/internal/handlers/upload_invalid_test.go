package handlers

import (
	"bytes"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestUploadHandler_WrongMethod(t *testing.T) {
	req, err := http.NewRequest("GET", "/upload", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(UploadHandler)

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected status 405, got %v", rr.Code)
	}
}

func TestUploadHandler_MalformedMultipart(t *testing.T) {
	body := strings.NewReader("this is not valid multipart data")

	req, err := http.NewRequest("POST", "/upload", body)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "multipart/form-data; boundary=invalid")

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(UploadHandler)

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %v", rr.Code)
	}
}

func TestUploadHandler_MissingFileField(t *testing.T) {
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	writer.WriteField("not_a_file", "some value")
	writer.Close()

	req, err := http.NewRequest("POST", "/upload", &buf)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(UploadHandler)

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %v", rr.Code)
	}
}

package handlers

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"sharex-backend/internal/middleware"
	"sharex-backend/internal/repository"
	"sharex-backend/internal/services"
)

func TestUploadHandler_MissingFile(t *testing.T) {
	repository.ResetInMemoryStore()

	req, err := http.NewRequest("POST", "/upload", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(UploadHandler)

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %v", rr.Code)
	}
}

func TestUploadHandler_EmptyFile(t *testing.T) {
	repository.ResetInMemoryStore()

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	_, err := writer.CreateFormFile("file", "empty.txt")
	if err != nil {
		t.Fatal(err)
	}
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

func TestUploadHandler_ValidFile(t *testing.T) {
	repository.ResetInMemoryStore()
	t.Cleanup(func() {
		os.RemoveAll("uploads")
	})

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	fw, err := writer.CreateFormFile("file", "test.txt")
	if err != nil {
		t.Fatal(err)
	}
	fw.Write([]byte("hello world"))
	writer.Close()

	req, err := http.NewRequest("POST", "/upload", &buf)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(UploadHandler)

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %v", rr.Code)
	}

	var response map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Expected valid JSON response: %v", err)
	}

	if response["token"] == "" {
		t.Fatalf("Expected token in response")
	}

	if response["downloadUrl"] == "" {
		t.Fatalf("Expected download URL in response")
	}

	fileMeta, err := (&repository.FileRepository{}).GetByToken(response["token"])
	if err != nil {
		t.Fatalf("Expected file metadata to be saved: %v", err)
	}

	if fileMeta.Filename != "test.txt" {
		t.Fatalf("Expected filename test.txt, got %s", fileMeta.Filename)
	}

	if _, err := os.Stat(filepath.Clean(fileMeta.Filepath)); err != nil {
		t.Fatalf("Expected uploaded file to exist on disk: %v", err)
	}
}

func TestUploadHandler_AuthenticatedUploadStoresOwnerID(t *testing.T) {
	repository.ResetInMemoryStore()
	t.Cleanup(func() {
		os.RemoveAll("uploads")
	})
	t.Setenv("JWT_SECRET", "test-secret")

	authToken, err := services.GenerateJWT(77, "owner@example.com", "Owner")
	if err != nil {
		t.Fatal(err)
	}

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	fw, err := writer.CreateFormFile("file", "owner-test.txt")
	if err != nil {
		t.Fatal(err)
	}
	fw.Write([]byte("owner content"))
	writer.Close()

	req, err := http.NewRequest("POST", "/upload", &buf)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+authToken)

	rr := httptest.NewRecorder()
	handler := middleware.AuthMiddleware(http.HandlerFunc(UploadHandler))
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %v", rr.Code)
	}

	var response map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Expected valid JSON response: %v", err)
	}

	fileMeta, err := (&repository.FileRepository{}).GetByToken(response["token"])
	if err != nil {
		t.Fatalf("Expected file metadata to be saved: %v", err)
	}

	if fileMeta.OwnerID == nil || *fileMeta.OwnerID != 77 {
		t.Fatalf("Expected owner ID 77, got %v", fileMeta.OwnerID)
	}
}

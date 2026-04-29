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
	"time"

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

	var response map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Expected valid JSON response: %v", err)
	}

	token, _ := response["token"].(string)
	downloadURL, _ := response["downloadUrl"].(string)

	if token == "" {
		t.Fatalf("Expected token in response")
	}

	if downloadURL == "" {
		t.Fatalf("Expected download URL in response")
	}

	fileMeta, err := (&repository.FileRepository{}).GetByToken(token)
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

	var response map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Expected valid JSON response: %v", err)
	}

	token, _ := response["token"].(string)
	fileMeta, err := (&repository.FileRepository{}).GetByToken(token)
	if err != nil {
		t.Fatalf("Expected file metadata to be saved: %v", err)
	}

	if fileMeta.OwnerID == nil || *fileMeta.OwnerID != 77 {
		t.Fatalf("Expected owner ID 77, got %v", fileMeta.OwnerID)
	}
}

func TestUploadHandler_StoresFilePasswordHashWhenProvided(t *testing.T) {
	repository.ResetInMemoryStore()
	t.Cleanup(func() {
		os.RemoveAll("uploads")
	})

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	fw, err := writer.CreateFormFile("file", "protected.txt")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := fw.Write([]byte("secret content")); err != nil {
		t.Fatal(err)
	}
	if err := writer.WriteField("password", "lock123"); err != nil {
		t.Fatal(err)
	}
	writer.Close()

	req, err := http.NewRequest("POST", "/upload", &buf)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	rr := httptest.NewRecorder()
	http.HandlerFunc(UploadHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %v", rr.Code)
	}

	var response map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Expected valid JSON response: %v", err)
	}

	token, _ := response["token"].(string)
	fileMeta, err := (&repository.FileRepository{}).GetByToken(token)
	if err != nil {
		t.Fatalf("Expected file metadata to be saved: %v", err)
	}

	if fileMeta.PasswordHash == nil {
		t.Fatalf("Expected password hash to be stored")
	}

	if *fileMeta.PasswordHash == "lock123" {
		t.Fatalf("Expected hashed file password, got plain text")
	}
}

func TestUploadHandler_RejectsShortFilePassword(t *testing.T) {
	repository.ResetInMemoryStore()

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	fw, err := writer.CreateFormFile("file", "short-password.txt")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := fw.Write([]byte("content")); err != nil {
		t.Fatal(err)
	}
	if err := writer.WriteField("password", "123"); err != nil {
		t.Fatal(err)
	}
	writer.Close()

	req, err := http.NewRequest("POST", "/upload", &buf)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	rr := httptest.NewRecorder()
	http.HandlerFunc(UploadHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("Expected status 400, got %v", rr.Code)
	}

	if !bytes.Contains(rr.Body.Bytes(), []byte("File password must be at least 4 characters")) {
		t.Fatalf("Expected short password validation error, got %s", rr.Body.String())
	}
}

func TestUploadHandler_SetsExpirationWhenProvided(t *testing.T) {
	repository.ResetInMemoryStore()
	t.Cleanup(func() {
		os.RemoveAll("uploads")
	})

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	fw, err := writer.CreateFormFile("file", "expiring.txt")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := fw.Write([]byte("expiring content")); err != nil {
		t.Fatal(err)
	}
	if err := writer.WriteField("expiresInHours", "168"); err != nil {
		t.Fatal(err)
	}
	writer.Close()

	req, err := http.NewRequest("POST", "/upload", &buf)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	rr := httptest.NewRecorder()
	http.HandlerFunc(UploadHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %v", rr.Code)
	}

	var response map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Expected valid JSON response: %v", err)
	}

	token, _ := response["token"].(string)
	fileMeta, err := (&repository.FileRepository{}).GetByToken(token)
	if err != nil {
		t.Fatalf("Expected file metadata to be saved: %v", err)
	}

	if fileMeta.ExpiresAt == nil {
		t.Fatalf("Expected expiration timestamp to be stored")
	}

	if fileMeta.ExpiresAt.Before(time.Now().Add(6 * 24 * time.Hour)) {
		t.Fatalf("Expected expiration to be about a week in the future, got %v", fileMeta.ExpiresAt)
	}
}

func TestUploadHandler_RejectsInvalidExpirationSelection(t *testing.T) {
	repository.ResetInMemoryStore()

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	fw, err := writer.CreateFormFile("file", "invalid-expiration.txt")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := fw.Write([]byte("content")); err != nil {
		t.Fatal(err)
	}
	if err := writer.WriteField("expiresInHours", "999"); err != nil {
		t.Fatal(err)
	}
	writer.Close()

	req, err := http.NewRequest("POST", "/upload", &buf)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	rr := httptest.NewRecorder()
	http.HandlerFunc(UploadHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("Expected status 400, got %v", rr.Code)
	}

	if !bytes.Contains(rr.Body.Bytes(), []byte("Invalid expiration selection")) {
		t.Fatalf("Expected invalid expiration error, got %s", rr.Body.String())
	}
}

func TestUploadHandler_SetsOneMinuteExpirationWhenProvided(t *testing.T) {
	repository.ResetInMemoryStore()
	t.Cleanup(func() {
		os.RemoveAll("uploads")
	})

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	fw, err := writer.CreateFormFile("file", "one-minute.txt")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := fw.Write([]byte("one minute content")); err != nil {
		t.Fatal(err)
	}
	if err := writer.WriteField("expiresInHours", "1m"); err != nil {
		t.Fatal(err)
	}
	writer.Close()

	req, err := http.NewRequest("POST", "/upload", &buf)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	rr := httptest.NewRecorder()
	http.HandlerFunc(UploadHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %v", rr.Code)
	}

	var response map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Expected valid JSON response: %v", err)
	}

	token, _ := response["token"].(string)
	fileMeta, err := (&repository.FileRepository{}).GetByToken(token)
	if err != nil {
		t.Fatalf("Expected file metadata to be saved: %v", err)
	}

	if fileMeta.ExpiresAt == nil {
		t.Fatalf("Expected one-minute expiration timestamp to be stored")
	}

	if fileMeta.ExpiresAt.After(time.Now().Add(2 * time.Minute)) {
		t.Fatalf("Expected short expiration window, got %v", fileMeta.ExpiresAt)
	}
}

package handlers

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"sharex-backend/internal/models"
	"sharex-backend/internal/repository"
)

func TestDownloadHandler_MissingToken(t *testing.T) {
	repository.ResetInMemoryStore()

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

func TestDownloadHandler_InvalidToken(t *testing.T) {
	repository.ResetInMemoryStore()

	req, err := http.NewRequest("GET", "/download/sometoken123", nil)
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

func TestDownloadHandler_TokenWithSlash(t *testing.T) {
	repository.ResetInMemoryStore()

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

func TestDownloadHandler_ReturnsStoredFile(t *testing.T) {
	repository.ResetInMemoryStore()

	testFile, err := os.CreateTemp("", "sharex-download-*.txt")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(testFile.Name())

	if _, err := testFile.WriteString("download content"); err != nil {
		t.Fatal(err)
	}
	if err := testFile.Close(); err != nil {
		t.Fatal(err)
	}

	repo := &repository.FileRepository{}
	err = repo.Create(&models.File{
		Filename:  "download.txt",
		Filepath:  testFile.Name(),
		Token:     "download-token",
		Size:      int64(len("download content")),
		CreatedAt: time.Now(),
	})
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/download/download-token", nil)
	rr := httptest.NewRecorder()

	http.HandlerFunc(DownloadHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected 200, got %d", rr.Code)
	}

	if body := rr.Body.String(); body != "download content" {
		t.Fatalf("Expected downloaded content, got %q", body)
	}
}

func TestDownloadHandler_RevokedFileCannotBeDownloaded(t *testing.T) {
	repository.ResetInMemoryStore()

	testFile, err := os.CreateTemp("", "sharex-revoked-*.txt")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(testFile.Name())

	if _, err := testFile.WriteString("revoked content"); err != nil {
		t.Fatal(err)
	}
	if err := testFile.Close(); err != nil {
		t.Fatal(err)
	}

	repo := &repository.FileRepository{}
	err = repo.Create(&models.File{
		Filename: "revoked.txt",
		Filepath: testFile.Name(),
		Token:    "revoked-token",
		Size:     int64(len("revoked content")),
	})
	if err != nil {
		t.Fatal(err)
	}

	if err := repo.RevokeByToken("revoked-token"); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/download/revoked-token", nil)
	rr := httptest.NewRecorder()

	http.HandlerFunc(DownloadHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("Expected 404 for revoked file, got %d", rr.Code)
	}
}

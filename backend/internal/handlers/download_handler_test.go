package handlers

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"sharex-backend/internal/models"
	"sharex-backend/internal/repository"
	"sharex-backend/internal/services"
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
		IsActive:  true,
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
		IsActive: true,
	})
	if err != nil {
		t.Fatal(err)
	}

	// Revoke file
	if err := repo.RevokeByToken("revoked-token"); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/download/revoked-token", nil)
	rr := httptest.NewRecorder()

	http.HandlerFunc(DownloadHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Fatalf("Expected 403 for revoked file, got %d", rr.Code)
	}
}

func TestDownloadHandler_ExpiredFileCannotBeDownloaded(t *testing.T) {
	repository.ResetInMemoryStore()

	expiredTime := time.Now().Add(-1 * time.Hour)

	testFile, err := os.CreateTemp("", "sharex-expired-download-*.txt")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(testFile.Name())

	if _, err := testFile.WriteString("expired download content"); err != nil {
		t.Fatal(err)
	}
	if err := testFile.Close(); err != nil {
		t.Fatal(err)
	}

	repo := &repository.FileRepository{}
	err = repo.Create(&models.File{
		Filename:  "expired.txt",
		Filepath:  testFile.Name(),
		Token:     "expired-token",
		Size:      100,
		IsActive:  true,
		ExpiresAt: &expiredTime,
	})
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/download/expired-token", nil)
	rr := httptest.NewRecorder()

	http.HandlerFunc(DownloadHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusGone {
		t.Fatalf("Expected 410 for expired file, got %d", rr.Code)
	}

	if _, err := repo.GetByToken("expired-token"); err != nil {
		t.Fatalf("Expected expired file metadata to be preserved after download access: %v", err)
	}

	if _, err := os.Stat(testFile.Name()); !os.IsNotExist(err) {
		t.Fatalf("Expected expired file on disk to be deleted, got err=%v", err)
	}
}

func TestDownloadHandler_ProtectedFileRequiresPassword(t *testing.T) {
	repository.ResetInMemoryStore()

	testFile, err := os.CreateTemp("", "sharex-protected-*.txt")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(testFile.Name())

	if _, err := testFile.WriteString("protected content"); err != nil {
		t.Fatal(err)
	}
	if err := testFile.Close(); err != nil {
		t.Fatal(err)
	}

	hash, err := services.HashPassword("lock123")
	if err != nil {
		t.Fatal(err)
	}

	err = (&repository.FileRepository{}).Create(&models.File{
		Filename:     "protected.txt",
		Filepath:     testFile.Name(),
		Token:        "protected-token",
		Size:         int64(len("protected content")),
		IsActive:     true,
		PasswordHash: &hash,
	})
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/download/protected-token", nil)
	rr := httptest.NewRecorder()

	http.HandlerFunc(DownloadHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("Expected 401 for password-protected file, got %d", rr.Code)
	}
}

func TestDownloadHandler_ProtectedFileAcceptsValidPassword(t *testing.T) {
	repository.ResetInMemoryStore()

	testFile, err := os.CreateTemp("", "sharex-protected-success-*.txt")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(testFile.Name())

	if _, err := testFile.WriteString("protected content"); err != nil {
		t.Fatal(err)
	}
	if err := testFile.Close(); err != nil {
		t.Fatal(err)
	}

	hash, err := services.HashPassword("lock123")
	if err != nil {
		t.Fatal(err)
	}

	err = (&repository.FileRepository{}).Create(&models.File{
		Filename:     "protected.txt",
		Filepath:     testFile.Name(),
		Token:        "protected-token",
		Size:         int64(len("protected content")),
		IsActive:     true,
		PasswordHash: &hash,
	})
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/download/protected-token?password=lock123", nil)
	rr := httptest.NewRecorder()

	http.HandlerFunc(DownloadHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected 200 for password-protected file, got %d", rr.Code)
	}
}

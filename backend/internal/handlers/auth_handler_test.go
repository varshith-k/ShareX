package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"sharex-backend/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

func TestRegisterHandler_Success(t *testing.T) {
	repository.ResetInMemoryUserStore()

	body := map[string]string{
		"name":     "Varshith",
		"email":    "varshith@example.com",
		"password": "pass12345",
	}

	payload, err := json.Marshal(body)
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	http.HandlerFunc(RegisterHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("Expected status 201, got %d", rr.Code)
	}

	repo := repository.UserRepository{}
	storedUser, err := repo.GetByEmail("varshith@example.com")
	if err != nil {
		t.Fatalf("Expected stored user, got error: %v", err)
	}

	if storedUser.PasswordHash == "pass12345" {
		t.Fatalf("Expected password to be hashed, but plain password was stored")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(storedUser.PasswordHash), []byte("pass12345")); err != nil {
		t.Fatalf("Expected valid bcrypt hash, got compare error: %v", err)
	}
}

func TestRegisterHandler_DuplicateEmail(t *testing.T) {
	repository.ResetInMemoryUserStore()

	body := map[string]string{
		"name":     "User One",
		"email":    "duplicate@example.com",
		"password": "pass12345",
	}

	payload, err := json.Marshal(body)
	if err != nil {
		t.Fatal(err)
	}

	firstReq := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(payload))
	firstReq.Header.Set("Content-Type", "application/json")
	firstRR := httptest.NewRecorder()
	http.HandlerFunc(RegisterHandler).ServeHTTP(firstRR, firstReq)

	if firstRR.Code != http.StatusCreated {
		t.Fatalf("Expected first request status 201, got %d", firstRR.Code)
	}

	secondReq := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewReader(payload))
	secondReq.Header.Set("Content-Type", "application/json")
	secondRR := httptest.NewRecorder()
	http.HandlerFunc(RegisterHandler).ServeHTTP(secondRR, secondReq)

	if secondRR.Code != http.StatusConflict {
		t.Fatalf("Expected second request status 409, got %d", secondRR.Code)
	}
}

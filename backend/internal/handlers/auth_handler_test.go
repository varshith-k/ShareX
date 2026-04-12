package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"sharex-backend/internal/models"
	"sharex-backend/internal/repository"
	"sharex-backend/internal/services"

	"github.com/golang-jwt/jwt/v5"
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

func TestLoginHandler_SuccessReturnsJWT(t *testing.T) {
	repository.ResetInMemoryUserStore()
	t.Setenv("JWT_SECRET", "test-secret")

	hash, err := services.HashPassword("pass12345")
	if err != nil {
		t.Fatal(err)
	}

	repo := repository.UserRepository{}
	err = repo.Create(&models.User{Name: "Login User", Email: "login@example.com", PasswordHash: hash})
	if err != nil {
		t.Fatal(err)
	}

	body := map[string]string{
		"email":    "login@example.com",
		"password": "pass12345",
	}

	payload, err := json.Marshal(body)
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	http.HandlerFunc(LoginHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", rr.Code)
	}

	var response map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Expected valid JSON response: %v", err)
	}

	tokenRaw, ok := response["token"].(string)
	if !ok || tokenRaw == "" {
		t.Fatalf("Expected non-empty JWT token in response")
	}

	parsed, err := jwt.Parse(tokenRaw, func(token *jwt.Token) (any, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !parsed.Valid {
		t.Fatalf("Expected valid signed JWT, got error: %v", err)
	}
}

func TestLoginHandler_InvalidCredentials(t *testing.T) {
	repository.ResetInMemoryUserStore()

	hash, err := services.HashPassword("correct-password")
	if err != nil {
		t.Fatal(err)
	}

	repo := repository.UserRepository{}
	err = repo.Create(&models.User{Name: "Wrong Pass User", Email: "wrongpass@example.com", PasswordHash: hash})
	if err != nil {
		t.Fatal(err)
	}

	body := map[string]string{
		"email":    "wrongpass@example.com",
		"password": "wrong-password",
	}

	payload, err := json.Marshal(body)
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	http.HandlerFunc(LoginHandler).ServeHTTP(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("Expected status 401, got %d", rr.Code)
	}
}

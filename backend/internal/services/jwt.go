package services

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"sharex-backend/internal/config"
)

func GenerateJWT(userID int, email string, name string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "dev-secret-change-me"
	}

	now := time.Now().UTC()
	expiry := time.Duration(config.JWTExpiryHours()) * time.Hour
	claims := jwt.MapClaims{
		"sub":   userID,
		"email": email,
		"name":  name,
		"iat":   now.Unix(),
		"exp":   now.Add(expiry).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func ValidateJWT(tokenString string) (jwt.MapClaims, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "dev-secret-change-me"
	}

	parsedToken, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok || !parsedToken.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	return claims, nil
}

func UserIDFromClaims(claims jwt.MapClaims) (int, bool) {
	sub, ok := claims["sub"]
	if !ok {
		return 0, false
	}

	switch v := sub.(type) {
	case float64:
		return int(v), true
	case int:
		return v, true
	case string:
		parsed, err := strconv.Atoi(v)
		if err != nil {
			return 0, false
		}
		return parsed, true
	default:
		return 0, false
	}
}

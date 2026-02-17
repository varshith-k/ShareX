package services

import (
	"crypto/rand"
	"encoding/base64"
)

func GenerateToken(length int) (string, error) {
	bytes := make([]byte, length)

	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}

	// URL-safe encoding
	token := base64.URLEncoding.EncodeToString(bytes)

	return token, nil
}

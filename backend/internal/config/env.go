package config

import (
	"os"
	"strconv"
	"strings"
)

const defaultUploadDir = "uploads"

func UploadDir() string {
	if dir := strings.TrimSpace(os.Getenv("UPLOAD_DIR")); dir != "" {
		return dir
	}
	return defaultUploadDir
}

func MaxUploadSizeBytes() int64 {
	const defaultMB int64 = 10
	mb := int64FromEnv("MAX_UPLOAD_SIZE_MB", defaultMB)
	if mb <= 0 {
		mb = defaultMB
	}
	return mb << 20
}

func AllowedOrigins() []string {
	raw := strings.TrimSpace(os.Getenv("CORS_ALLOWED_ORIGINS"))
	if raw == "" {
		return []string{"http://localhost:3000"}
	}

	origins := make([]string, 0)
	for _, part := range strings.Split(raw, ",") {
		origin := strings.TrimSpace(part)
		if origin != "" {
			origins = append(origins, origin)
		}
	}

	if len(origins) == 0 {
		return []string{"http://localhost:3000"}
	}

	return origins
}

func JWTExpiryHours() int64 {
	const defaultHours int64 = 24
	hours := int64FromEnv("JWT_EXPIRY_HOURS", defaultHours)
	if hours <= 0 {
		return defaultHours
	}
	return hours
}

func int64FromEnv(key string, fallback int64) int64 {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback
	}

	v, err := strconv.ParseInt(raw, 10, 64)
	if err != nil {
		return fallback
	}

	return v
}

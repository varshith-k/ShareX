package middleware

import (
	"context"
	"net/http"
	"strings"

	"sharex-backend/internal/services"
	"sharex-backend/internal/utils"
)

type contextKey string

const userIDContextKey contextKey = "userID"

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
		if authHeader == "" {
			utils.WriteJSONError(w, "Missing authorization token", http.StatusUnauthorized)
			return
		}

		const bearerPrefix = "Bearer "
		if !strings.HasPrefix(authHeader, bearerPrefix) {
			utils.WriteJSONError(w, "Invalid authorization header", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimSpace(strings.TrimPrefix(authHeader, bearerPrefix))
		if tokenString == "" {
			utils.WriteJSONError(w, "Invalid authorization header", http.StatusUnauthorized)
			return
		}

		claims, err := services.ValidateJWT(tokenString)
		if err != nil {
			utils.WriteJSONError(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		userID, ok := services.UserIDFromClaims(claims)
		if !ok {
			utils.WriteJSONError(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), userIDContextKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func UserIDFromContext(ctx context.Context) (int, bool) {
	userID, ok := ctx.Value(userIDContextKey).(int)
	return userID, ok
}

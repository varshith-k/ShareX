package main

import (
	"log"
	"net/http"
	"os"

	"sharex-backend/internal/database"
	"sharex-backend/internal/handlers"
	"sharex-backend/internal/middleware"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	uploadsDir := "uploads"
	if _, err := os.Stat(uploadsDir); os.IsNotExist(err) {
		if mkErr := os.MkdirAll(uploadsDir, os.ModePerm); mkErr != nil {
			log.Fatalf("Failed to create uploads directory: %v", mkErr)
		}
		log.Println("Created uploads directory")
	} else if err != nil {
		log.Fatalf("Error checking uploads directory: %v", err)
	} else {
		log.Println("Uploads directory already exists")
	}

	database.Connect()

	mux := http.NewServeMux()

	// Root
	mux.Handle("/", middleware.LoggingMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ShareX Backend Running"))
	})))

	// Health
	mux.Handle("/health", middleware.LoggingMiddleware(http.HandlerFunc(handlers.HealthHandler)))

	// Upload (Logging + RateLimiter + Auth)
	mux.Handle("/upload",
		middleware.LoggingMiddleware(
			middleware.RateLimiter(
				middleware.AuthMiddleware(http.HandlerFunc(handlers.UploadHandler)),
			),
		),
	)

	// Public routes
	mux.Handle("/download/", middleware.LoggingMiddleware(http.HandlerFunc(handlers.DownloadHandler)))
	mux.Handle("/file/", middleware.LoggingMiddleware(http.HandlerFunc(handlers.MetadataHandler)))

	// Auth routes
	mux.Handle("/auth/register", middleware.LoggingMiddleware(http.HandlerFunc(handlers.RegisterHandler)))
	mux.Handle("/auth/login", middleware.LoggingMiddleware(http.HandlerFunc(handlers.LoginHandler)))

	// Protected routes
	mux.Handle("/me",
		middleware.LoggingMiddleware(
			middleware.AuthMiddleware(http.HandlerFunc(handlers.MeHandler)),
		),
	)

	mux.Handle("/me/files",
		middleware.LoggingMiddleware(
			middleware.AuthMiddleware(http.HandlerFunc(handlers.MyFilesHandler)),
		),
	)

	mux.Handle("/me/files/revoke/",
		middleware.LoggingMiddleware(
			middleware.AuthMiddleware(http.HandlerFunc(handlers.RevokeMyFileHandler)),
		),
	)

	mux.Handle("/me/files/",
		middleware.LoggingMiddleware(
			middleware.AuthMiddleware(http.HandlerFunc(handlers.DeleteMyFileHandler)),
		),
	)

	log.Printf("Server running on port %s\n", port)

	if err := http.ListenAndServe(":"+port, withCORS(mux)); err != nil {
		log.Fatal(err)
	}
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
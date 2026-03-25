package main

import (
	"log"
	"net/http"
	"os"

	"sharex-backend/internal/database"
	"sharex-backend/internal/handlers"
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

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ShareX Backend Running"))
	})

	mux.HandleFunc("/health", handlers.HealthHandler)

	mux.HandleFunc("/upload", handlers.UploadHandler)

	mux.HandleFunc("/download/", handlers.DownloadHandler)

	mux.HandleFunc("/file/", handlers.MetadataHandler)

	log.Printf("Server running on port %s\n", port)

	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}

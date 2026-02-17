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

	err := os.MkdirAll("uploads", os.ModePerm)
	if err != nil {
		log.Fatal("Failed to create uploads directory:", err)
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

	log.Printf("Server running on port %s\n", port)

	err = http.ListenAndServe(":"+port, mux)
	if err != nil {
		log.Fatal(err)
	}
}

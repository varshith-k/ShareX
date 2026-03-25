package database

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func Connect() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Println("DATABASE_URL not set; running with in-memory metadata storage")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Printf("Unable to create connection pool: %v", err)
		log.Println("Falling back to in-memory metadata storage")
		return
	}

	if err := pool.Ping(ctx); err != nil {
		log.Printf("Unable to connect to database: %v", err)
		log.Println("Falling back to in-memory metadata storage")
		return
	}

	DB = pool
	log.Println("✅ Connected to PostgreSQL")
}

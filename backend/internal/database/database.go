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

	if err := ensureSchema(pool); err != nil {
		log.Printf("Unable to prepare database schema: %v", err)
		log.Println("Falling back to in-memory metadata storage")
		DB = nil
		pool.Close()
		return
	}

	log.Println("✅ Connected to PostgreSQL")
	log.Println("✅ Database schema is ready")
}

func ensureSchema(pool *pgxpool.Pool) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS files (
			id SERIAL PRIMARY KEY,
			filename TEXT NOT NULL,
			filepath TEXT NOT NULL,
			token TEXT NOT NULL UNIQUE,
			size BIGINT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
		`ALTER TABLE files
			ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL`,
		`ALTER TABLE files
			ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`,
		`ALTER TABLE files
			ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL`,
		`ALTER TABLE files
			ADD COLUMN IF NOT EXISTS password_hash TEXT NULL`,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	for _, statement := range statements {
		if _, err := pool.Exec(ctx, statement); err != nil {
			return err
		}
	}

	return nil
}

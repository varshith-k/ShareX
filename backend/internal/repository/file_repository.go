package repository

import (
	"context"
	"database/sql"
	"errors"
	"sync"
	"time"

	"sharex-backend/internal/database"
	"sharex-backend/internal/models"
)

type FileRepository struct{}

var (
	inMemoryFiles  = map[string]*models.File{}
	inMemoryMu     sync.RWMutex
	nextInMemoryID = 1
)

func (r *FileRepository) Create(file *models.File) error {
	if database.DB == nil {
		inMemoryMu.Lock()
		defer inMemoryMu.Unlock()

		file.ID = nextInMemoryID
		nextInMemoryID++
		file.CreatedAt = time.Now().UTC()

		fileCopy := *file
		inMemoryFiles[file.Token] = &fileCopy
		return nil
	}

	query := `
	INSERT INTO files (filename, filepath, token, size, owner_id)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING id, created_at
	`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return database.DB.QueryRow(ctx, query,
		file.Filename,
		file.Filepath,
		file.Token,
		file.Size,
		file.OwnerID,
	).Scan(&file.ID, &file.CreatedAt)
}

func (r *FileRepository) GetByToken(token string) (*models.File, error) {
	if database.DB == nil {
		inMemoryMu.RLock()
		defer inMemoryMu.RUnlock()

		file, ok := inMemoryFiles[token]
		if !ok {
			return nil, errors.New("file not found")
		}

		fileCopy := *file
		return &fileCopy, nil
	}

	query := `
	SELECT id, filename, filepath, token, size, owner_id, created_at
	FROM files
	WHERE token = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var file models.File
	var ownerID sql.NullInt64

	err := database.DB.QueryRow(ctx, query, token).Scan(
		&file.ID,
		&file.Filename,
		&file.Filepath,
		&file.Token,
		&file.Size,
		&ownerID,
		&file.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	if ownerID.Valid {
		id := int(ownerID.Int64)
		file.OwnerID = &id
	}

	return &file, nil
}

func ResetInMemoryStore() {
	inMemoryMu.Lock()
	defer inMemoryMu.Unlock()

	inMemoryFiles = map[string]*models.File{}
	nextInMemoryID = 1
}

package repository

import (
	"context"
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
	INSERT INTO files (filename, filepath, token, size)
	VALUES ($1, $2, $3, $4)
	RETURNING id, created_at
	`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return database.DB.QueryRow(ctx, query,
		file.Filename,
		file.Filepath,
		file.Token,
		file.Size,
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
	SELECT id, filename, filepath, token, size, created_at
	FROM files
	WHERE token = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var file models.File

	err := database.DB.QueryRow(ctx, query, token).Scan(
		&file.ID,
		&file.Filename,
		&file.Filepath,
		&file.Token,
		&file.Size,
		&file.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &file, nil
}

func ResetInMemoryStore() {
	inMemoryMu.Lock()
	defer inMemoryMu.Unlock()

	inMemoryFiles = map[string]*models.File{}
	nextInMemoryID = 1
}

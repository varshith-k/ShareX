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
	if !file.IsActive {
		file.IsActive = true
	}

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
	INSERT INTO files (filename, filepath, token, size, owner_id, is_active, expires_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7)
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
		file.IsActive,
		file.ExpiresAt,
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
	SELECT id, filename, filepath, token, size, owner_id, is_active, created_at, expires_at
	FROM files
	WHERE token = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var file models.File
	var ownerID sql.NullInt64
	var expiresAt sql.NullTime

	err := database.DB.QueryRow(ctx, query, token).Scan(
		&file.ID,
		&file.Filename,
		&file.Filepath,
		&file.Token,
		&file.Size,
		&ownerID,
		&file.IsActive,
		&file.CreatedAt,
		&expiresAt,
	)

	if err != nil {
		return nil, err
	}

	if ownerID.Valid {
		id := int(ownerID.Int64)
		file.OwnerID = &id
	}

	if expiresAt.Valid {
		t := expiresAt.Time
		file.ExpiresAt = &t
	}

	return &file, nil
}

func (r *FileRepository) ListByOwnerID(ownerID int) ([]models.File, error) {
	if database.DB == nil {
		inMemoryMu.RLock()
		defer inMemoryMu.RUnlock()

		files := make([]models.File, 0)
		for _, file := range inMemoryFiles {
			if file.OwnerID == nil || *file.OwnerID != ownerID {
				continue
			}

			fileCopy := *file
			files = append(files, fileCopy)
		}

		return files, nil
	}

	query := `
	SELECT id, filename, filepath, token, size, owner_id, is_active, created_at, expires_at
	FROM files
	WHERE owner_id = $1
	ORDER BY created_at DESC
	`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := database.DB.Query(ctx, query, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	files := make([]models.File, 0)

	for rows.Next() {
		var file models.File
		var owner sql.NullInt64
		var expiresAt sql.NullTime

		if err := rows.Scan(
			&file.ID,
			&file.Filename,
			&file.Filepath,
			&file.Token,
			&file.Size,
			&owner,
			&file.IsActive,
			&file.CreatedAt,
			&expiresAt,
		); err != nil {
			return nil, err
		}

		if owner.Valid {
			id := int(owner.Int64)
			file.OwnerID = &id
		}

		if expiresAt.Valid {
			t := expiresAt.Time
			file.ExpiresAt = &t
		}

		files = append(files, file)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return files, nil
}

func (r *FileRepository) DeleteByToken(token string) error {
	if database.DB == nil {
		inMemoryMu.Lock()
		defer inMemoryMu.Unlock()

		if _, ok := inMemoryFiles[token]; !ok {
			return errors.New("file not found")
		}

		delete(inMemoryFiles, token)
		return nil
	}

	query := `
	DELETE FROM files
	WHERE token = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := database.DB.Exec(ctx, query, token)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return errors.New("file not found")
	}

	return nil
}

func (r *FileRepository) RevokeByToken(token string) error {
	if database.DB == nil {
		inMemoryMu.Lock()
		defer inMemoryMu.Unlock()

		file, ok := inMemoryFiles[token]
		if !ok {
			return errors.New("file not found")
		}

		file.IsActive = false
		return nil
	}

	query := `
	UPDATE files
	SET is_active = FALSE
	WHERE token = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := database.DB.Exec(ctx, query, token)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return errors.New("file not found")
	}

	return nil
}

func ResetInMemoryStore() {
	inMemoryMu.Lock()
	defer inMemoryMu.Unlock()

	inMemoryFiles = map[string]*models.File{}
	nextInMemoryID = 1
}
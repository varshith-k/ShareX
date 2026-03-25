package repository

import (
	"context"
	"time"

	"sharex-backend/internal/database"
	"sharex-backend/internal/models"
)

type FileRepository struct{}

func (r *FileRepository) Create(file *models.File) error {
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

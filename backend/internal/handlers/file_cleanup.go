package handlers

import (
	"errors"
	"os"

	"sharex-backend/internal/models"
)

func cleanupExpiredFile(file *models.File) error {
	if file == nil {
		return nil
	}

	if file.Filepath != "" {
		if err := os.Remove(file.Filepath); err != nil && !errors.Is(err, os.ErrNotExist) {
			return err
		}
	}

	return nil
}

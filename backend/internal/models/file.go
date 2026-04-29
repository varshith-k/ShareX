package models

import "time"

type File struct {
	ID        int
	Filename  string
	Filepath  string
	Token     string
	Size      int64
	OwnerID   *int
	IsActive  bool
	CreatedAt time.Time

	ExpiresAt    *time.Time
	PasswordHash *string
}

package models

import "time"

type File struct {
	ID        int
	Filename  string
	Filepath  string
	Token     string
	Size      int64
	CreatedAt time.Time
}

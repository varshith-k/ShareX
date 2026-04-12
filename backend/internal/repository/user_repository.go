package repository

import (
	"context"
	"errors"
	"strings"
	"sync"
	"time"

	"sharex-backend/internal/database"
	"sharex-backend/internal/models"

	"github.com/jackc/pgx/v5/pgconn"
)

var ErrUserAlreadyExists = errors.New("user already exists")

type UserRepository struct{}

var (
	inMemoryUsers      = map[string]*models.User{}
	inMemoryUsersMu    sync.RWMutex
	nextInMemoryUserID = 1
)

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func (r *UserRepository) Create(user *models.User) error {
	normalizedEmail := normalizeEmail(user.Email)

	if database.DB == nil {
		inMemoryUsersMu.Lock()
		defer inMemoryUsersMu.Unlock()

		if _, exists := inMemoryUsers[normalizedEmail]; exists {
			return ErrUserAlreadyExists
		}

		user.ID = nextInMemoryUserID
		nextInMemoryUserID++
		user.Email = normalizedEmail
		user.CreatedAt = time.Now().UTC()

		userCopy := *user
		inMemoryUsers[normalizedEmail] = &userCopy
		return nil
	}

	query := `
	INSERT INTO users (name, email, password_hash)
	VALUES ($1, $2, $3)
	RETURNING id, created_at
	`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := database.DB.QueryRow(ctx, query,
		user.Name,
		normalizedEmail,
		user.PasswordHash,
	).Scan(&user.ID, &user.CreatedAt)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return ErrUserAlreadyExists
		}
		return err
	}

	user.Email = normalizedEmail
	return nil
}

func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	normalizedEmail := normalizeEmail(email)

	if database.DB == nil {
		inMemoryUsersMu.RLock()
		defer inMemoryUsersMu.RUnlock()

		user, ok := inMemoryUsers[normalizedEmail]
		if !ok {
			return nil, errors.New("user not found")
		}

		userCopy := *user
		return &userCopy, nil
	}

	query := `
	SELECT id, name, email, password_hash, created_at
	FROM users
	WHERE email = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User

	err := database.DB.QueryRow(ctx, query, normalizedEmail).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func ResetInMemoryUserStore() {
	inMemoryUsersMu.Lock()
	defer inMemoryUsersMu.Unlock()

	inMemoryUsers = map[string]*models.User{}
	nextInMemoryUserID = 1
}

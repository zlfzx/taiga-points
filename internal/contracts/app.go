package contracts

import (
	"database/sql"
	"taiga-points/internal/services"
)

type App struct {
	BaseURL  string
	DB       *sql.DB
	Services *Services
}

type Services struct {
	Taiga *services.TaigaService
}

type contextKey string

const AuthToken contextKey = "authToken"

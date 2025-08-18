package main

import (
	"embed"
	"log/slog"
	"net/http"
	"os"
	"taiga-points/internal/contracts"
	"taiga-points/internal/database"
	"taiga-points/internal/handlers"
	"taiga-points/internal/routers"
	"taiga-points/internal/services"

	"github.com/joho/godotenv"
)

//go:embed web/*
var web embed.FS

func init() {
	// Load environment variables from .env file
	godotenv.Load()
}

func main() {
	baseURL := os.Getenv("TAIGA_BASE_URL")

	fmt.Println(baseURL)

	db, err := database.Init()
	if err != nil {
		slog.Error("Failed to initialize database", "err", err)
		os.Exit(1)
	}

	app := contracts.App{
		BaseURL: baseURL,
		DB:      db,
		Services: &contracts.Services{
			Taiga: services.NewTaigaService(baseURL, db),
		},
	}

	handlers.Init(&app)
	router := routers.LoadRouters(web)

	port := os.Getenv("APP_PORT")
	slog.Info("Starting server", "port", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		slog.Error("Error starting server", "err", err)
	}
}

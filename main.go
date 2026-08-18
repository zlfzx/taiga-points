package main

import (
	"embed"
	"log/slog"
	"net/http"
	"os"
	"time"
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
	
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}
	
	if err := srv.ListenAndServe(); err != nil {
		slog.Error("Error starting server", "err", err)
	}
}

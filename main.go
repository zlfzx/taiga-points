package main

import (
	"embed"
	"log/slog"
	"net/http"
	"os"
	"taiga-points/internal/routers"

	"github.com/joho/godotenv"
)

//go:embed web/*
var web embed.FS

func init() {
	// Load environment variables from .env file
	godotenv.Load()
}

func main() {
	router := routers.LoadRouters(web)

	port := os.Getenv("APP_PORT")
	slog.Info("Starting server", "port", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		slog.Error("Error starting server", "err", err)
	}
}

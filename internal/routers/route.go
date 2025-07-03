package routers

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"strings"
	"taiga-points/internal/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func LoadRouters(embed embed.FS) (r *chi.Mux) {

	r = chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))
	r.Use(middleware.Logger)

	r.Route("/api", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Post("/", handlers.Auth)
			r.Post("/refresh", handlers.RefreshAuth)
		})
		r.Get("/projects", handlers.GetProjects)
		r.Get("/project", handlers.GetProject)
		// r.Get("/roles", handlers.GetRoles)
		r.Get("/members", handlers.GetMembers)
	})

	// static file server
	web, err := fs.Sub(fs.FS(embed), "web")
	if err != nil {
		log.Fatal("failed to load web directory: " + err.Error())
	}

	fileServer := http.FileServer(http.FS(web))
	r.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/")
		if _, err := fs.ReadFile(web, path); err != nil {
			http.StripPrefix(r.URL.Path, fileServer).ServeHTTP(w, r)
		} else {
			fileServer.ServeHTTP(w, r)
		}
	})

	return
}

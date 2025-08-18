package handlers

import (
	"context"
	"errors"
	"net/http"
	"taiga-points/internal/clients"
	"taiga-points/internal/contracts"
	"taiga-points/internal/models"

	"github.com/go-chi/render"
)

var app *contracts.App

func Init(a *contracts.App) {
	app = a
}

func getHeaderAuth(r *http.Request) string {
	auth := r.Header.Get("Authorization")
	if auth == "" {
		return ""
	}

	// Check if the auth header starts with "Bearer "
	if len(auth) > 7 && auth[:7] == "Bearer " {
		return auth[7:] // Return the token part
	}

	// If it doesn't start with "Bearer ", return the whole header
	return auth
}

func responseJSON(w http.ResponseWriter, r *http.Request, response models.HTTPResponse) {
	render.Status(r, response.StatusCode)
	render.JSON(w, r, response)
}

func responseHTTPError(w http.ResponseWriter, r *http.Request, err error) {
	var httpErr *clients.HTTPError
	if errors.As(err, &httpErr) {
		responseJSON(w, r, models.HTTPResponse{
			StatusCode: httpErr.StatusCode,
			StatusText: http.StatusText(httpErr.StatusCode),
			Message:    httpErr.Body,
		})
		return
	}

	responseJSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusInternalServerError,
		StatusText: "Internal Server Error",
		Message:    err.Error(),
	})
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authToken := getHeaderAuth(r)
		if authToken == "" {
			responseJSON(w, r, models.HTTPResponse{
				StatusCode: http.StatusUnauthorized,
				StatusText: "Unauthorized",
				Message:    "Missing authorization header",
			})
			return
		}

		// Set the auth token in the request context
		ctx := context.WithValue(r.Context(), contracts.AuthToken, authToken)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

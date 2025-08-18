package handlers

import (
	"encoding/json"
	"net/http"
	"taiga-points/internal/models"

	"github.com/go-chi/render"
)

func Auth(w http.ResponseWriter, r *http.Request) {
	// parse the request body
	var authReq models.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&authReq); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusBadRequest,
			StatusText: "Bad Request",
			Message:    "Invalid request payload",
		})
		return
	}

	auth, err := app.Services.Taiga.Authenticate(authReq)
	if err != nil {
		responseHTTPError(w, r, err)
		return
	}

	responseJSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusOK,
		StatusText: "OK",
		Data:       auth,
	})
}

func RefreshAuth(w http.ResponseWriter, r *http.Request) {
	// parse the request body
	var authReq models.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&authReq); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusBadRequest,
			StatusText: "Bad Request",
			Message:    "Invalid request payload",
		})
		return
	}

	auth, err := app.Services.Taiga.RefreshAuth(authReq)
	if err != nil {
		responseHTTPError(w, r, err)
		return
	}

	responseJSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusOK,
		StatusText: "OK",
		Data:       auth,
	})
}

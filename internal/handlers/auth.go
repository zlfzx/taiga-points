package handlers

import (
	"bytes"
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

	payload := map[string]string{
		"type":     "normal",
		"username": authReq.Username,
		"password": authReq.Password,
	}
	body, _ := json.Marshal(payload)

	resp, err := http.Post(TaigaBaseURL+"/auth", "application/json", bytes.NewBuffer(body))
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusInternalServerError,
			StatusText: "Internal Server Error",
			Message:    err.Error(),
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		render.Status(r, http.StatusUnauthorized)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusUnauthorized,
			StatusText: "Unauthorized",
			Message:    "Invalid credentials",
		})
		return
	}

	var auth models.Auth
	json.NewDecoder(resp.Body).Decode(&auth)

	render.Status(r, http.StatusOK)
	render.JSON(w, r, models.HTTPResponse{
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

	payload := map[string]string{
		"refresh": authReq.Refresh,
	}

	body, _ := json.Marshal(payload)
	resp, err := http.Post(TaigaBaseURL+"/auth/refresh", "application/json", bytes.NewBuffer(body))
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusInternalServerError,
			StatusText: "Internal Server Error",
			Message:    err.Error(),
		})
		return
	}
	defer resp.Body.Close()

	// check if the response is valid
	if resp.StatusCode != http.StatusOK {
		render.Status(r, http.StatusUnauthorized)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusUnauthorized,
			StatusText: "Unauthorized",
			Message:    "Invalid refresh token",
		})
		return
	}

	var auth models.Auth
	json.NewDecoder(resp.Body).Decode(&auth)

	render.Status(r, http.StatusOK)
	render.JSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusOK,
		StatusText: "OK",
		Data:       auth,
	})
}

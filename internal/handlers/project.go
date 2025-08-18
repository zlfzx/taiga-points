package handlers

import (
	"encoding/json"
	"net/http"
	"taiga-points/internal/contracts"
	"taiga-points/internal/models"
)

func GetProjects(w http.ResponseWriter, r *http.Request) {
	// get auth token from context
	auth := r.Context().Value(contracts.AuthToken).(string)

	// get query params
	query := r.URL.Query()
	memberId := query.Get("member")

	projects, err := app.Services.Taiga.GetProjects(auth, memberId)
	if err != nil {
		responseHTTPError(w, r, err)
		return
	}

	responseJSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusOK,
		StatusText: "OK",
		Data:       projects,
	})
}

func GetProject(w http.ResponseWriter, r *http.Request) {
	// get auth token from context
	auth := r.Context().Value(contracts.AuthToken).(string)

	// get query params
	query := r.URL.Query()
	projectSlug := query.Get("slug")
	if projectSlug == "" {
		responseJSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusBadRequest,
			StatusText: "Bad Request",
			Message:    "Missing project slug",
		})
		return
	}

	project, err := app.Services.Taiga.GetProject(auth, projectSlug)
	if err != nil {
		responseHTTPError(w, r, err)
		return
	}

	responseJSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusOK,
		StatusText: "OK",
		Data:       project,
	})
}

func SetProjectSettings(w http.ResponseWriter, r *http.Request) {
	// get auth token from context
	auth := r.Context().Value(contracts.AuthToken).(string)

	// parse the request body
	var request models.ProjectSettingRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		responseJSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusBadRequest,
			StatusText: "Bad Request",
			Message:    "Invalid request payload",
		})
		return
	}

	project, err := app.Services.Taiga.SetProjectSettings(auth, request)
	if err != nil {
		responseHTTPError(w, r, err)
		return
	}

	responseJSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusOK,
		StatusText: "OK",
		Data:       project,
	})
}

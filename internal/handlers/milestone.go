package handlers

import (
	"net/http"
	"taiga-points/internal/contracts"
	"taiga-points/internal/models"

	"github.com/go-chi/chi/v5"
)

func GetMilestones(w http.ResponseWriter, r *http.Request) {
	// get auth token from context
	auth := r.Context().Value(contracts.AuthToken).(string)

	// get query params
	query := r.URL.Query()
	projectID := query.Get("project")
	if projectID == "" {
		responseJSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusBadRequest,
			StatusText: "Bad Request",
			Message:    "Missing project ID",
		})
		return
	}

	// get milestones
	milestones, err := app.Services.Taiga.GetMilestones(auth, projectID)
	if err != nil {
		responseHTTPError(w, r, err)
		return
	}

	responseJSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusOK,
		StatusText: "OK",
		Data:       milestones,
	})
}

func GetMilestone(w http.ResponseWriter, r *http.Request) {
	// get auth token from context
	auth := r.Context().Value(contracts.AuthToken).(string)

	// get query params
	milestoneID := chi.URLParam(r, "milestoneID")
	if milestoneID == "" {
		responseJSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusBadRequest,
			StatusText: "Bad Request",
			Message:    "Missing milestone ID",
		})
		return
	}

	// get milestone
	milestone, err := app.Services.Taiga.GetMilestone(auth, milestoneID)
	if err != nil {
		responseHTTPError(w, r, err)
		return
	}

	responseJSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusOK,
		StatusText: "OK",
		Data:       milestone,
	})
}

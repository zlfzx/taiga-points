package handlers

import (
	"net/http"
	"taiga-points/internal/contracts"
	"taiga-points/internal/models"
)

func GetUserStories(w http.ResponseWriter, r *http.Request) {
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

	params := models.UserStoryParams{
		ProjectID: projectID,
	}

	milestoneID := query.Get("milestone_id")
	if milestoneID != "" {
		params.MilestoneID = milestoneID
	}

	isArchived := query.Get("is_archived")
	// if isArchived == "true" {
	// 	params.IsArchived = true
	// } else if isArchived == "false" {
	// 	params.IsArchived = false
	// }
	if isArchived != "" {
		params.IsArchived = isArchived
	}

	// get userStories
	userStories, err := app.Services.Taiga.GetUserStories(auth, params)
	if err != nil {
		responseHTTPError(w, r, err)
		return
	}

	responseJSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusOK,
		StatusText: "OK",
		Data:       userStories,
	})
}

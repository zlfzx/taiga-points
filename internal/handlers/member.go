package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"taiga-points/internal/models"

	"github.com/go-chi/render"
)

func GetMembers(w http.ResponseWriter, r *http.Request) {
	// get headers auth
	// auth := r.Header.Get("Authorization")
	// if auth == "" {
	// 	render.Status(r, http.StatusUnauthorized)
	// 	render.JSON(w, r, models.HTTPResponse{
	// 		StatusCode: http.StatusUnauthorized,
	// 		StatusText: "Unauthorized",
	// 		Message:    "Missing authorization header",
	// 	})
	// 	return
	// }

	// get query params
	query := r.URL.Query()
	projectId := query.Get("project")

	if projectId == "" {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusBadRequest,
			StatusText: "Bad Request",
			Message:    "Missing project id",
		})
		return
	}

	// get memberships
	req, _ := http.NewRequest("GET", baseURL+"/memberships", nil)

	query = req.URL.Query()
	query.Add("project", projectId)
	req.URL.RawQuery = query.Encode()

	// req.Header.Set("Authorization", "Bearer "+auth.AuthToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-disable-pagination", "false")

	client := &http.Client{}
	resp, err := client.Do(req)
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

	body, _ := io.ReadAll(resp.Body)
	var memberships []models.Membership
	err = json.Unmarshal(body, &memberships)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusInternalServerError,
			StatusText: "Internal Server Error",
			Message:    err.Error(),
		})
		return
	}

	// get points
	points, err := GetPoints(projectId)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusInternalServerError,
			StatusText: "Internal Server Error",
			Message:    err.Error(),
		})
		return
	}

	// get user stories
	userStories, err := GetUserStories(projectId)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusInternalServerError,
			StatusText: "Internal Server Error",
			Message:    err.Error(),
		})
		return
	}

	// sort memberships by name
	// sort.Slice(memberships, func(i, j int) bool {
	// 	return memberships[i].FullName < memberships[j].FullName
	// })

	// process memberships
	for i, member := range memberships {

		memberships[i].Stories = make([]models.UserStory, 0)

		for _, userStory := range userStories {

			// check if member.user_id is in userStory.assigned_users
			for _, assignedUser := range userStory.AssignedUsers {
				if member.UserID == assignedUser {

					// get points from user story
					point := 0.0
					// remainingPoint := 0.0
					role := strconv.Itoa(member.RoleID)
					if _, ok := userStory.Points[role]; ok {
						// get point value
						for _, pointValue := range points {
							if pointValue.ID == userStory.Points[role] {
								point = pointValue.Value
								// remainingPoint += point
								break
							}
						}
					}

					// insert subject to points
					// memberships[i].Stories[userStory.Subject] = point
					memberships[i].Stories = append(memberships[i].Stories, userStory)
					memberships[i].TotalPoint += point
					// memberships[i].RemainingPoint += remainingPoint
				}
			}
		}

	}

	render.Status(r, http.StatusOK)
	render.JSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusOK,
		StatusText: "OK",
		Data:       memberships,
	})

}

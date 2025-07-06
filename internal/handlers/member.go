package handlers

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"taiga-points/internal/models"
	"time"

	"github.com/go-chi/chi/v5"
)

type result[T any] struct {
	Data T
	Err  error
}

func GetMembers(w http.ResponseWriter, r *http.Request) {
	// get headers auth
	auth := r.Header.Get("Authorization")
	if auth == "" {
		responseJSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusUnauthorized,
			StatusText: "Unauthorized",
			Message:    "Missing authorization header",
		})
		return
	}

	// get query params
	query := r.URL.Query()
	projectId := query.Get("project")

	if projectId == "" {
		responseJSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusBadRequest,
			StatusText: "Bad Request",
			Message:    "Missing project id",
		})
		return
	}

	// get memberships
	req, _ := http.NewRequest("GET", TaigaBaseURL+"/memberships", nil)

	query = req.URL.Query()
	query.Add("project", projectId)
	req.URL.RawQuery = query.Encode()

	req.Header.Set("Authorization", auth)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-disable-pagination", "True")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		responseJSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusInternalServerError,
			StatusText: "Internal Server Error",
			Message:    err.Error(),
		})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var respJSON any
		if err := json.Unmarshal(body, &respJSON); err != nil {
			respJSON = string(body)
		}
		responseJSON(w, r, models.HTTPResponse{
			StatusCode: resp.StatusCode,
			StatusText: http.StatusText(resp.StatusCode),
			Message:    respJSON,
		})
		return
	}

	var memberships []models.Membership
	err = json.Unmarshal(body, &memberships)
	if err != nil {
		responseJSON(w, r, models.HTTPResponse{
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

	responseJSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusOK,
		StatusText: "OK",
		Data:       memberships,
	})

}

func GetMember(w http.ResponseWriter, r *http.Request) {
	// get headers auth
	auth := r.Header.Get("Authorization")
	if auth == "" {
		responseJSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusUnauthorized,
			StatusText: "Unauthorized",
			Message:    "Missing authorization header",
		})
		return
	}

	// get memberId from URL
	memberId := chi.URLParam(r, "memberId")

	// get memberships
	url := TaigaBaseURL + "/memberships/" + memberId
	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Set("Authorization", auth)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		responseJSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusInternalServerError,
			StatusText: "Internal Server Error",
			Message:    err.Error(),
		})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var respJSON any
		if err := json.Unmarshal(body, &respJSON); err != nil {
			respJSON = string(body)
		}
		responseJSON(w, r, models.HTTPResponse{
			StatusCode: resp.StatusCode,
			StatusText: http.StatusText(resp.StatusCode),
			Message:    respJSON,
		})
		return
	}

	var member models.Membership
	err = json.Unmarshal(body, &member)
	if err != nil {
		responseJSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusInternalServerError,
			StatusText: "Internal Server Error",
			Message:    err.Error(),
		})
		return
	}

	projectId := strconv.Itoa(member.ProjectID)

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	pointsCh := make(chan result[[]models.Point], 1)
	userStoriesCh := make(chan result[[]models.UserStory], 1)

	// get points
	go func() {
		data, err := GetPoints(auth, projectId)
		pointsCh <- result[[]models.Point]{Data: data, Err: err}
	}()

	// get user stories
	go func() {
		data, err := GetUserStories(auth, projectId)
		userStoriesCh <- result[[]models.UserStory]{Data: data, Err: err}
	}()

	var points []models.Point
	var userStories []models.UserStory
	received := 0

	for received < 2 {
		select {
		case <-ctx.Done():
			responseJSON(w, r, models.HTTPResponse{
				StatusCode: http.StatusRequestTimeout,
				StatusText: "Request Timeout",
				Message:    "Request took too long to process",
			})
			return
		case res := <-pointsCh:
			if res.Err != nil {
				responseJSON(w, r, models.HTTPResponse{
					StatusCode: http.StatusInternalServerError,
					StatusText: "Internal Server Error",
					Message:    res.Err.Error(),
				})
				return
			}
			points = res.Data
			received++
		case res := <-userStoriesCh:
			if res.Err != nil {
				responseJSON(w, r, models.HTTPResponse{
					StatusCode: http.StatusInternalServerError,
					StatusText: "Internal Server Error",
					Message:    res.Err.Error(),
				})
				return
			}
			userStories = res.Data
			received++
		}
	}

	member.Stories = make([]models.UserStory, 0)

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
				member.Stories = append(member.Stories, userStory)
				member.TotalPoint += point
				// memberships[i].RemainingPoint += remainingPoint
			}
		}
	}

	responseJSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusOK,
		StatusText: "OK",
		Data:       member,
	})
}

package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"taiga-points/internal/models"

	"github.com/go-chi/render"
)

func GetProjects(w http.ResponseWriter, r *http.Request) {

	// get headers auth
	auth := r.Header.Get("Authorization")
	if auth == "" {
		render.Status(r, http.StatusUnauthorized)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusUnauthorized,
			StatusText: "Unauthorized",
			Message:    "Missing authorization header",
		})
		return
	}

	// get query params
	query := r.URL.Query()
	memberId := query.Get("member")

	// get projects
	req, _ := http.NewRequest("GET", TaigaBaseURL+"/projects", nil)

	if memberId != "" {
		query = req.URL.Query()
		query.Add("member", memberId)
		req.URL.RawQuery = query.Encode()
	}

	req.Header.Set("Authorization", auth)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-disable-pagination", "True")

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
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		render.Status(r, resp.StatusCode)
		var respJSON any
		if err := json.Unmarshal(body, &respJSON); err != nil {
			respJSON = string(body)
		}
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: resp.StatusCode,
			StatusText: http.StatusText(resp.StatusCode),
			Message:    respJSON,
		})
		return
	}

	var projects []models.Project
	err = json.Unmarshal(body, &projects)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusInternalServerError,
			StatusText: "Internal Server Error",
			Message:    err.Error(),
		})
		return
	}

	render.Status(r, http.StatusOK)
	render.JSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusOK,
		StatusText: "OK",
		Data:       projects,
	})
}

func GetProject(w http.ResponseWriter, r *http.Request) {

	// get headers auth
	auth := r.Header.Get("Authorization")
	if auth == "" {
		render.Status(r, http.StatusUnauthorized)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusUnauthorized,
			StatusText: "Unauthorized",
			Message:    "Missing authorization header",
		})
		return
	}

	// get query params
	query := r.URL.Query()
	projectSlug := query.Get("slug")
	if projectSlug == "" {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusBadRequest,
			StatusText: "Bad Request",
			Message:    "Missing project slug",
		})
		return
	}

	req, _ := http.NewRequest("GET", TaigaBaseURL+"/projects/by_slug", nil)

	query = req.URL.Query()
	query.Add("slug", projectSlug)
	req.URL.RawQuery = query.Encode()

	req.Header.Set("Authorization", auth)
	req.Header.Set("Content-Type", "application/json")
	// req.Header.Set("x-disable-pagination", "false")

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
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		render.Status(r, resp.StatusCode)
		var respJSON any
		if err := json.Unmarshal(body, &respJSON); err != nil {
			respJSON = string(body)
		}
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: resp.StatusCode,
			StatusText: http.StatusText(resp.StatusCode),
			Message:    respJSON,
		})
		return
	}

	var project models.Project
	err = json.Unmarshal(body, &project)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, models.HTTPResponse{
			StatusCode: http.StatusInternalServerError,
			StatusText: "Internal Server Error",
			Message:    err.Error(),
		})
		return
	}

	render.Status(r, http.StatusOK)
	render.JSON(w, r, models.HTTPResponse{
		StatusCode: http.StatusOK,
		StatusText: "OK",
		Data:       project,
	})
}

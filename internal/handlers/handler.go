package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"taiga-points/internal/models"
)

var TaigaBaseURL string

func GetUserStories(auth, projectId string) (userStories []models.UserStory, err error) {

	req, _ := http.NewRequest("GET", TaigaBaseURL+"/userstories", nil)

	query := req.URL.Query()
	query.Add("project", projectId)
	// query.Add("status", "88,89,90,114")
	query.Add("status__is_archived", "false")
	req.URL.RawQuery = query.Encode()

	req.Header.Set("Authorization", auth)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-disable-pagination", "false")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	err = json.Unmarshal(body, &userStories)
	if err != nil {
		return nil, err
	}

	return
}

func GetPoints(auth, projectId string) (points []models.Point, err error) {
	// auth := GetAuth()

	req, _ := http.NewRequest("GET", TaigaBaseURL+"/points", nil)

	query := req.URL.Query()
	query.Add("project", projectId)
	req.URL.RawQuery = query.Encode()

	req.Header.Set("Authorization", auth)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-disable-pagination", "false")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	err = json.Unmarshal(body, &points)
	if err != nil {
		return nil, err
	}

	return
}

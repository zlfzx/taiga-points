package clients

import (
	"encoding/json"
	"errors"
	"taiga-points/internal/models"
)

type TaigaClient struct {
	baseURL    string
	httpClient *HttpClient
}

func NewTaigaClient(baseURL string) *TaigaClient {
	return &TaigaClient{
		baseURL:    baseURL + "/api/v1",
		httpClient: NewHttpClient(),
	}
}

func getDefaultHeaders(authToken string) map[string]string {
	return map[string]string{
		"Authorization":        "Bearer " + authToken,
		"x-disable-pagination": "True",
	}
}

func (c *TaigaClient) Authenticate(authReq models.AuthRequest) (models.Auth, error) {

	payload := map[string]string{
		"type":     "normal",
		"username": authReq.Username,
		"password": authReq.Password,
	}
	body, _ := json.Marshal(payload)

	resp, err := c.httpClient.Post(c.baseURL+"/auth", nil, body)
	if err != nil {
		return models.Auth{}, err
	}

	var auth models.Auth
	if err := json.Unmarshal(resp, &auth); err != nil {
		return models.Auth{}, errors.New("failed to parse auth response")
	}

	return auth, nil
}

func (c *TaigaClient) RefreshAuth(authReq models.AuthRequest) (models.Auth, error) {

	payload := map[string]string{
		"refresh": authReq.Refresh,
	}
	body, _ := json.Marshal(payload)

	resp, err := c.httpClient.Post(c.baseURL+"/auth/refresh", nil, body)
	if err != nil {
		return models.Auth{}, err
	}

	var auth models.Auth
	if err := json.Unmarshal(resp, &auth); err != nil {
		return models.Auth{}, errors.New("failed to parse auth response")
	}

	return auth, nil
}

func (c *TaigaClient) GetProjects(authToken, memberID string) ([]models.Project, error) {

	headers := getDefaultHeaders(authToken)

	query := map[string]string{
		"member": memberID,
	}

	body, err := c.httpClient.Get(c.baseURL+"/projects", headers, query)
	if err != nil {
		return nil, err
	}

	var projects []models.Project
	if err := json.Unmarshal(body, &projects); err != nil {
		return nil, errors.New("failed to parse projects response")
	}

	return projects, nil
}

func (c *TaigaClient) GetProject(authToken, slug string) (models.Project, error) {

	headers := getDefaultHeaders(authToken)

	query := map[string]string{
		"slug": slug,
	}

	body, err := c.httpClient.Get(c.baseURL+"/projects/by_slug", headers, query)
	if err != nil {
		return models.Project{}, err
	}

	var project models.Project
	if err := json.Unmarshal(body, &project); err != nil {
		return models.Project{}, errors.New("failed to parse project response")
	}

	return project, nil
}

func (c *TaigaClient) GetMemberships(authToken, projectID string) ([]models.Membership, error) {

	headers := getDefaultHeaders(authToken)

	query := map[string]string{
		"project": projectID,
	}

	body, err := c.httpClient.Get(c.baseURL+"/memberships", headers, query)
	if err != nil {
		return nil, err
	}

	var members []models.Membership
	if err := json.Unmarshal(body, &members); err != nil {
		return nil, errors.New("failed to parse members response")
	}

	return members, nil
}

func (c *TaigaClient) GetMemberhip(authToken, memberID string) (models.Membership, error) {

	headers := getDefaultHeaders(authToken)

	body, err := c.httpClient.Get(c.baseURL+"/memberships/"+memberID, headers, nil)
	if err != nil {
		return models.Membership{}, err
	}

	var member models.Membership
	if err := json.Unmarshal(body, &member); err != nil {
		return models.Membership{}, errors.New("failed to parse member response")
	}

	return member, nil
}

func (c *TaigaClient) GetUserStories(authToken, projectID string) ([]models.UserStory, error) {

	headers := getDefaultHeaders(authToken)

	query := map[string]string{
		"project":             projectID,
		"status__is_archived": "false",
	}

	body, err := c.httpClient.Get(c.baseURL+"/userstories", headers, query)
	if err != nil {
		return nil, err
	}

	var userStories []models.UserStory
	if err := json.Unmarshal(body, &userStories); err != nil {
		return nil, errors.New("failed to parse user stories response")
	}

	return userStories, nil
}

func (c *TaigaClient) GetPoints(authToken, projectID string) ([]models.Point, error) {

	headers := getDefaultHeaders(authToken)

	query := map[string]string{
		"project": projectID,
	}

	body, err := c.httpClient.Get(c.baseURL+"/points", headers, query)
	if err != nil {
		return nil, err
	}

	var points []models.Point
	if err := json.Unmarshal(body, &points); err != nil {
		return nil, errors.New("failed to parse points response")
	}

	return points, nil
}

func (c *TaigaClient) GetMilestones(authToken string, projectID string) ([]models.Milestone, error) {

	headers := getDefaultHeaders(authToken)

	query := map[string]string{
		"project": projectID,
	}

	body, err := c.httpClient.Get(c.baseURL+"/milestones", headers, query)
	if err != nil {
		return nil, err
	}

	var milestones []models.Milestone
	if err := json.Unmarshal(body, &milestones); err != nil {
		return nil, errors.New("failed to parse milestones response")
	}

	return milestones, nil
}

func (c *TaigaClient) GetMilestone(authToken string, milestoneID string) (models.Milestone, error) {

	headers := getDefaultHeaders(authToken)

	body, err := c.httpClient.Get(c.baseURL+"/milestones/"+milestoneID, headers, nil)
	if err != nil {
		return models.Milestone{}, err
	}

	var milestone models.Milestone
	if err := json.Unmarshal(body, &milestone); err != nil {
		return models.Milestone{}, errors.New("failed to parse milestone response")
	}

	return milestone, nil
}

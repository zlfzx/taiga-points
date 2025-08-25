package services

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"taiga-points/internal/clients"
	"taiga-points/internal/models"
	"time"
)

type result[T any] struct {
	Data T
	Err  error
}

type TaigaService struct {
	baseURL string
	db      *sql.DB
	client  *clients.TaigaClient
}

func NewTaigaService(baseURL string, db *sql.DB) *TaigaService {
	return &TaigaService{
		baseURL: baseURL,
		db:      db,
		client:  clients.NewTaigaClient(baseURL),
	}
}

func (s *TaigaService) Authenticate(authReq models.AuthRequest) (models.Auth, error) {
	return s.client.Authenticate(authReq)
}

func (s *TaigaService) RefreshAuth(authReq models.AuthRequest) (models.Auth, error) {
	return s.client.RefreshAuth(authReq)
}

func (s *TaigaService) GetProjects(authToken, memberID string) ([]models.Project, error) {
	return s.client.GetProjects(authToken, memberID)
}

func (s *TaigaService) GetProject(authToken, slug string) (models.Project, error) {
	project, err := s.client.GetProject(authToken, slug)
	if err != nil {
		return models.Project{}, err
	}

	projectSetting, err := s.GetProjectSetting(strconv.Itoa(project.ID))
	if err != nil && err != sql.ErrNoRows {
		return models.Project{}, err
	}

	if projectSetting.ID != 0 {
		project.MaxPoints = projectSetting.MaxPoints
		project.RolePoints = projectSetting.RolePoints
		project.StatusPoints = projectSetting.StatusPoints
	}

	return project, nil
}

func (s *TaigaService) GetProjectSetting(projectID string) (models.ProjectSetting, error) {
	var project models.ProjectSetting
	var rolePointsStr, statusPointsStr string
	err := s.db.QueryRow(`
		SELECT 
			id, name, slug, max_points, role_points, status_points 
		FROM project_settings 
		WHERE id = ?
	`, projectID).Scan(
		&project.ID,
		&project.Name,
		&project.Slug,
		&project.MaxPoints,
		&rolePointsStr,
		&statusPointsStr,
	)

	if err != nil && err != sql.ErrNoRows {
		return models.ProjectSetting{}, err
	}

	// if err == sql.ErrNoRows {
	// 	return models.Project{}, &clients.HTTPError{
	// 		StatusCode: http.StatusNotFound,
	// 		Body:       "project settings not found",
	// 	}
	// }

	var rolePoints []int
	if rolePointsStr != "" {
		for _, rp := range strings.Split(rolePointsStr, ",") {
			if point, err := strconv.Atoi(strings.TrimSpace(rp)); err == nil {
				rolePoints = append(rolePoints, point)
			}
		}
	}
	project.RolePoints = rolePoints

	var statusPoints []int
	if statusPointsStr != "" {
		for _, sp := range strings.Split(statusPointsStr, ",") {
			if point, err := strconv.Atoi(strings.TrimSpace(sp)); err == nil {
				statusPoints = append(statusPoints, point)
			}
		}
	}
	project.StatusPoints = statusPoints

	return project, nil
}

func (s *TaigaService) SetProjectSettings(authToken string, projectSetting models.ProjectSettingRequest) (models.Project, error) {

	project, err := s.GetProject(authToken, projectSetting.ProjectSlug)
	if err != nil {
		return models.Project{}, err
	}

	if !project.IAmAdmin {
		return project, &clients.HTTPError{
			StatusCode: http.StatusForbidden,
			Body:       "you are not allowed to change project settings",
		}
	}

	// check if project exists in database
	projectIDstr := strconv.Itoa(project.ID)
	savedProject, err := s.GetProjectSetting(projectIDstr)
	if err != nil && err != sql.ErrNoRows {
		return models.Project{}, err
	}

	if savedProject.ID == 0 {
		// create new project settings
		_, err = s.db.Exec(`
			INSERT INTO project_settings (id, name, slug, max_points, role_points, status_points)
			VALUES (?, ?, ?, ?, ?, ?)
		`,
			project.ID,
			project.Name,
			project.Slug,
			projectSetting.MaxPoints,
			projectSetting.RolePoints,
			projectSetting.StatusPoints,
		)

		if err != nil {
			return models.Project{}, err
		}
	} else {
		// update existing project settings
		_, err = s.db.Exec(`
			UPDATE project_settings
			SET 
				max_points = ?, 
				role_points = ?,
				status_points = ?
			WHERE id = ?
		`,
			projectSetting.MaxPoints,
			projectSetting.RolePoints,
			projectSetting.StatusPoints,
			project.ID,
		)

		if err != nil {
			return models.Project{}, err
		}
	}

	// update project in memory
	project.MaxPoints = projectSetting.MaxPoints

	// parse role points "string" into []int
	rolePoints := make([]int, 0)
	if projectSetting.RolePoints != "" {
		for _, rp := range strings.Split(projectSetting.RolePoints, ",") {
			if point, err := strconv.Atoi(strings.TrimSpace(rp)); err == nil {
				rolePoints = append(rolePoints, point)
			}
		}
	}
	project.RolePoints = rolePoints

	// parse status points "string" into []int
	statusPoints := make([]int, 0)
	if projectSetting.StatusPoints != "" {
		for _, sp := range strings.Split(projectSetting.StatusPoints, ",") {
			if point, err := strconv.Atoi(strings.TrimSpace(sp)); err == nil {
				statusPoints = append(statusPoints, point)
			}
		}
	}
	project.StatusPoints = statusPoints

	return project, nil
}

func (s *TaigaService) GetMembers(authToken, projectID string) ([]models.Membership, error) {
	memberships, err := s.client.GetMemberships(authToken, projectID)

	// sort memberships by name
	// sort.Slice(memberships, func(i, j int) bool {
	// 	return memberships[i].FullName < memberships[j].FullName
	// })

	return memberships, err
}

func (s *TaigaService) GetMember(authToken, memberID string) (models.Membership, error) {
	member, err := s.client.GetMemberhip(authToken, memberID)
	if err != nil {
		return models.Membership{}, err
	}

	// set max point
	projectSetting, err := s.GetProjectSetting(strconv.Itoa(member.ProjectID))
	if err != nil && err != sql.ErrNoRows {
		return models.Membership{}, err
	}
	member.MaxPoint = projectSetting.MaxPoints
	member.RemainingPoint = member.MaxPoint

	projectId := strconv.Itoa(member.ProjectID)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pointsCh := make(chan result[[]models.Point], 1)
	userStoriesCh := make(chan result[[]models.UserStory], 1)

	// get points
	go func() {
		data, err := s.GetPoints(authToken, projectId)
		pointsCh <- result[[]models.Point]{Data: data, Err: err}
	}()

	// get user stories
	go func() {
		userStoryParams := models.UserStoryParams{
			ProjectID: projectId,
		}
		data, err := s.GetUserStories(authToken, userStoryParams)
		userStoriesCh <- result[[]models.UserStory]{Data: data, Err: err}
	}()

	var points []models.Point
	var userStories []models.UserStory
	received := 0

	for received < 2 {
		select {
		case <-ctx.Done():
			// responseJSON(w, r, models.HTTPResponse{
			// 	StatusCode: http.StatusRequestTimeout,
			// 	StatusText: "Request Timeout",
			// 	Message:    "Request took too long to process",
			// })
			return models.Membership{}, errors.New("request took too long to process")
		case res := <-pointsCh:
			if res.Err != nil {
				// responseJSON(w, r, models.HTTPResponse{
				// 	StatusCode: http.StatusInternalServerError,
				// 	StatusText: "Internal Server Error",
				// 	Message:    res.Err.Error(),
				// })
				return models.Membership{}, res.Err
			}
			points = res.Data
			received++
		case res := <-userStoriesCh:
			if res.Err != nil {
				// responseJSON(w, r, models.HTTPResponse{
				// 	StatusCode: http.StatusInternalServerError,
				// 	StatusText: "Internal Server Error",
				// 	Message:    res.Err.Error(),
				// })
				return models.Membership{}, res.Err
			}
			userStories = res.Data
			received++
		}
	}

	// initialize member's total point and stories
	member.Stories = make([]models.UserStory, 0)

	// create a map of points for quick lookup
	pointMap := make(map[int]float64)
	for _, point := range points {
		pointMap[point.ID] = point.Value
	}

	role := strconv.Itoa(member.RoleID)

	checkRolePoint := slices.Contains(projectSetting.RolePoints, member.RoleID)

	for _, userStory := range userStories {

		// check if user story is assigned to the member
		isAssigned := slices.Contains(userStory.AssignedUsers, member.UserID)
		if !isAssigned {
			continue // skip if user story is not assigned to the member
		}

		checkStatusPoint := slices.Contains(projectSetting.StatusPoints, userStory.Status)

		if checkRolePoint {
			// check if user story has points for the member's role
			if pointID, ok := userStory.Points[role]; ok {
				if pointValue, exists := pointMap[pointID]; exists {
					userStory.Point = pointValue

					// add point to member's total point based on user story status
					if checkStatusPoint {
						member.TotalPoint += pointValue

						// deduct point from member's remaining point
						member.RemainingPoint -= pointValue
					}
				}
			}
		}

		// append user story to member's stories
		member.Stories = append(member.Stories, userStory)
	}

	// calculate remaining point
	// member.RemainingPoint = member.MaxPoint - member.TotalPoint

	// sort member's stories by milestone (desc), then swimlane (asc), then status (asc), then ID (asc)
	slices.SortStableFunc(member.Stories, func(a, b models.UserStory) int {
		if a.Milestone != b.Milestone {
			return b.Milestone - a.Milestone // descending order
		}
		if a.Swimlane != b.Swimlane {
			return a.Swimlane - b.Swimlane
		}
		if a.Status != b.Status {
			return a.Status - b.Status
		}
		return b.ID - a.ID
	})

	return member, nil
}

func (s *TaigaService) GetUserStories(authToken string, params models.UserStoryParams) ([]models.UserStory, error) {
	userStories, err := s.client.GetUserStories(authToken, params)
	if err != nil {
		return nil, err
	}

	// set user story url
	for i := range userStories {
		userStories[i].URL = s.baseURL + "/project/" + userStories[i].ProjectExtraInfo.Slug + "/us/" + strconv.Itoa(userStories[i].Ref)
	}

	return userStories, nil
}

func (s *TaigaService) GetPoints(authToken, projectID string) ([]models.Point, error) {
	return s.client.GetPoints(authToken, projectID)
}

func (s *TaigaService) GetMilestones(authToken, projectID string) ([]models.Milestone, error) {
	return s.client.GetMilestones(authToken, projectID)
}

func (s *TaigaService) GetMilestone(authToken, milestoneID string) (models.Milestone, error) {
	milestone, err := s.client.GetMilestone(authToken, milestoneID)
	if err != nil {
		return models.Milestone{}, err
	}

	project, err := s.GetProject(authToken, milestone.ProjectExtraInfo.Slug)
	if err != nil {
		return models.Milestone{}, err
	}

	userStories, err := s.GetUserStories(authToken, models.UserStoryParams{
		ProjectID:   strconv.Itoa(milestone.Project),
		MilestoneID: milestoneID,
		IsArchived:  true,
	})
	if err != nil {
		return models.Milestone{}, err
	}

	// init count data
	countSwimlanes := make([]models.MilestoneCountData, 0)
	countTags := make([]models.MilestoneCountData, 0)

	countStatuses := make([]models.MilestoneCountData, 0)
	for _, status := range project.USStatuses {
		countStatuses = append(countStatuses, models.MilestoneCountData{
			Name:        status.Name,
			UserStory:   0,
			TotalPoints: 0,
		})
	}

	for _, us := range userStories {
		milestone.UserStories = append(milestone.UserStories, models.MilestoneUserStory{
			ID:      us.ID,
			Ref:     us.Ref,
			Subject: us.Subject,
			Status:  us.Status,
		})

		// count swimlanes
		swimlaneName := ""
		for _, swimlane := range project.Swimlanes {
			if us.Swimlane == swimlane.ID {
				swimlaneName = swimlane.Name
				break
			}
		}
		index := slices.IndexFunc(countSwimlanes, func(c models.MilestoneCountData) bool {
			return c.Name == swimlaneName
		})
		if index != -1 {
			countSwimlanes[index].UserStory++
			countSwimlanes[index].TotalPoints += us.TotalPoints
		} else {
			countSwimlanes = append(countSwimlanes, models.MilestoneCountData{
				Name:        swimlaneName,
				UserStory:   1,
				TotalPoints: us.TotalPoints,
			})
		}

		// count tags
		for _, tag := range us.Tags {
			index := slices.IndexFunc(countTags, func(c models.MilestoneCountData) bool {
				return c.Name == tag[0]
			})
			if index != -1 {
				countTags[index].UserStory++
				countTags[index].TotalPoints += us.TotalPoints
			} else {
				countTags = append(countTags, models.MilestoneCountData{
					Name:        tag[0],
					UserStory:   1,
					TotalPoints: us.TotalPoints,
				})
			}
		}

		// count statuses
		for i, status := range project.USStatuses {
			if us.Status == status.ID {
				countStatuses[i].UserStory++
				countStatuses[i].TotalPoints += us.TotalPoints
				break
			}
		}
	}

	milestone.CountSwimlanes = countSwimlanes
	milestone.CountTags = countTags
	milestone.CountStatuses = countStatuses

	return milestone, nil
}

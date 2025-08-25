package models

import "time"

type Milestone struct {
	ID               int                  `json:"id"`
	Project          int                  `json:"project"`
	Name             string               `json:"name"`
	Slug             string               `json:"slug"`
	Order            int                  `json:"order"`
	Owner            int                  `json:"owner"`
	Closed           bool                 `json:"closed"`
	ClosedPoints     float64              `json:"closed_points"`
	CreatedDate      time.Time            `json:"created_date"`
	Disponibility    float64              `json:"disponibility"`
	EstimatedFinish  string               `json:"estimated_finish"`
	EstimatedStart   string               `json:"estimated_start"`
	ModifiedDate     time.Time            `json:"modified_date"`
	TotalPoints      float64              `json:"total_points"`
	ProjectExtraInfo ProjectExtraInfo     `json:"project_extra_info"`
	UserStories      []MilestoneUserStory `json:"user_stories"`
	CountSwimlanes   []MilestoneCountData `json:"count_swimlanes"`
	CountTags        []MilestoneCountData `json:"count_tags"`
	CountStatuses    []MilestoneCountData `json:"count_statuses"`
}

type MilestoneCountData struct {
	Name        string  `json:"name"`
	UserStory   int     `json:"user_story"`
	TotalPoints float64 `json:"total_points"`
}

type MilestoneUserStory struct {
	AssignedTo          int `json:"assigned_to"`
	AssignedToExtraInfo struct {
		BigPhoto        string `json:"big_photo"`
		FullNameDisplay string `json:"full_name_display"`
		GravatarID      string `json:"gravatar_id"`
		ID              int    `json:"id"`
		IsActive        bool   `json:"is_active"`
		Photo           string `json:"photo"`
		Username        string `json:"username"`
	} `json:"assigned_to_extra_info"`
	BacklogOrder      int       `json:"backlog_order"`
	BlockedNote       string    `json:"blocked_note"`
	ClientRequirement bool      `json:"client_requirement"`
	CreatedDate       time.Time `json:"created_date"`
	DueDate           string    `json:"due_date"`
	DueDateReason     string    `json:"due_date_reason"`
	DueDateStatus     string    `json:"due_date_status"`
	Epics             []struct {
		Color   string `json:"color"`
		ID      int    `json:"id"`
		Project struct {
			ID   int    `json:"id"`
			Name string `json:"name"`
			Slug string `json:"slug"`
		} `json:"project"`
		Ref     int    `json:"ref"`
		Subject string `json:"subject"`
	} `json:"epics"`
	ExternalReference interface{}      `json:"external_reference"`
	FinishDate        interface{}      `json:"finish_date"`
	ID                int              `json:"id"`
	IsBlocked         bool             `json:"is_blocked"`
	IsClosed          bool             `json:"is_closed"`
	KanbanOrder       int              `json:"kanban_order"`
	Milestone         int              `json:"milestone"`
	ModifiedDate      time.Time        `json:"modified_date"`
	Points            map[string]int   `json:"points"`
	Project           int              `json:"project"`
	ProjectExtraInfo  ProjectExtraInfo `json:"project_extra_info"`
	Ref               int              `json:"ref"`
	SprintOrder       int              `json:"sprint_order"`
	Status            int              `json:"status"`
	StatusExtraInfo   StatusExtraInfo  `json:"status_extra_info"`
	Subject           string           `json:"subject"`
	TeamRequirement   bool             `json:"team_requirement"`
	TotalPoints       float64          `json:"total_points"`
	Version           int              `json:"version"`
}

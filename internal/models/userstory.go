package models

type UserStoryStatus struct {
	ID         int    `json:"id"`
	ProjectID  int    `json:"project"`
	Name       string `json:"name"`
	Color      string `json:"color"`
	Slug       string `json:"slug"`
	Order      int    `json:"order"`
	IsClosed   bool   `json:"is_closed"`
	IsArchived bool   `json:"is_archived"`
}

type UserStory struct {
	ID               int              `json:"id"`
	Ref              int              `json:"ref"`
	ProjectID        int              `json:"project"`
	Subject          string           `json:"subject"`
	Status           int              `json:"status"`
	StatusExtraInfo  StatusExtraInfo  `json:"status_extra_info"`
	Swimlane         int              `json:"swimlane"`
	Points           map[string]int   `json:"points"`
	Point            float64          `json:"point"`
	TotalPoints      float64          `json:"total_points"`
	IsClosed         bool             `json:"is_closed"`
	AssignedUsers    []int            `json:"assigned_users"`
	Milestone        int              `json:"milestone"`
	MilestoneName    string           `json:"milestone_name"`
	MilestoneSlug    string           `json:"milestone_slug"`
	URL              string           `json:"url"`
	ProjectExtraInfo ProjectExtraInfo `json:"project_extra_info"`
	Tags             [][]string       `json:"tags"`
}

type StatusExtraInfo struct {
	Name     string `json:"name"`
	Color    string `json:"color"`
	IsClosed bool   `json:"is_closed"`
}

// type UserStoryMember struct {
// 	ID        int    `json:"id"`
// 	Ref       int    `json:"ref"`
// 	ProjectID int    `json:"project"`
// 	Subject   string `json:"subject"`
// 	Status    int    `json:"status"`
// 	Swimlane  int    `json:"swimlane"`
// 	Point     int    `json:"point"`
// }

type UserStoryParams struct {
	ProjectID   string
	MilestoneID string
	IsArchived  bool
}

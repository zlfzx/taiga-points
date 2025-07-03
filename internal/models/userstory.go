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
	ID            int            `json:"id"`
	Ref           int            `json:"ref"`
	ProjectID     int            `json:"project"`
	Subject       string         `json:"subject"`
	Status        int            `json:"status"`
	Swimlane      int            `json:"swimlane"`
	Points        map[string]int `json:"points"`
	IsClosed      bool           `json:"is_closed"`
	AssignedUsers []int          `json:"assigned_users"`
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

package models

type Membership struct {
	ID              int    `json:"id"`
	UserID          int    `json:"user"`
	ProjectID       int    `json:"project"`
	RoleID          int    `json:"role"`
	RoleName        string `json:"role_name"`
	FullName        string `json:"full_name"`
	FullNameDisplay string `json:"full_name_display,omitempty"`
	Photo           string `json:"photo"`
	IsUserActive    bool   `json:"is_user_active"`
	// Stories           map[string]float64 `json:"stories"`
	Stories           []UserStory `json:"stories"`
	TodoStories       int         `json:"todo_stories"`
	InProgressStories int         `json:"in_progress_stories"`
	RemainingPoint    float64     `json:"remaining_point"`
	CompletedPoint    float64     `json:"completed_point"`
	TotalPoint        float64     `json:"total_point"`
	CreatedAt         string      `json:"created_at"`
}

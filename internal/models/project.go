package models

type Project struct {
	ID           int                `json:"id"`
	Name         string             `json:"name"`
	Slug         string             `json:"slug"`
	Description  string             `json:"description"`
	LogoSmallURL string             `json:"logo_small_url"`
	LogoBigURL   string             `json:"logo_big_url"`
	Roles        []Role             `json:"roles"`
	Points       []Point            `json:"points"`
	USStatuses   []UserStoryStatus  `json:"us_statuses"`
	Swimlanes    []Swimlane         `json:"swimlanes"`
	Milestones   []ProjectMilestone `json:"milestones"`
	IAmOwner     bool               `json:"i_am_owner"`
	IAmAdmin     bool               `json:"i_am_admin"`
	IAmMember    bool               `json:"i_am_member"`
	// Members      []ProjectMember `json:"members"`

	MaxPoints    float64 `json:"max_points"`
	RolePoints   []int   `json:"role_points"`
	StatusPoints []int   `json:"status_points"`
}

type Swimlane struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Order     int    `json:"order"`
	ProjectID int    `json:"project"`
}

type ProjectMilestone struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	Slug   string `json:"slug"`
	Closed bool   `json:"closed"`
}

type ProjectExtraInfo struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Slug         string `json:"slug"`
	LogoSmallURL string `json:"logo_small_url"`
}

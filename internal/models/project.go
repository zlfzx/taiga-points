package models

type Project struct {
	ID           int               `json:"id"`
	Name         string            `json:"name"`
	Slug         string            `json:"slug"`
	Description  string            `json:"description"`
	LogoSmallURL string            `json:"logo_small_url"`
	LogoBigURL   string            `json:"logo_big_url"`
	Roles        []Role            `json:"roles"`
	Points       []Point           `json:"points"`
	USStatuses   []UserStoryStatus `json:"us_statuses"`
	Swimlanes    []Swimlane        `json:"swimlanes"`
	// Members      []ProjectMember `json:"members"`
}

type Swimlane struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Order     int    `json:"order"`
	ProjectID int    `json:"project"`
}

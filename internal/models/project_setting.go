package models

type ProjectSettingRequest struct {
	ProjectSlug  string  `json:"slug"`
	MaxPoints    float64 `json:"max_points"`
	RolePoints   string  `json:"role_points"`
	StatusPoints string  `json:"status_points"`
}

type ProjectSetting struct {
	ID           int     `json:"id"`
	Name         string  `json:"name"`
	Slug         string  `json:"slug"`
	MaxPoints    float64 `json:"max_points"`
	RolePoints   []int   `json:"role_points"`
	StatusPoints []int   `json:"status_points"`
}

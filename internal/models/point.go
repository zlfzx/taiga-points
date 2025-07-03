package models

type Point struct {
	ID        int     `json:"id"`
	ProjectID int     `json:"project"`
	Name      string  `json:"name"`
	Value     float64 `json:"value"`
}

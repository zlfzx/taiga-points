package models

type Role struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	Slug       string `json:"slug"`
	ProjectID  int    `json:"project"`
	Order      int    `json:"order"`
	Computable bool   `json:"computable"`
}

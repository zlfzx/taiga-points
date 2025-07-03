package models

type Auth struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	FullName  string `json:"full_name"`
	Email     string `json:"email"`
	UUID      string `json:"uuid"`
	AuthToken string `json:"auth_token"`
	Refresh   string `json:"refresh"`
}

type AuthRefresh struct {
	AuthToken string `json:"auth_token"`
	Refresh   string `json:"refresh"`
}

type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Refresh  string `json:"refresh"`
}

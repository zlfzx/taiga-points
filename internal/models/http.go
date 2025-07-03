package models

type HTTPResponse struct {
	StatusCode int    `json:"status_code"`
	StatusText string `json:"status_text"`
	Data       any    `json:"data,omitempty"`
	Message    any    `json:"message,omitempty"`
}

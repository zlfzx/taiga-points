package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"taiga-points/internal/models"
)

var baseURL string

type TaigaService struct {
}

func InitTaigaService() *TaigaService {
	return &TaigaService{}
}

func (s *TaigaService) GetAuth(username, password string) (auth models.Auth, err error) {

	payload := map[string]string{
		"type":     "normal",
		"username": username,
		"password": password,
	}
	body, _ := json.Marshal(payload)

	resp, err := http.Post(baseURL+"/auth", "application/json", bytes.NewBuffer(body))
	if err != nil {
		return auth, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return auth, errors.New("invalid credentials")
	}

	return
}

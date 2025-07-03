package services

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
)

type HttpService struct {
}

func (s *HttpService) Get(url string, headers map[string]string, query map[string]string) ([]byte, error) {
	// Create a new HTTP request
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	// set headers
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	// set query parameters
	q := req.URL.Query()
	for key, value := range query {
		q.Add(key, value)
	}
	req.URL.RawQuery = q.Encode()

	// Create a new HTTP client and send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error: %s", body)
	}

	return body, nil
}

func (s *HttpService) Post(url string, headers map[string]string, body []byte) ([]byte, error) {
	// Create a new HTTP request
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return nil, err
	}

	// set headers
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	// set body
	req.Body = io.NopCloser(bytes.NewBuffer(body))

	// Create a new HTTP client and send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	body, err = io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error: %s", body)
	}

	return body, nil
}

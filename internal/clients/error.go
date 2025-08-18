package clients

import "fmt"

type HTTPError struct {
	StatusCode int
	Body       string
}

func (e *HTTPError) Error() string {
	return fmt.Sprintf("HTTP %d: %s", e.StatusCode, e.Body)
}

func IsHTTPErrorWithCode(err error, code int) bool {
	httpErr, ok := err.(*HTTPError)
	return ok && httpErr.StatusCode == code
}

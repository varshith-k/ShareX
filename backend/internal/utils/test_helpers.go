package utils

import (
	"net/http"
	"net/http/httptest"
)

// CreateTestRequest creates a new HTTP request
func CreateTestRequest(method, url string) *http.Request {
	req, _ := http.NewRequest(method, url, nil)
	return req
}

// CreateTestRecorder creates a response recorder
func CreateTestRecorder() *httptest.ResponseRecorder {
	return httptest.NewRecorder()
}

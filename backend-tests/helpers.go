package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

const testJWTSecret = "test-secret-key-for-testing-only"

// Helper to create authenticated request
func createAuthRequest(method, url string, body interface{}) *http.Request {
	var req *http.Request
	if body != nil {
		jsonBody, _ := json.Marshal(body)
		req = httptest.NewRequest(method, url, bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
	} else {
		req = httptest.NewRequest(method, url, nil)
	}

	// Create JWT token with proper secret from environment
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = testJWTSecret
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": float64(testUserID), // Use float64 as JWT library expects it
	})
	tokenString, _ := token.SignedString([]byte(secret))
	req.Header.Set("Authorization", "Bearer "+tokenString)

	return req
}

// Helper to create unauthenticated request
func createRequest(method, url string, body interface{}) *http.Request {
	var req *http.Request
	if body != nil {
		jsonBody, _ := json.Marshal(body)
		req = httptest.NewRequest(method, url, bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
	} else {
		req = httptest.NewRequest(method, url, nil)
	}
	return req
}

// Helper to execute request and get response
func executeRequest(router *gin.Engine, req *http.Request) *httptest.ResponseRecorder {
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	return recorder
}

// Helper to parse JSON response
func parseJSONResponse(t *testing.T, recorder *httptest.ResponseRecorder, target interface{}) {
	assert.Equal(t, http.StatusOK, recorder.Code)
	err := json.Unmarshal(recorder.Body.Bytes(), target)
	assert.NoError(t, err)
}

// Helper to check error response
func checkErrorResponse(t *testing.T, recorder *httptest.ResponseRecorder, expectedStatus int, expectedError string) {
	assert.Equal(t, expectedStatus, recorder.Code)
	var response map[string]interface{}
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	assert.NoError(t, err)
	if expectedError != "" {
		assert.Contains(t, response["error"], expectedError)
	}
}

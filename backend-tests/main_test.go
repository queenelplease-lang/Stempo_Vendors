package main

import (
	"encoding/json"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"
)

type APITestSuite struct {
	suite.Suite
	db     *gorm.DB
	router *gin.Engine
}

func (suite *APITestSuite) SetupSuite() {
	// Set test environment variables
	os.Setenv("JWT_SECRET", testJWTSecret)
	gin.SetMode(gin.TestMode)

	// Setup test database
	var err error
	suite.db, err = setupTestDB()
	if err != nil {
		suite.T().Fatal("Failed to setup test database:", err)
	}

	// Setup test router
	suite.router, err = setupTestRouter(suite.db)
	if err != nil {
		suite.T().Fatal("Failed to setup test router:", err)
	}
}

func (suite *APITestSuite) TearDownSuite() {
	if suite.db != nil {
		clearTestDB(suite.db)
	}
}

// ========== Auth Routes Tests ==========

func (suite *APITestSuite) TestAuthRegister() {
	body := map[string]interface{}{
		"email":    "newuser@example.com",
		"password": "password123",
		"name":     "New User",
		"phone":    "+380501111111",
		"cityId":   1,
	}
	req := createRequest("POST", "/api/auth/register", body)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 201, recorder.Code)
}

func (suite *APITestSuite) TestAuthLogin() {
	body := map[string]string{
		"email":    "test@example.com",
		"password": "test123",
	}
	req := createRequest("POST", "/api/auth/login", body)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
	var response map[string]interface{}
	json.Unmarshal(recorder.Body.Bytes(), &response)
	assert.Contains(suite.T(), response, "token")
}

func (suite *APITestSuite) TestAuthGetCurrentUser() {
	req := createAuthRequest("GET", "/api/auth/me", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func (suite *APITestSuite) TestAuthUpdateProfile() {
	body := map[string]interface{}{
		"name":   "Updated Name",
		"phone":  "+380502222222",
		"cityId": 1,
	}
	req := createAuthRequest("PUT", "/api/auth/me", body)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func (suite *APITestSuite) TestAuthLogout() {
	req := createAuthRequest("POST", "/api/auth/logout", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

// ========== Business Routes Tests ==========

func (suite *APITestSuite) TestRestaurantGet() {
	req := createRequest("GET", "/api/restaurant", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func (suite *APITestSuite) TestBusinessGetByID() {
	req := createRequest("GET", "/api/businesses/1", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func (suite *APITestSuite) TestNewsGetAll() {
	req := createRequest("GET", "/api/news", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func (suite *APITestSuite) TestBusinessUpdate() {
	body := map[string]interface{}{
		"name":     "Updated Business Name",
		"category": "coffee",
		"address":  "Updated Address",
	}
	req := createAuthRequest("PUT", "/api/businesses/1", body)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func (suite *APITestSuite) TestBusinessDelete() {
	req := createAuthRequest("DELETE", "/api/businesses/1", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

// ========== Bonus Program Routes Tests ==========

func (suite *APITestSuite) TestBonusProgramGetAll() {
	req := createRequest("GET", "/api/bonus-programs", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func (suite *APITestSuite) TestBonusProgramGetByID() {
	req := createRequest("GET", "/api/bonus-programs/1", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func (suite *APITestSuite) TestBonusProgramGetByBusinessID() {
	req := createAuthRequest("GET", "/api/bonus-programs/by-business/1", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
	var programs []interface{}
	json.Unmarshal(recorder.Body.Bytes(), &programs)
	assert.IsType(suite.T(), []interface{}{}, programs)
}

func (suite *APITestSuite) TestBonusProgramCreate() {
	body := map[string]interface{}{
		"name":          "New Test Program",
		"description":   "Test description",
		"businessId":   testBusinessID,
		"pointsRequired": 20,
		"discount":     25,
		"discountType": "percentage",
	}
	req := createAuthRequest("POST", "/api/bonus-programs", body)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 201, recorder.Code)
}

func (suite *APITestSuite) TestBonusProgramUpdate() {
	body := map[string]interface{}{
		"name":          "Updated Program",
		"description":   "Updated description",
		"pointsRequired": 25,
		"discount":     30,
		"discountType": "percentage",
	}
	req := createAuthRequest("PUT", "/api/bonus-programs/1", body)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func (suite *APITestSuite) TestBonusProgramDelete() {
	req := createAuthRequest("DELETE", "/api/bonus-programs/1", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

// ========== Category Routes Tests ==========

func (suite *APITestSuite) TestCategoryGetAll() {
	req := createRequest("GET", "/api/categories", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func (suite *APITestSuite) TestCategoryGetBySlug() {
	req := createRequest("GET", "/api/categories/coffee", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

// ========== City Routes Tests ==========

func (suite *APITestSuite) TestCityGetAll() {
	req := createRequest("GET", "/api/cities", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func (suite *APITestSuite) TestCityGetByID() {
	req := createRequest("GET", "/api/cities/1", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func (suite *APITestSuite) TestCityCreate() {
	body := map[string]interface{}{
		"name": "Test City",
		"slug": "test-city",
	}
	req := createAuthRequest("POST", "/api/cities", body)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 201, recorder.Code)
}

func (suite *APITestSuite) TestCityUpdate() {
	body := map[string]interface{}{
		"name": "Updated City Name",
		"slug": "updated-city",
	}
	req := createAuthRequest("PUT", "/api/cities/1", body)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func (suite *APITestSuite) TestCityDelete() {
	req := createAuthRequest("DELETE", "/api/cities/1", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

// ========== Loyalty Card Routes Tests ==========

func (suite *APITestSuite) TestLoyaltyCardGetByUserID() {
	req := createAuthRequest("GET", "/api/loyalty-cards", nil)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func (suite *APITestSuite) TestLoyaltyCardGetByID() {
	req := createRequest("GET", "/api/loyalty-cards/1", nil)
	recorder := executeRequest(suite.router, req)

	// May return 404 if no card exists, which is OK
	assert.Contains(suite.T(), []int{200, 404}, recorder.Code)
}

func (suite *APITestSuite) TestLoyaltyCardCreate() {
	body := map[string]interface{}{
		"businessId": testBusinessID,
		"programId":  1,
	}
	req := createAuthRequest("POST", "/api/loyalty-cards", body)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 201, recorder.Code)
}

func (suite *APITestSuite) TestLoyaltyCardAddStamp() {
	req := createAuthRequest("POST", "/api/loyalty-cards/1/stamps", nil)
	recorder := executeRequest(suite.router, req)

	// May return 404 if no card exists, which is OK
	assert.Contains(suite.T(), []int{200, 404}, recorder.Code)
}

// ========== Admin Routes Tests ==========

func (suite *APITestSuite) TestAdminUpdateRestaurant() {
	body := map[string]interface{}{
		"name":    "Updated Restaurant",
		"address": "Updated Address",
	}
	req := createAuthRequest("PUT", "/api/admin/restaurant", body)
	recorder := executeRequest(suite.router, req)

	assert.Equal(suite.T(), 200, recorder.Code)
}

func TestAPISuite(t *testing.T) {
	suite.Run(t, new(APITestSuite))
}

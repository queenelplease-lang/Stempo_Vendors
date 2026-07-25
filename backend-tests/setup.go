package main

import (
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/stempo/backend/internal/delivery/http"
	"github.com/stempo/backend/internal/infrastructure/database"
	"github.com/stempo/backend/internal/infrastructure/email"
	"github.com/stempo/backend/internal/infrastructure/oauth"
	"github.com/stempo/backend/internal/repository/postgres"
	"github.com/stempo/backend/internal/usecase"
	postgresDriver "gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	testDB         *gorm.DB
	testRouter     *gin.Engine
	testAuthToken  string
	testUserID     uint = 1
	testBusinessID uint = 1
)

func setupTestDB() (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_USER", "stempo_test"),
		getEnv("DB_PASSWORD", "stempo_test_password"),
		getEnv("DB_NAME", "stempo_test_db"),
		getEnv("DB_PORT", "5433"),
	)

	db, err := gorm.Open(postgresDriver.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to test database: %w", err)
	}

	if err := database.Migrate(db); err != nil {
		return nil, fmt.Errorf("failed to migrate test database: %w", err)
	}

	if err := clearTestDB(db); err != nil {
		return nil, fmt.Errorf("failed to clear test database: %w", err)
	}

	if err := seedTestData(db); err != nil {
		return nil, fmt.Errorf("failed to seed test data: %w", err)
	}

	return db, nil
}

func setupTestRouter(db *gorm.DB) (*gin.Engine, error) {
	userRepo := postgres.NewUserRepository(db)
	businessRepo := postgres.NewBusinessRepository(db)
	programRepo := postgres.NewBonusProgramRepository(db)
	cardRepo := postgres.NewLoyaltyCardRepository(db)
	categoryRepo := postgres.NewCategoryRepository(db)
	cityRepo := postgres.NewCityRepository(db)
	employeeRepo := postgres.NewEmployeeRepository(db)
	redemptionRepo := postgres.NewBonusRedemptionRepository(db)
	qrCodeRepo := postgres.NewQRCodeRepository(db)
	newsRepo := postgres.NewNewsRepository(db)

	authUsecase := usecase.NewAuthUsecase(userRepo, oauth.NewGoogleTokenVerifier())
	businessUsecase := usecase.NewBusinessUsecase(businessRepo)
	programUsecase := usecase.NewBonusProgramUsecase(programRepo, businessRepo)
	employeeUsecase := usecase.NewEmployeeUsecase(employeeRepo, businessRepo, userRepo, email.NewMailjetService())
	cardUsecase := usecase.NewLoyaltyCardUsecase(cardRepo, businessRepo, employeeUsecase)
	redemptionUsecase := usecase.NewBonusRedemptionUsecase(redemptionRepo, cardRepo, businessRepo, employeeUsecase)
	categoryUsecase := usecase.NewCategoryUsecase(categoryRepo)
	cityUsecase := usecase.NewCityUsecase(cityRepo)
	qrCodeUsecase := usecase.NewQRCodeUsecase(qrCodeRepo, programRepo, businessRepo)
	newsUsecase := usecase.NewNewsUsecase(newsRepo)

	router := http.SetupRouter(
		authUsecase,
		businessUsecase,
		programUsecase,
		cardUsecase,
		categoryUsecase,
		cityUsecase,
		employeeUsecase,
		redemptionUsecase,
		qrCodeUsecase,
		newsUsecase,
	)

	return router, nil
}

func clearTestDB(db *gorm.DB) error {
	tables := []string{
		"news",
		"loyalty_cards",
		"bonus_programs",
		"businesses",
		"users",
		"cities",
		"categories",
	}

	for _, table := range tables {
		if err := db.Exec(fmt.Sprintf("TRUNCATE TABLE %s CASCADE", table)).Error; err != nil {
			return fmt.Errorf("failed to truncate table %s: %w", table, err)
		}
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

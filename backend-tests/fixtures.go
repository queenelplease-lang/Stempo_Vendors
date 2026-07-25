package main

import (
	"time"

	"github.com/stempo/backend/internal/domain/entity"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func seedTestData(db *gorm.DB) error {
	// Seed cities
	kyivLat := 50.4501
	kyivLng := 30.5234
	cities := []entity.City{
		{Name: "Київ", Slug: "kyiv", Latitude: &kyivLat, Longitude: &kyivLng},
		{Name: "Львів", Slug: "lviv"},
	}
	for i := range cities {
		cities[i].CreatedAt = time.Now()
		cities[i].UpdatedAt = time.Now()
		if err := db.Create(&cities[i]).Error; err != nil {
			return err
		}
	}

	// Seed categories
	categories := []entity.Category{
		{Name: "Coffee", Slug: "coffee", Icon: "☕", IconColor: "#8B5CF6"},
		{Name: "Sports", Slug: "sports", Icon: "💪", IconColor: "#EF4444"},
		{Name: "Food", Slug: "food", Icon: "🍝", IconColor: "#F59E0B"},
	}
	for i := range categories {
		categories[i].CreatedAt = time.Now()
		categories[i].UpdatedAt = time.Now()
		if err := db.Create(&categories[i]).Error; err != nil {
			return err
		}
	}

	// Seed test user
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("test123"), bcrypt.DefaultCost)
	testUser := entity.User{
		Email:    "test@example.com",
		Password: string(hashedPassword),
		Name:     stringPtr("Test User"),
		Phone:    stringPtr("+380501234567"),
		CityID:   &cities[0].ID,
	}
	testUser.CreatedAt = time.Now()
	testUser.UpdatedAt = time.Now()
	if err := db.Create(&testUser).Error; err != nil {
		return err
	}
	testUserID = testUser.ID

	// Seed test business
	testBusiness := entity.Business{
		Name:            "Test Business",
		Category:        "coffee",
		Address:         "Test Address 123",
		Rating:          4.5,
		IsOpen:          true,
		HasLoyaltyProgram: true,
		Featured:        false,
		Status:          entity.BusinessStatusApproved,
		OwnerID:         testUser.ID,
		Icon:            "☕",
		IconColor:       "#8B5CF6",
	}
	testBusiness.CreatedAt = time.Now()
	testBusiness.UpdatedAt = time.Now()
	if err := db.Create(&testBusiness).Error; err != nil {
		return err
	}
	testBusinessID = testBusiness.ID

	// Seed test bonus programs
	programs := []entity.BonusProgram{
		{
			Name:          "Test Program 1",
			Description:   "Test description 1",
			BusinessID:    testBusiness.ID,
			PointsRequired: 10,
			Discount:      20,
			DiscountType: "percentage",
			Status:        entity.BonusProgramStatusPending,
		},
		{
			Name:          "Test Program 2",
			Description:   "Test description 2",
			BusinessID:    testBusiness.ID,
			PointsRequired: 15,
			Discount:      30,
			DiscountType: "percentage",
			Status:        entity.BonusProgramStatusApproved,
		},
	}
	for i := range programs {
		programs[i].CreatedAt = time.Now()
		programs[i].UpdatedAt = time.Now()
		if err := db.Create(&programs[i]).Error; err != nil {
			return err
		}
	}

	return nil
}

func stringPtr(s string) *string {
	return &s
}

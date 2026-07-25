package entity

import "time"

type News struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Title       string     `gorm:"not null" json:"title"`
	Content     string     `gorm:"type:text;not null" json:"content"`
	ImageURL    *string    `json:"imageUrl,omitempty"`
	Published   bool       `gorm:"default:false;index" json:"published"`
	PublishedAt *time.Time `json:"publishedAt,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

func (News) TableName() string {
	return "news"
}

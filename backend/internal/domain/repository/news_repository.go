package repository

import "github.com/stempo/backend/internal/domain/entity"

type NewsRepository interface {
	Create(news *entity.News) error
	FindByID(id uint) (*entity.News, error)
	FindAll(page, pageSize int, publishedOnly bool) ([]entity.News, int64, error)
	Update(news *entity.News) error
	Delete(id uint) error
}

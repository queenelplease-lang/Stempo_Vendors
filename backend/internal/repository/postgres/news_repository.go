package postgres

import (
	"github.com/stempo/backend/internal/domain/entity"
	"github.com/stempo/backend/internal/domain/repository"
	"gorm.io/gorm"
)

type newsRepository struct {
	db *gorm.DB
}

func NewNewsRepository(db *gorm.DB) repository.NewsRepository {
	return &newsRepository{db: db}
}

func (r *newsRepository) Create(news *entity.News) error {
	return r.db.Create(news).Error
}

func (r *newsRepository) FindByID(id uint) (*entity.News, error) {
	var news entity.News
	err := r.db.First(&news, id).Error
	if err != nil {
		return nil, err
	}
	return &news, nil
}

func (r *newsRepository) FindAll(page, pageSize int, publishedOnly bool) ([]entity.News, int64, error) {
	var items []entity.News
	var total int64

	offset := (page - 1) * pageSize
	query := r.db.Model(&entity.News{})
	if publishedOnly {
		query = query.Where("published = ?", true)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	listQuery := r.db.Model(&entity.News{})
	if publishedOnly {
		listQuery = listQuery.Where("published = ?", true)
	}

	err := listQuery.Offset(offset).Limit(pageSize).Order("COALESCE(published_at, created_at) DESC").Find(&items).Error
	return items, total, err
}

func (r *newsRepository) Update(news *entity.News) error {
	return r.db.Save(news).Error
}

func (r *newsRepository) Delete(id uint) error {
	return r.db.Delete(&entity.News{}, id).Error
}

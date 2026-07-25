package usecase

import (
	"errors"
	"time"

	"github.com/stempo/backend/internal/domain/entity"
	"github.com/stempo/backend/internal/domain/repository"
)

type NewsUsecase interface {
	Create(title, content string, imageURL *string, published bool) (*entity.News, error)
	GetByID(id uint) (*entity.News, error)
	GetAll(page, pageSize int, publishedOnly bool) ([]entity.News, int64, error)
	Update(id uint, title, content string, imageURL *string, published *bool) (*entity.News, error)
	Delete(id uint) error
}

type newsUsecase struct {
	newsRepo repository.NewsRepository
}

func NewNewsUsecase(newsRepo repository.NewsRepository) NewsUsecase {
	return &newsUsecase{newsRepo: newsRepo}
}

func (u *newsUsecase) Create(title, content string, imageURL *string, published bool) (*entity.News, error) {
	if title == "" {
		return nil, errors.New("title is required")
	}
	if content == "" {
		return nil, errors.New("content is required")
	}

	news := &entity.News{
		Title:     title,
		Content:   content,
		ImageURL:  imageURL,
		Published: published,
	}
	if published {
		now := time.Now().UTC()
		news.PublishedAt = &now
	}

	if err := u.newsRepo.Create(news); err != nil {
		return nil, err
	}
	return news, nil
}

func (u *newsUsecase) GetByID(id uint) (*entity.News, error) {
	return u.newsRepo.FindByID(id)
}

func (u *newsUsecase) GetAll(page, pageSize int, publishedOnly bool) ([]entity.News, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	return u.newsRepo.FindAll(page, pageSize, publishedOnly)
}

func (u *newsUsecase) Update(id uint, title, content string, imageURL *string, published *bool) (*entity.News, error) {
	news, err := u.newsRepo.FindByID(id)
	if err != nil || news == nil {
		return nil, errors.New("news not found")
	}

	if title != "" {
		news.Title = title
	}
	if content != "" {
		news.Content = content
	}
	if imageURL != nil {
		if *imageURL == "" {
			news.ImageURL = nil
		} else {
			news.ImageURL = imageURL
		}
	}
	if published != nil {
		wasPublished := news.Published
		news.Published = *published
		if *published && !wasPublished {
			now := time.Now().UTC()
			news.PublishedAt = &now
		}
		if !*published {
			news.PublishedAt = nil
		}
	}

	if err := u.newsRepo.Update(news); err != nil {
		return nil, err
	}
	return news, nil
}

func (u *newsUsecase) Delete(id uint) error {
	news, err := u.newsRepo.FindByID(id)
	if err != nil || news == nil {
		return errors.New("news not found")
	}
	return u.newsRepo.Delete(id)
}

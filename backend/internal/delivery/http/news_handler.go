package http

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/stempo/backend/internal/usecase"
)

type NewsHandler struct {
	newsUsecase usecase.NewsUsecase
}

func NewNewsHandler(newsUsecase usecase.NewsUsecase) *NewsHandler {
	return &NewsHandler{newsUsecase: newsUsecase}
}

func (h *NewsHandler) GetAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	publishedOnly := c.Query("all") != "true"

	items, total, err := h.newsUsecase.GetAll(page, pageSize, publishedOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"items":    items,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func (h *NewsHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	news, err := h.newsUsecase.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "news not found"})
		return
	}

	c.JSON(http.StatusOK, news)
}

type CreateNewsRequest struct {
	Title     string  `json:"title" binding:"required"`
	Content   string  `json:"content" binding:"required"`
	ImageURL  *string `json:"imageUrl,omitempty"`
	Published bool    `json:"published"`
}

func (h *NewsHandler) Create(c *gin.Context) {
	var req CreateNewsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	news, err := h.newsUsecase.Create(req.Title, req.Content, req.ImageURL, req.Published)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, news)
}

type UpdateNewsRequest struct {
	Title     string  `json:"title,omitempty"`
	Content   string  `json:"content,omitempty"`
	ImageURL  *string `json:"imageUrl,omitempty"`
	Published *bool   `json:"published,omitempty"`
}

func (h *NewsHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req UpdateNewsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	news, err := h.newsUsecase.Update(uint(id), req.Title, req.Content, req.ImageURL, req.Published)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, news)
}

func (h *NewsHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.newsUsecase.Delete(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "news deleted successfully"})
}

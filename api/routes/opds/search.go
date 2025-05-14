package opds

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Search(db *gorm.DB, c *gin.Context) {
	size := c.Query("size")
	if size == "" {
		size = "10"
	}
	from := c.Query("from")
	if from == "" {
		from = "0"
	}

	sizeInt, err := strconv.Atoi(size)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid size parameter"})
		return
	}
	fromInt, err := strconv.Atoi(from)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid from parameter"})
		return
	}

	id := c.Query("id")
	if id != "" {
		getBookByID(db, c, id)
		return
	}

	q := c.Query("query")
	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query required"})
		return
	}
	pattern := "%" + strings.TrimSpace(q) + "%"
	var comics []models.Comic
	db.
		Preload("Authors").
		Preload("Tags").
		Preload("Series").
		Joins("JOIN series ON series.id = comics.series_id").
		Joins("JOIN comic_authors ON comic_authors.comic_id = comics.id").
		Joins("JOIN authors ON authors.id = comic_authors.author_id").
		Limit(sizeInt).
		Offset(fromInt).
		Order("series.name ASC").
		Order("series_position ASC").
		Order("title ASC").
		Where("title LIKE ? OR authors.name LIKE ?", pattern, pattern).
		Group("comics.id").
		Find(&comics)

	var total int64
	db.
		Joins("JOIN comic_authors ON comic_authors.comic_id = comics.id").
		Joins("JOIN authors ON authors.id = comic_authors.author_id").
		Where("title LIKE ? OR authors.name LIKE ?", pattern, pattern).
		Model(&models.Comic{}).
		Distinct("comics.id").
		Count(&total)

	publications := make([]gin.H, len(comics))
	for i, comic := range comics {
		publications[i] = BuildOPDSPublication(comic)
	}

	c.JSON(http.StatusOK, gin.H{
		"metadata": gin.H{
			"title": "Search: " + q,
			"total": total,
			"size":  sizeInt,
			"from":  fromInt,
		},
		"publications": publications,
	})
}

func getBookByID(db *gorm.DB, c *gin.Context, id string) {
	var comic models.Comic
	if err := db.
		Preload("Authors").
		Preload("Tags").
		Where("identifier = ?", id).
		First(&comic).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Comic not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}
	publication := BuildOPDSPublication(comic)
	c.JSON(http.StatusOK, gin.H{
		"metadata": gin.H{
			"title": comic.Title,
			"total": 1,
			"size":  1,
			"from":  0,
		},
		"publications": []gin.H{publication},
	})
}

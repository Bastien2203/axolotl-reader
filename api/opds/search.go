package opds

import (
	"net/http"
	"strings"

	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Search(db *gorm.DB, c *gin.Context) {
	q := c.Query("query")
	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query required"})
		return
	}
	pattern := "%" + strings.TrimSpace(q) + "%"
	var comics []models.Comic
	db.
		Where("title LIKE ? OR author LIKE ?", pattern, pattern).
		Find(&comics)

	// Réutilise la même structure de publications que Catalog
	publications := make([]gin.H, len(comics))
	for i, comic := range comics {
		publications[i] = gin.H{
			"metadata": gin.H{
				"title":      comic.Title,
				"author":     []gin.H{{"name": comic.Author}},
				"identifier": comic.Identifier,
			},
			"links": []gin.H{
				{"rel": "cover", "href": comic.CoverURL, "type": "image/jpeg"},
				{"rel": "acquisition", "href": comic.FileURL, "type": "application/x-cbr"},
			},
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"metadata":     gin.H{"title": "Search: " + q},
		"publications": publications,
	})
}

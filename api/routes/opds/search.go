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

	publications := make([]gin.H, len(comics))
	for i, comic := range comics {
		publications[i] = BuildOPDSPublication(comic)
	}

	c.JSON(http.StatusOK, gin.H{
		"metadata":     gin.H{"title": "Search: " + q},
		"publications": publications,
	})
}

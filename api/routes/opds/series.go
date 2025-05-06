package opds

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Series(db *gorm.DB, c *gin.Context) {
	seriesName := c.Param("name")

	var comics []models.Comic
	db.Where("series_name = ?", seriesName).
		Order("series_position ASC").
		Find(&comics)

	publications := make([]gin.H, len(comics))
	for i, comic := range comics {
		publications[i] = BuildOPDSPublication(comic)
	}

	c.JSON(http.StatusOK, gin.H{
		"metadata":     gin.H{"title": "Series: " + seriesName},
		"publications": publications,
	})
}

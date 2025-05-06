package opds

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Facets(db *gorm.DB, c *gin.Context) {
	var authors []string
	db.Model(&models.Comic{}).
		Distinct().
		Pluck("author", &authors)

	var series []string
	db.Model(&models.Comic{}).
		Distinct().
		Where("series_name != ''").
		Where("series_name IS NOT NULL").
		Pluck("series_name", &series)

	c.JSON(http.StatusOK, gin.H{
		"metadata": gin.H{"title": "Facets"},
		"facets": gin.H{
			"authors": authors,
			"series":  series,
		},
	})
}

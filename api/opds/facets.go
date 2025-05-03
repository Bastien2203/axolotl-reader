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

	c.JSON(http.StatusOK, gin.H{
		"metadata": gin.H{"title": "Facets"},
		"facets": gin.H{
			"author": authors,
		},
	})
}

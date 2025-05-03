package opds

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Catalog(db *gorm.DB, c *gin.Context) {
	var comics []models.Comic
	db.Find(&comics)

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
		"metadata": gin.H{"title": "Comics Catalog"},
		"links": []gin.H{
			{"rel": "self", "href": "/opds/catalog.json", "type": "application/opds+json"},
		},
		"publications": publications,
	})
}

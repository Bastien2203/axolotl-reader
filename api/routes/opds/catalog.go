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
		publications[i] = BuildOPDSPublication(comic)
	}

	links := []gin.H{
		{"rel": "self", "href": "/opds/catalog.json", "type": "application/opds+json"},
	}

	var series []string
	db.Model(&models.Comic{}).Distinct().Pluck("series_name", &series)

	for _, name := range series {
		if name == "" {
			continue
		}
		links = append(links, gin.H{
			"rel":   "collection",
			"href":  "/opds/series/" + name + ".json",
			"title": name,
			"type":  "application/opds+json",
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"metadata":     gin.H{"title": "Books Catalog"},
		"links":        links,
		"publications": publications,
	})
}

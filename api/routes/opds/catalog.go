package opds

import (
	"net/http"
	"strconv"

	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Catalog(db *gorm.DB, c *gin.Context) {

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

	var comics []models.Comic
	db.
		Limit(sizeInt).
		Offset(fromInt).
		Preload("Series").
		Preload("Authors").
		Preload("Tags").
		Joins("JOIN series ON series.id = comics.series_id").
		Order("series.name ASC").
		Order("series_position ASC").
		Order("title ASC").
		Find(&comics)

	var total int64
	db.Model(&models.Comic{}).Count(&total)

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
		"metadata": gin.H{
			"title": "Books Catalog",
			"total": total,
			"size":  sizeInt,
			"from":  fromInt,
		},
		"links":        links,
		"publications": publications,
	})
}

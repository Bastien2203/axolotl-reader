package opds

import (
	"fmt"
	"net/http"

	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Facets(db *gorm.DB, c *gin.Context) {
	filters := make(map[string]interface{})
	if v := c.Query("authors"); v != "" {
		filters["authors"] = v
	}
	if v := c.Query("series"); v != "" {
		fmt.Println("series", v)
		filters["series"] = v
	}
	if v := c.Query("tags"); v != "" {
		filters["tags"] = v
	}

	facets := make(map[string]any)

	if len(filters) == 0 || filters["authors"] != nil {
		var authors []string
		db.Model(&models.Author{}).Distinct().Pluck("name", &authors)
		facets["authors"] = authors
	}

	if len(filters) == 0 || filters["series"] != nil {
		var series []models.Series
		db.Model(&models.Series{}).Preload("Tags").Find(&series)

		var result []map[string]interface{}
		for _, s := range series {
			// first comic of the series
			var comic models.Comic
			db.Model(&models.Comic{}).Where("series_id = ? AND series_position = 1", s.ID).Select("cover_url").First(&comic)

			// get tags names
			var tags []map[string]any
			for _, tag := range s.Tags {
				tags = append(tags, map[string]any{
					"name": tag.Name,
				})
			}

			result = append(result, map[string]interface{}{
				"id":    s.ID,
				"name":  s.Name,
				"cover": comic.CoverURL,
				"tags":  tags,
			})
		}
		facets["series"] = result
	}

	if len(filters) == 0 || filters["tags"] != nil {
		var tags []string
		db.Model(&models.Tag{}).Distinct().Pluck("name", &tags)
		facets["tags"] = tags
	}

	c.JSON(http.StatusOK, gin.H{
		"metadata": gin.H{"title": "Facets"},
		"facets":   facets,
	})
}

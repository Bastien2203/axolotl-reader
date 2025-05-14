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
		db.Model(&models.Series{}).Select("id", "name").Find(&series)

		var result []map[string]interface{}
		for _, s := range series {
			result = append(result, map[string]interface{}{
				"id":   s.ID,
				"name": s.Name,
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

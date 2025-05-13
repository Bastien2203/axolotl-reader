package opds

import (
	"fmt"
	"net/http"

	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Facets(db *gorm.DB, c *gin.Context) {
	var all = make(map[string]interface{})
	if c.Query("authors") != "" {
		all["authors"] = c.Query("authors")
	}

	if c.Query("series") != "" {
		fmt.Println("series", c.Query("series"))
		all["series"] = c.Query("series")
	}
	if c.Query("tags") != "" {
		all["tags"] = c.Query("tags")
	}

	var authors []string
	var series []string
	var tags []string

	facets := make(map[string]any)
	fmt.Println("all", all)

	if len(all) == 0 || all["authors"] != nil {
		db.Model(&models.Comic{}).
			Distinct().
			Pluck("author", &authors)
		facets["authors"] = authors
	}

	if len(all) == 0 || all["series"] != nil {
		db.Model(&models.Comic{}).
			Distinct().
			Where("series_name != ''").
			Where("series_name IS NOT NULL").
			Pluck("series_name", &series)
		facets["series"] = series
	}

	if len(all) == 0 || all["tags"] != nil {
		db.Model(&models.Comic{}).
			Distinct().
			Where("tag != ''").
			Where("tag IS NOT NULL").
			Pluck("tag", &tags)
		facets["tags"] = tags
	}

	c.JSON(http.StatusOK, gin.H{
		"metadata": gin.H{"title": "Facets"},
		"facets":   facets,
	})
}

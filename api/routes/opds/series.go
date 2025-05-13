package opds

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetSeries(db *gorm.DB, c *gin.Context) {
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

	seriesName := strings.TrimSuffix(c.Param("name"), ".json")
	fmt.Println("Series name:", seriesName)

	var comics []models.Comic
	db.
		Limit(sizeInt).
		Offset(fromInt).
		Where("series_name = ?", seriesName).
		Order("series_position ASC").
		Preload("Authors").
		Preload("Tags").
		Find(&comics)

	var total int64
	db.Model(&models.Comic{}).
		Where("series_name = ?", seriesName).
		Count(&total)

	publications := make([]gin.H, len(comics))
	for i, comic := range comics {
		publications[i] = BuildOPDSPublication(comic)
	}

	c.JSON(http.StatusOK, gin.H{
		"metadata": gin.H{
			"title": "Series: " + seriesName,
			"total": total,
			"size":  sizeInt,
			"from":  fromInt,
		},
		"publications": publications,
	})
}

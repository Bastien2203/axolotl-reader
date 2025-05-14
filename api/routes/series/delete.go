package series

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/models"
	"github.com/Bastien2203/comics-reader/routes/books"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Delete(db *gorm.DB, c *gin.Context) {
	id := c.Param("id")

	// Check if the comic exists
	var series models.Series
	if err := db.Where("id = ?", id).First(&series).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "series not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	// delete all comics in the series
	var comics []models.Comic
	if err := db.Where("series_id = ?", id).Find(&comics).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	for _, comic := range comics {
		books.DeleteComic(comic, db, c)
	}

	// delete the series
	if err := db.Delete(&series).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	c.Status(http.StatusNoContent)
}

package series

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/jobs"
	"github.com/Bastien2203/comics-reader/logs"
	"github.com/Bastien2203/comics-reader/models"
	"github.com/Bastien2203/comics-reader/repositories"
	"github.com/Bastien2203/comics-reader/routes/books"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
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
		logs.Logger.Error("failed to find series", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	// delete all comics in the series
	var comics []models.Comic
	if err := db.Where("series_id = ?", id).Find(&comics).Error; err != nil {
		logs.Logger.Error("failed to find comics", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	for _, comic := range comics {
		books.DeleteComic(comic, db, c)
	}

	// delete the series
	if err := db.Delete(&series).Error; err != nil {
		logs.Logger.Error("failed to delete series", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	jobs.Queue.Submit(&jobs.GenerateOPDSFeedJob{
		Repository: repositories.Repository{DB: db},
	})

	c.Status(http.StatusNoContent)
}

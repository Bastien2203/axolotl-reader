package series_routes

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/logs"
	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func All(db *gorm.DB, c *gin.Context) {
	var series []models.Series
	if err := db.Find(&series).Error; err != nil {
		logs.Logger.Error("failed to find series", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	c.JSON(http.StatusOK, series)
}

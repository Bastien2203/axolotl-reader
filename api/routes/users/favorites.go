package users

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/logs"
	"github.com/Bastien2203/comics-reader/models"
	opds_v2 "github.com/Bastien2203/comics-reader/opds/v2"
	"github.com/Bastien2203/comics-reader/repositories"
	route_utils "github.com/Bastien2203/comics-reader/routes/utils"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func AddFavoriteSeries(db *gorm.DB, c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Check if the series exists
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

	// Check if the user exists
	var user models.User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		logs.Logger.Error("failed to find user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	// Add the series to the user's favorite series
	if err := db.Model(&user).Association("FavoriteSeries").Append(&series); err != nil {
		logs.Logger.Error("failed to add series to favorites", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "series added to favorites"})
}

func RemoveFavoriteSeries(db *gorm.DB, c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Check if the series exists
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

	// Check if the user exists
	var user models.User
	if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		logs.Logger.Error("failed to find user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	// Remove the series from the user's favorite series
	if err := db.Model(&user).Association("FavoriteSeries").Delete(&series); err != nil {
		logs.Logger.Error("failed to remove series from favorites", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "series removed from favorites"})
}

func GetFavoriteSeries(db *gorm.DB, c *gin.Context) {
	page := route_utils.Page(c)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var user models.User
	if err := db.
		Preload("FavoriteSeries", func(db *gorm.DB) *gorm.DB {
			return db.
				Limit(repositories.PAGE_SIZE).
				Offset((page - 1) * repositories.PAGE_SIZE).
				Order("name ASC")
		}).
		Where("id = ?", userID).
		First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		logs.Logger.Error("failed to find user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	totalCount := db.Model(&user).Association("FavoriteSeries").Count()

	totalPages := (int(totalCount) + repositories.PAGE_SIZE - 1) / repositories.PAGE_SIZE

	repository := repositories.Repository{DB: db}
	tags, err := repository.FindAllTags()
	if err != nil {
		logs.Logger.Error("failed to find tags", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	opdsFeed := opds_v2.BuildGlobalFeed(user.FavoriteSeries, tags, page, totalPages, "/opds/v2", nil)
	c.Header("Content-Type", "application/opds+json; charset=utf-8")
	c.JSON(http.StatusOK, opdsFeed)
}

package users_routes

import (
	"fmt"
	"net/http"

	"github.com/Bastien2203/comics-reader/logs"

	"github.com/Bastien2203/comics-reader/repositories"
	opds_v2 "github.com/Bastien2203/comics-reader/routes/opds/v2"
	route_utils "github.com/Bastien2203/comics-reader/routes/utils"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func AddFavoriteSeries(
	userRepository *repositories.UserRepository,
	seriesRepository *repositories.SeriesRepository,
	c *gin.Context,
) {
	id := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Check if the series exists
	series, err := seriesRepository.FindOneByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "series not found"})
			return
		}
		logs.Logger.Error("failed to find series", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	// Check if the user exists
	user, err := userRepository.FindOneByID(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		logs.Logger.Error("failed to find user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	fmt.Println("==============")
	fmt.Println("user id", user.ID)
	fmt.Println("series id", series.ID)
	fmt.Println("==============")
	// Add the series to the user's favorite series
	err = userRepository.AddFavoriteSeries(user, series)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "series not found"})
			return
		}
		logs.Logger.Error("failed to add series to favorites", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "series added to favorites"})
}

func RemoveFavoriteSeries(
	userRepository *repositories.UserRepository,
	seriesRepository *repositories.SeriesRepository,
	c *gin.Context,
) {
	id := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Check if the series exists
	series, err := seriesRepository.FindOneByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "series not found"})
			return
		}
		logs.Logger.Error("failed to find series", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	// Check if the user exists
	user, err := userRepository.FindOneByID(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		logs.Logger.Error("failed to find user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	// Remove the series from the user's favorite series
	err = userRepository.RemoveFavoriteSeries(user, series)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "series not found in favorites"})
			return
		}
		logs.Logger.Error("failed to remove series from favorites", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "series removed from favorites"})
}

func GetFavoriteSeries(
	userRepository *repositories.UserRepository,
	tagRepository *repositories.TagRepository,
	c *gin.Context,
) {
	page := route_utils.Page(c)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	user, err := userRepository.FindOneByIDWithFavoriteSeries(userID, page)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		logs.Logger.Error("failed to find user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	totalCount := userRepository.CountByFavoriteSeries(user)
	totalPages := (int(totalCount) + repositories.PAGE_SIZE - 1) / repositories.PAGE_SIZE

	tags, err := tagRepository.FindAll()
	if err != nil {
		logs.Logger.Error("failed to find tags", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	opdsFeed := opds_v2.BuildGlobalFeed(user.FavoriteSeries, tags, page, totalPages, "/opds/v2", nil)
	c.Header("Content-Type", "application/opds+json; charset=utf-8")
	c.JSON(http.StatusOK, opdsFeed)
}

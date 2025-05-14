package users

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Me(db *gorm.DB, c *gin.Context) {
	userID, exists := c.Get("user_id")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var user models.User
	if err := db.Preload("FavoriteSeries").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve user"})
		return
	}

	user.Password = ""

	res := make(map[string]interface{})
	res["id"] = user.ID
	res["username"] = user.Username
	res["role"] = user.Role
	res["favorite_series"] = make([]map[string]interface{}, len(user.FavoriteSeries))
	favoriteSeries := res["favorite_series"].([]map[string]interface{})
	for i, series := range user.FavoriteSeries {
		var comic models.Comic
		db.Model(&models.Comic{}).Where("series_id = ? AND series_position = 1", series.ID).Select("cover_url").First(&comic)

		favoriteSeries[i] = map[string]interface{}{
			"id":    series.ID,
			"name":  series.Name,
			"cover": comic.CoverURL,
		}
	}

	c.JSON(http.StatusOK, gin.H{"user": res})
}

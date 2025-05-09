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
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve user"})
		return
	}

	user.Password = ""

	c.JSON(http.StatusOK, gin.H{"user": user})
}

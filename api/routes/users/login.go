package users

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/logs"
	"github.com/Bastien2203/comics-reader/models"
	"github.com/Bastien2203/comics-reader/utils"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func Login(db *gorm.DB, c *gin.Context) {
	var input models.User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	var user models.User
	if err := db.Where("username = ?", input.Username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		}
		logs.Logger.Error("failed to find user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if !user.CheckPassword(input.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	token, err := utils.GenerateJWT(user.ID, user.Role)
	if err != nil {
		logs.Logger.Error("failed to generate token", zap.Error(err))

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}

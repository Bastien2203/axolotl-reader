package users

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/log"
	"github.com/Bastien2203/comics-reader/models"
	"github.com/Bastien2203/comics-reader/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Login(db *gorm.DB, c *gin.Context) {
	var input models.User
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Error(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var user models.User
	if err := db.Where("username = ?", input.Username).First(&user).Error; err != nil {
		log.Error(err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	if !user.CheckPassword(input.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	token, err := utils.GenerateJWT(user.ID, user.Role)
	if err != nil {
		log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}

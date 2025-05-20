package users

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/logs"
	"github.com/Bastien2203/comics-reader/middleware"
	"github.com/Bastien2203/comics-reader/models"
	"github.com/Bastien2203/comics-reader/utils"
	"github.com/gin-gonic/gin"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

func CanRegister(db *gorm.DB, c *gin.Context) {
	var count int64
	if err := db.Model(&models.User{}).Count(&count).Error; err != nil {
		logs.Logger.Error("failed to count users", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to check user count"})
		return
	}

	if count > 0 {
		c.JSON(http.StatusForbidden, gin.H{"can_register": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"can_register": true})
}

func Register(db *gorm.DB, c *gin.Context) {

	var count int64
	if err := db.Model(&models.User{}).Count(&count).Error; err != nil {
		logs.Logger.Error("failed to count users", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to check user count"})
		return
	}

	if count > 0 {
		if !middleware.IsAuthenticatedAsAdmin(c) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized"})
			return
		}
	}

	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if user.Username == "" || user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username and password are required"})
		return
	}

	// if first user, set admin role
	if count == 0 {
		user.Role = "admin"
	} else {
		user.Role = "user"
	}

	if err := db.Create(&user).Error; err != nil {
		if err == gorm.ErrDuplicatedKey {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
			return
		}
		logs.Logger.Error("failed to create user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create user"})
		return
	}

	token, err := utils.GenerateJWT(user.ID, user.Role)
	if err != nil {
		logs.Logger.Error("failed to generate token", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user":  user,
	})
}

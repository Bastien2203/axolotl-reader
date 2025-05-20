package users

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/middleware"
	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetAll(db *gorm.DB, c *gin.Context) {
	isAdmin := middleware.IsAuthenticatedAsAdmin(c)

	if !isAdmin {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var users []models.User
	if err := db.Select("id, username, role").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

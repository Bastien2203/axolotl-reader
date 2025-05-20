package users_routes

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/logs"
	"github.com/Bastien2203/comics-reader/middleware"
	"github.com/Bastien2203/comics-reader/repositories"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func GetAll(userRepository *repositories.UserRepository, c *gin.Context) {
	isAdmin := middleware.IsAuthenticatedAsAdmin(c)

	if !isAdmin {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	users, err := userRepository.FindAll()
	if err != nil {
		logs.Logger.Error("failed to find users", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	c.JSON(http.StatusOK, users)
}

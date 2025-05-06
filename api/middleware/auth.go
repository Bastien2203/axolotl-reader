package middleware

import (
	"net/http"
	"strings"

	"github.com/Bastien2203/comics-reader/utils"
	"github.com/gin-gonic/gin"
)

func IsAuthenticatedAsAdmin(c *gin.Context) bool {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return false
	}
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := utils.ParseJWT(tokenStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return false
	}
	role, ok := claims["role"].(string)
	if !ok || role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		c.Abort()
		return false
	}
	c.Set("user_id", claims["user_id"])
	return true
}

func AuthRequired(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}

	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := utils.ParseJWT(tokenStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}

	c.Set("user_id", claims["user_id"])
	c.Next()
}

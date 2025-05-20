package tags_routes

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/logs"
	"github.com/Bastien2203/comics-reader/repositories"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func All(tagRepository repositories.TagRepository, c *gin.Context) {
	tags, err := tagRepository.FindAll()
	if err != nil {
		logs.Logger.Error("failed to find tags", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	c.JSON(http.StatusOK, tags)
}

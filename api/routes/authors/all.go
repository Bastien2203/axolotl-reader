package authors_routes

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/logs"
	"github.com/Bastien2203/comics-reader/repositories"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func All(authorRepository repositories.AuthorRepository, c *gin.Context) {
	authors, err := authorRepository.FindAll()
	if err != nil {
		logs.Logger.Error("failed to find authors", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	c.JSON(http.StatusOK, authors)
}

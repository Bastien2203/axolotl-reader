package opds_v2

import (
	"fmt"

	"github.com/Bastien2203/comics-reader/logs"
	"github.com/Bastien2203/comics-reader/repositories"
	route_utils "github.com/Bastien2203/comics-reader/routes/utils"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func Catalog(repository repositories.Repository, c *gin.Context) {
	page := route_utils.Page(c)
	tag := route_utils.GetTag(c)

	var subdir string
	if tag != nil {
		subdir = fmt.Sprintf("tag_%s", *tag)
	}
	feed, err := ReadFeedFromFile(page, &subdir)
	if err != nil {
		logs.Logger.Error("failed to read feed", zap.Error(err))
		c.JSON(500, gin.H{"error": "Failed to read feed"})
		return
	}

	c.Header("Content-Type", "application/opds+json; charset=utf-8")
	c.JSON(200, feed)
}

func Series(repository repositories.Repository, c *gin.Context) {
	page := route_utils.Page(c)
	seriesID := c.Param("id")

	path := fmt.Sprintf("series_%s", seriesID)
	feed, err := ReadFeedFromFile(page, &path)
	if err != nil {
		logs.Logger.Error("failed to read feed", zap.Error(err))
		c.JSON(500, gin.H{"error": "Failed to read feed"})
		return
	}

	c.Header("Content-Type", "application/opds+json; charset=utf-8")
	c.JSON(200, feed)
}

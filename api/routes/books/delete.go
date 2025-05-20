package books_routes

import (
	"net/http"
	"os"

	"github.com/Bastien2203/comics-reader/jobs"
	"github.com/Bastien2203/comics-reader/logs"
	"github.com/Bastien2203/comics-reader/models"
	"github.com/Bastien2203/comics-reader/repositories"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func Delete(
	comicRepository *repositories.ComicRepository,
	seriesRepository *repositories.SeriesRepository,
	tagRepository *repositories.TagRepository,
	c *gin.Context,
) {
	id := c.Param("id")

	// Check if the comic exists
	comic, err := comicRepository.FindOneByIdentifier(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "comic not found"})
			return
		}
		logs.Logger.Error("failed to find comic", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	DeleteComic(comic, comicRepository, c)

	jobs.Queue.Submit(&jobs.GenerateOPDSFeedJob{
		SeriesRepository: seriesRepository,
		ComicRepository:  comicRepository,
		TagRepository:    tagRepository,
	})

	c.Status(http.StatusNoContent)
}

func DeleteComic(
	comic *models.Comic,
	comicRepository *repositories.ComicRepository,
	c *gin.Context,
) {
	file := comic.FilePath
	if err := os.Remove(file); err != nil {
		logs.Logger.Error("file deletion failed", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "file deletion failed"})
		return
	}

	cover := comic.CoverPath
	if err := os.Remove(cover); err != nil {
		logs.Logger.Error("cover deletion failed", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cover deletion failed"})
		return
	}

	if err := comicRepository.DeleteByIdentifier(comic.Identifier); err != nil {
		logs.Logger.Error("comic deletion failed", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "comic deletion failed"})
		return
	}
}

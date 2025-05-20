package series_routes

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/jobs"
	"github.com/Bastien2203/comics-reader/logs"
	"github.com/Bastien2203/comics-reader/repositories"
	books_routes "github.com/Bastien2203/comics-reader/routes/books"

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

	// Check if the series exists
	series, err := seriesRepository.FindOneByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "series not found"})
			return
		}
		logs.Logger.Error("failed to find series", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	// delete all comics in the series
	comics, err := comicRepository.FindBySeries(series.ID)
	if err != nil {
		logs.Logger.Error("failed to find comics", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	for _, comic := range comics {
		books_routes.DeleteComic(&comic, comicRepository, c)
	}

	// delete the series
	if err := seriesRepository.Delete(series); err != nil {
		logs.Logger.Error("failed to delete series", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	// TODO : when series will have its own cover, delete it

	jobs.Queue.Submit(&jobs.GenerateOPDSFeedJob{
		SeriesRepository: seriesRepository,
		ComicRepository:  comicRepository,
		TagRepository:    tagRepository,
	})

	c.Status(http.StatusNoContent)
}

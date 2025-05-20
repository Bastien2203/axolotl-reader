package books

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/Bastien2203/comics-reader/jobs"
	"github.com/Bastien2203/comics-reader/logs"
	"github.com/Bastien2203/comics-reader/models"
	"github.com/Bastien2203/comics-reader/repositories"
	"github.com/gin-gonic/gin"

	"go.uber.org/zap"

	"gorm.io/gorm"
)

func Upload(db *gorm.DB, c *gin.Context) {
	// Retrive metadata
	title := c.PostForm("title")
	authors := strings.Split(c.PostForm("authors"), ",")
	seriesName := c.PostForm("series_name")
	seriesPositionStr := c.PostForm("series_position")
	seriesPosition := 0
	var tags []string
	if c.PostForm("tags") != "" {
		tags = strings.Split(c.PostForm("tags"), ",")
	}

	if seriesPositionStr != "" {
		pos, err := strconv.Atoi(seriesPositionStr)
		if err == nil {
			seriesPosition = pos
		}
	}

	identifier := c.PostForm("identifier")
	if title == "" || len(authors) == 0 || identifier == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title, author and identifier required"})
		return
	}

	// Get and save files
	useFirstPageAsCover := c.PostForm("use_first_page_as_cover")

	var coverFile *multipart.FileHeader = nil
	if useFirstPageAsCover != "true" {
		var err error
		coverFile, err = c.FormFile("cover")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "cover file required"})
			return
		}
	}
	bookFile, err := c.FormFile("book")
	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": "book file required"})
		return
	}

	coverUrl := ""
	coverPath := ""
	if coverFile != nil {
		extension := filepath.Ext(coverFile.Filename)
		coverPath = filepath.Join(os.Getenv("COVER_DIRECTORY"), identifier+extension)
		if err := c.SaveUploadedFile(coverFile, coverPath); err != nil {
			logs.Logger.Error("failed to save cover", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save cover"})
			return
		}
		coverUrl = "/covers/" + identifier + extension
	}

	bookPath := filepath.Join(os.Getenv("BOOK_DIRECTORY"), identifier+".cbz")
	if err := c.SaveUploadedFile(bookFile, bookPath); err != nil {
		logs.Logger.Error("failed to save book", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save book"})
		return
	}
	bookUrl := "/books/" + identifier + ".cbz"

	if useFirstPageAsCover == "true" {
		coverPath = filepath.Join(os.Getenv("COVER_DIRECTORY"), identifier+".png")
		jobs.Queue.Submit(&jobs.GenerateCoverJob{
			Identifier: identifier,
			BookPath:   bookPath,
			OutputPath: coverPath,
		})

		coverUrl = "/covers/" + identifier + ".png"
	}

	tagsList := make([]models.Tag, len(tags))
	for i, tag := range tags {
		tagsList[i] = models.Tag{Name: tag}
		if err := db.Where(models.Tag{Name: tag}).FirstOrCreate(&tagsList[i]).Error; err != nil {
			logs.Logger.Error("db insert failed", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db insert failed"})
			return
		}
	}

	fmt.Println(authors)
	authorsList := make([]models.Author, len(authors))
	for i, author := range authors {
		authorsList[i] = models.Author{Name: author}
		if err := db.Where(models.Author{Name: author}).FirstOrCreate(&authorsList[i]).Error; err != nil {
			logs.Logger.Error("db insert failed", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db insert failed"})
			return
		}
	}

	series := models.Series{}
	if seriesName != "" {
		series = models.Series{Name: seriesName, Tags: tagsList, CoverURL: coverUrl}
		if err := db.Where(models.Series{Name: seriesName}).FirstOrCreate(&series).Error; err != nil {
			logs.Logger.Error("db insert failed", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db insert failed"})
			return
		}
	}

	comic := models.Comic{
		Title:          title,
		Authors:        authorsList,
		Identifier:     identifier,
		CoverURL:       coverUrl,
		FileURL:        bookUrl,
		FilePath:       bookPath,
		CoverPath:      coverPath,
		Series:         series,
		SeriesPosition: seriesPosition,
	}

	if err := db.Create(&comic).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db insert failed"})
		return
	}

	jobs.Queue.Submit(&jobs.GenerateOPDSFeedJob{
		Repository: repositories.Repository{DB: db},
	})

	c.JSON(http.StatusCreated, gin.H{"status": "created", "id": comic.ID})
}

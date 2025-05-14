package books

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/Bastien2203/comics-reader/cover_queue"
	"github.com/Bastien2203/comics-reader/log"
	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
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
			log.Error(err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "cover file required"})
			return
		}
	}
	bookFile, err := c.FormFile("book")
	if err != nil {
		log.Error(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "book file required"})
		return
	}

	coverUrl := ""
	coverPath := ""
	if coverFile != nil {
		extension := filepath.Ext(coverFile.Filename)
		coverPath = filepath.Join(os.Getenv("COVER_DIRECTORY"), identifier+extension)
		if err := c.SaveUploadedFile(coverFile, coverPath); err != nil {
			log.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save cover"})
			return
		}
		coverUrl = "/covers/" + identifier + extension
	}

	bookPath := filepath.Join(os.Getenv("BOOK_DIRECTORY"), identifier+".cbz")
	if err := c.SaveUploadedFile(bookFile, bookPath); err != nil {
		log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save book"})
		return
	}
	bookUrl := "/books/" + identifier + ".cbz"

	if useFirstPageAsCover == "true" {
		coverPath = filepath.Join(os.Getenv("COVER_DIRECTORY"), identifier+".png")
		cover_queue.Queue <- cover_queue.CoverJob{
			Identifier: identifier,
			BookPath:   bookPath,
			OutputPath: coverPath,
		}
		coverUrl = "/covers/" + identifier + ".png"
	}

	tagsList := make([]models.Tag, len(tags))
	for i, tag := range tags {
		tagsList[i] = models.Tag{Name: tag}
		if err := db.Where(models.Tag{Name: tag}).FirstOrCreate(&tagsList[i]).Error; err != nil {
			log.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db insert failed"})
			return
		}
	}

	fmt.Println(authors)
	authorsList := make([]models.Author, len(authors))
	for i, author := range authors {
		authorsList[i] = models.Author{Name: author}
		if err := db.Where(models.Author{Name: author}).FirstOrCreate(&authorsList[i]).Error; err != nil {
			log.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db insert failed"})
			return
		}
	}

	series := models.Series{}
	if seriesName != "" {
		series = models.Series{Name: seriesName, Tags: tagsList}
		if err := db.Where(models.Series{Name: seriesName}).FirstOrCreate(&series).Error; err != nil {
			log.Error(err)
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

	c.JSON(http.StatusCreated, gin.H{"status": "created", "id": comic.ID})
}

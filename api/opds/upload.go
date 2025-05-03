package opds

import (
	"net/http"
	"path/filepath"

	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Upload(db *gorm.DB, c *gin.Context) {
	// Retrive metadata
	title := c.PostForm("title")
	author := c.PostForm("author")
	identifier := c.PostForm("identifier")
	if title == "" || author == "" || identifier == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title, author and identifier required"})
		return
	}

	// Get and save files
	coverFile, err := c.FormFile("cover")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cover file required"})
		return
	}
	bookFile, err := c.FormFile("book")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "book file required"})
		return
	}

	coverPath := filepath.Join("covers", coverFile.Filename)
	bookPath := filepath.Join("comics", bookFile.Filename)

	if err := c.SaveUploadedFile(coverFile, "../"+coverPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save cover"})
		return
	}
	if err := c.SaveUploadedFile(bookFile, "../"+bookPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save book"})
		return
	}

	// Insert into database
	comic := models.Comic{
		Title:      title,
		Author:     author,
		Identifier: identifier,
		CoverURL:   "/" + coverPath,
		FileURL:    "/" + bookPath,
	}
	if err := db.Create(&comic).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db insert failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"status": "created", "id": comic.ID})
}

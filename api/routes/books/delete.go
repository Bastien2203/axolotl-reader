package books

import (
	"net/http"
	"os"

	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Delete(db *gorm.DB, c *gin.Context) {
	id := c.Param("id")

	// Check if the comic exists
	var comic models.Comic
	if err := db.Where("identifier = ?", id).First(&comic).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "comic not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	DeleteComic(comic, db, c)

	c.Status(http.StatusNoContent)
}

func DeleteComic(comic models.Comic, db *gorm.DB, c *gin.Context) {
	file := comic.FilePath
	if err := os.Remove(file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "file deletion failed"})
		return
	}

	cover := comic.CoverPath
	if err := os.Remove(cover); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cover deletion failed"})
		return
	}

	if err := db.Where("identifier = ?", comic.Identifier).Delete(&models.Comic{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}
}

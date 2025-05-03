package opds

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Delete(db *gorm.DB, c *gin.Context) {
	id := c.Param("id")

	if err := db.Delete(&models.Comic{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}

	c.Status(http.StatusNoContent)
}

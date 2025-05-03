package main

import (
	"github.com/Bastien2203/comics-reader/models"
	"github.com/Bastien2203/comics-reader/opds"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, _ := gorm.Open(sqlite.Open("../comics.db"), &gorm.Config{})
	db.AutoMigrate(&models.Comic{})

	r := gin.Default()

	r.Static("/covers", "../covers")
	r.Static("/books", "../comics")

	opdsGroup := r.Group("/opds")
	{
		opdsGroup.GET("/catalog.json", func(c *gin.Context) { opds.Catalog(db, c) })
		opdsGroup.GET("/facets.json", func(c *gin.Context) { opds.Facets(db, c) })
		opdsGroup.GET("/search.json", func(c *gin.Context) { opds.Search(db, c) })
		opdsGroup.POST("/books", func(c *gin.Context) { opds.Upload(db, c) })
		opdsGroup.DELETE("/books/:id", func(c *gin.Context) { opds.Delete(db, c) })
	}

	r.Run(":8080")
}

package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Bastien2203/comics-reader/cover_queue"
	"github.com/Bastien2203/comics-reader/middleware"
	"github.com/Bastien2203/comics-reader/models"
	"github.com/Bastien2203/comics-reader/routes/books"
	"github.com/Bastien2203/comics-reader/routes/opds"
	"github.com/Bastien2203/comics-reader/routes/series"
	"github.com/Bastien2203/comics-reader/routes/users"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	cover_queue.StartWorker()
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	coverDir := os.Getenv("COVER_DIRECTORY")
	if coverDir == "" {
		panic("COVER_DIRECTORY environment variable not set")
	}
	bookDir := os.Getenv("BOOK_DIRECTORY")
	if bookDir == "" {
		panic("BOOK_DIRECTORY environment variable not set")
	}

	db, err := gorm.Open(sqlite.Open(os.Getenv("DATABASE_PATH")), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	db.AutoMigrate(&models.Comic{}, &models.Tag{}, &models.Author{}, &models.Series{}, &models.User{})

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// get the cover and book directories from environment variables
	r.GET("/covers/*filepath", middleware.AuthRequired, func(c *gin.Context) {
		filepath := c.Param("filepath")
		c.File(coverDir + filepath)
	})
	r.GET("/books/*filepath", middleware.AuthRequired, func(c *gin.Context) {
		filepath := c.Param("filepath")
		c.File(bookDir + filepath)
	})

	opdsGroup := r.Group("/opds", middleware.AuthRequired)
	{
		opdsGroup.GET("/catalog.json", func(c *gin.Context) { opds.Catalog(db, c) })
		opdsGroup.GET("/facets.json", func(c *gin.Context) { opds.Facets(db, c) })
		opdsGroup.GET("/search.json", func(c *gin.Context) { opds.Search(db, c) })
		opdsGroup.GET("/series/:id", func(c *gin.Context) { opds.GetSeries(db, c) })
	}

	booksGroup := r.Group("/books", middleware.AuthRequired)
	{
		booksGroup.POST("", func(c *gin.Context) { books.Upload(db, c) })
		booksGroup.DELETE("/:id", func(c *gin.Context) { books.Delete(db, c) })
	}

	seriesGroup := r.Group("/series", middleware.AuthRequired)
	{
		seriesGroup.DELETE("/:id", func(c *gin.Context) { series.Delete(db, c) })
	}

	usersGroup := r.Group("/users")
	{
		usersGroup.POST("/add_favorite_series/:id", middleware.AuthRequired, func(c *gin.Context) { users.AddFavoriteSeries(db, c) })
		usersGroup.DELETE("/remove_favorite_series/:id", middleware.AuthRequired, func(c *gin.Context) { users.RemoveFavoriteSeries(db, c) })
		usersGroup.POST("/login", func(c *gin.Context) { users.Login(db, c) })
		usersGroup.POST("/register", func(c *gin.Context) { users.Register(db, c) })
		usersGroup.GET("/can_register", func(c *gin.Context) { users.CanRegister(db, c) })
		usersGroup.GET("/me", middleware.AuthRequired, func(c *gin.Context) { users.Me(db, c) })
	}

	r.LoadHTMLFiles("./dist/index.html")
	r.GET("/icon.png", func(c *gin.Context) {
		c.File("./dist/icon.png")
	})

	r.GET(("/manifest.webmanifest"), func(c *gin.Context) {
		c.Header("Content-Type", "application/manifest+json")
		c.File("./dist/manifest.webmanifest")
	})
	r.GET("/registerSW.js", func(c *gin.Context) {
		c.Header("Content-Type", "application/javascript")
		c.File("./dist/registerSW.js")
	})

	r.GET("/sw.js", func(c *gin.Context) {
		c.Header("Content-Type", "application/javascript")
		c.File("./dist/sw.js")
	})

	r.GET("/workbox-:hash.js", func(c *gin.Context) {
		hash := c.Param("hash")
		file := fmt.Sprintf("./dist/workbox-%s.js", hash)
		c.File(file)
	})

	r.Static("/assets", "./dist/assets")
	r.NoRoute(func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})

	r.Run(":8080")
}

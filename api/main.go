package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/Bastien2203/comics-reader/jobs"
	"github.com/Bastien2203/comics-reader/logs"
	"github.com/Bastien2203/comics-reader/middleware"
	"github.com/Bastien2203/comics-reader/models"

	"github.com/Bastien2203/comics-reader/repositories"

	books_routes "github.com/Bastien2203/comics-reader/routes/books"
	jobs_routes "github.com/Bastien2203/comics-reader/routes/jobs"
	opds_v2 "github.com/Bastien2203/comics-reader/routes/opds/v2"
	opds "github.com/Bastien2203/comics-reader/routes/opds_v2"
	series_routes "github.com/Bastien2203/comics-reader/routes/series"
	users_routes "github.com/Bastien2203/comics-reader/routes/users"

	"github.com/gin-contrib/cors"
	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	if os.Getenv("ENV") != "production" {
		err := godotenv.Load()
		if err != nil {
			panic("No .env file found, skipping...")
		}
	}

	coverDir := os.Getenv("COVER_DIRECTORY")
	if coverDir == "" {
		panic("COVER_DIRECTORY environment variable not set")
	}
	bookDir := os.Getenv("BOOK_DIRECTORY")
	if bookDir == "" {
		panic("BOOK_DIRECTORY environment variable not set")
	}
	api_host := os.Getenv("API_HOST")
	if api_host == "" {
		panic("API_HOST environment variable not set")
	}

	db, err := gorm.Open(sqlite.Open(os.Getenv("DATABASE_PATH")), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	db.AutoMigrate(&models.Comic{}, &models.Tag{}, &models.Author{}, &models.Series{}, &models.User{})

	ctx := context.Background()
	jobs.Queue.StartWorker(1, ctx)

	tagRepository := &repositories.TagRepository{DB: db}
	authorRepository := &repositories.AuthorRepository{DB: db}
	seriesRepository := &repositories.SeriesRepository{DB: db}
	comicRepository := &repositories.ComicRepository{DB: db}
	userRepository := &repositories.UserRepository{DB: db}

	// Route setup
	r := gin.Default()

	logs.Init()
	r.Use(ginzap.Ginzap(logs.Logger, time.RFC3339, true))
	r.Use(ginzap.RecoveryWithZap(logs.Logger, true))

	jobs.Queue.Submit(&jobs.GenerateOPDSFeedJob{
		SeriesRepository: seriesRepository,
		TagRepository:    tagRepository,
		ComicRepository:  comicRepository,
	})

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", api_host},
		AllowMethods:     []string{"GET", "POST", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
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

	jobsGroup := r.Group("/jobs", middleware.AuthRequired)
	{
		jobsGroup.GET("", func(c *gin.Context) { jobs_routes.GetAll(c) })
	}

	opdsV2Group := r.Group("/opds/v2", middleware.AuthRequired)
	{
		opdsV2Group.GET("", opds_v2.Catalog)
		opdsV2Group.GET("/series/:id", opds_v2.Series)
	}

	opdsGroup := r.Group("/opds", middleware.AuthRequired)
	{
		opdsGroup.GET("/facets.json", func(c *gin.Context) { opds.Facets(db, c) })
	}

	booksGroup := r.Group("/books", middleware.AuthRequired)
	{
		booksGroup.POST("", func(c *gin.Context) {
			books_routes.Upload(comicRepository, tagRepository, authorRepository, seriesRepository, c)
		})
		booksGroup.DELETE("/:id", func(c *gin.Context) { books_routes.Delete(comicRepository, seriesRepository, tagRepository, c) })
	}

	seriesGroup := r.Group("/series", middleware.AuthRequired)
	{
		seriesGroup.DELETE("/:id", func(c *gin.Context) { series_routes.Delete(comicRepository, seriesRepository, tagRepository, c) })
	}

	usersGroup := r.Group("/users")
	{
		usersGroup.GET("", middleware.AuthRequired, func(c *gin.Context) { users_routes.GetAll(userRepository, c) })
		usersGroup.POST("/login", func(c *gin.Context) { users_routes.Login(userRepository, c) })
		usersGroup.POST("/register", func(c *gin.Context) { users_routes.Register(userRepository, c) })
		usersGroup.GET("/can_register", func(c *gin.Context) { users_routes.CanRegister(userRepository, c) })
		usersGroup.GET("/me", middleware.AuthRequired, func(c *gin.Context) { users_routes.Me(userRepository, c) })
		usersGroup.GET("/favorites", middleware.AuthRequired, func(c *gin.Context) { users_routes.GetFavoriteSeries(userRepository, tagRepository, c) })
		usersGroup.POST("/favorites/:id", middleware.AuthRequired, func(c *gin.Context) { users_routes.AddFavoriteSeries(userRepository, seriesRepository, c) })
		usersGroup.DELETE("/favorites/:id", middleware.AuthRequired, func(c *gin.Context) { users_routes.RemoveFavoriteSeries(userRepository, seriesRepository, c) })
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

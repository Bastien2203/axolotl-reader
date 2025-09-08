package books_routes

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
)

type BatchUploadResult struct {
	Success    bool   `json:"success"`
	BookID     uint   `json:"book_id,omitempty"`
	Identifier string `json:"identifier"`
	Error      string `json:"error,omitempty"`
}

type BatchUploadResponse struct {
	Results []BatchUploadResult `json:"results"`
	Summary struct {
		Total     int `json:"total"`
		Success   int `json:"success"`
		Failed    int `json:"failed"`
	} `json:"summary"`
}

func BatchUpload(
	comicRepository *repositories.ComicRepository,
	tagRepository *repositories.TagRepository,
	authorRepository *repositories.AuthorRepository,
	seriesRepository *repositories.SeriesRepository,
	c *gin.Context,
) {
	// Parse form data
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse multipart form"})
		return
	}

	// Get common metadata
	useFirstPageAsCover := c.PostForm("use_first_page_as_cover") == "true"
	commonAuthors := strings.Split(c.PostForm("authors"), ",")
	commonTags := []string{}
	if c.PostForm("tags") != "" {
		commonTags = strings.Split(c.PostForm("tags"), ",")
	}
	commonSeriesName := c.PostForm("series_name")

	if len(commonAuthors) == 0 || commonAuthors[0] == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "authors required"})
		return
	}

	// Get book files and metadata
	bookFiles := form.File["books"]
	if len(bookFiles) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no book files provided"})
		return
	}

	// Get cover files (if not using first page as cover)
	var coverFiles map[string]*multipart.FileHeader
	if !useFirstPageAsCover {
		coverFiles = make(map[string]*multipart.FileHeader)
		for _, file := range form.File["covers"] {
			coverFiles[file.Filename] = file
		}
	}

	// Get individual book metadata
	titles := form.Value["titles"]
	identifiers := form.Value["identifiers"]
	seriesPositions := form.Value["series_positions"]

	if len(titles) != len(bookFiles) || len(identifiers) != len(bookFiles) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "mismatch between number of books and metadata"})
		return
	}

	// Prepare response
	response := BatchUploadResponse{
		Results: make([]BatchUploadResult, len(bookFiles)),
	}
	response.Summary.Total = len(bookFiles)

	// Process tags and authors once (shared across all books)
	tagsList := make([]models.Tag, len(commonTags))
	for i, tag := range commonTags {
		tagsList[i] = models.Tag{Name: tag}
		if _, err := tagRepository.FindByNameOrCreate(&tagsList[i]); err != nil {
			logs.Logger.Error("db insert failed for tag", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db insert failed for tags"})
			return
		}
	}

	authorsList := make([]models.Author, len(commonAuthors))
	for i, author := range commonAuthors {
		authorsList[i] = models.Author{Name: author}
		if _, err := authorRepository.FindByNameOrCreate(&authorsList[i]); err != nil {
			logs.Logger.Error("db insert failed for author", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db insert failed for authors"})
			return
		}
	}

	// Process series if provided
	var series models.Series
	if commonSeriesName != "" {
		series = models.Series{Name: commonSeriesName, Tags: tagsList}
		if _, err := seriesRepository.FindByNameOrCreate(&series); err != nil {
			logs.Logger.Error("db insert failed for series", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db insert failed for series"})
			return
		}
	}

	// Process each book
	for i, bookFile := range bookFiles {
		result := BatchUploadResult{
			Identifier: identifiers[i],
		}

		// Validate required fields
		if titles[i] == "" || identifiers[i] == "" {
			result.Success = false
			result.Error = "title and identifier required"
			response.Results[i] = result
			response.Summary.Failed++
			continue
		}

		// Parse series position
		seriesPosition := 0
		if i < len(seriesPositions) && seriesPositions[i] != "" {
			if pos, err := strconv.Atoi(seriesPositions[i]); err == nil {
				seriesPosition = pos
			}
		}

		// Save book file
		bookPath := filepath.Join(os.Getenv("BOOK_DIRECTORY"), identifiers[i]+".cbz")
		if err := c.SaveUploadedFile(bookFile, bookPath); err != nil {
			logs.Logger.Error("failed to save book", zap.Error(err))
			result.Success = false
			result.Error = "failed to save book file"
			response.Results[i] = result
			response.Summary.Failed++
			continue
		}
		bookUrl := "/books/" + identifiers[i] + ".cbz"

		// Handle cover
		coverUrl := ""
		coverPath := ""
		
		if useFirstPageAsCover {
			coverPath = filepath.Join(os.Getenv("COVER_DIRECTORY"), identifiers[i]+".png")
			jobs.Queue.Submit(&jobs.GenerateCoverJob{
				Identifier: identifiers[i],
				BookPath:   bookPath,
				OutputPath: coverPath,
			})
			coverUrl = "/covers/" + identifiers[i] + ".png"
		} else {
			// Look for corresponding cover file
			var coverFile *multipart.FileHeader
			for _, cf := range form.File["covers"] {
				// Match cover file to book based on some convention (e.g., same base name)
				if strings.Contains(cf.Filename, identifiers[i]) ||
				   cf.Filename == fmt.Sprintf("cover_%d%s", i, filepath.Ext(cf.Filename)) {
					coverFile = cf
					break
				}
			}
			
			if coverFile == nil {
				result.Success = false
				result.Error = "cover file required"
				response.Results[i] = result
				response.Summary.Failed++
				continue
			}

			extension := filepath.Ext(coverFile.Filename)
			coverPath = filepath.Join(os.Getenv("COVER_DIRECTORY"), identifiers[i]+extension)
			if err := c.SaveUploadedFile(coverFile, coverPath); err != nil {
				logs.Logger.Error("failed to save cover", zap.Error(err))
				result.Success = false
				result.Error = "failed to save cover file"
				response.Results[i] = result
				response.Summary.Failed++
				continue
			}
			coverUrl = "/covers/" + identifiers[i] + extension
		}

		// Create comic record
		comic := models.Comic{
			Title:          titles[i],
			Authors:        authorsList,
			Identifier:     identifiers[i],
			CoverURL:       coverUrl,
			FileURL:        bookUrl,
			FilePath:       bookPath,
			CoverPath:      coverPath,
			Series:         series,
			SeriesPosition: seriesPosition,
		}

		if err := comicRepository.Create(&comic); err != nil {
			logs.Logger.Error("db insert failed for comic", zap.Error(err))
			result.Success = false
			result.Error = "database insert failed"
			response.Results[i] = result
			response.Summary.Failed++
			continue
		}

		result.Success = true
		result.BookID = comic.ID
		response.Results[i] = result
		response.Summary.Success++
	}

	// Submit OPDS generation job once at the end
	jobs.Queue.Submit(&jobs.GenerateOPDSFeedJob{
		SeriesRepository: seriesRepository,
		ComicRepository:  comicRepository,
		TagRepository:    tagRepository,
	})

	// Return results
	if response.Summary.Failed > 0 && response.Summary.Success == 0 {
		c.JSON(http.StatusBadRequest, response)
	} else if response.Summary.Failed > 0 {
		c.JSON(http.StatusPartialContent, response)
	} else {
		c.JSON(http.StatusCreated, response)
	}
}
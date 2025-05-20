// routes/opds/utils.go
package opds

import (
	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
)

func BuildOPDSPublication(comic models.Comic) gin.H {
	var authors []map[string]any
	for _, author := range comic.Authors {
		authors = append(authors, map[string]any{
			"name": author.Name,
		})
	}

	metadata := gin.H{
		"title":      comic.Title,
		"identifier": comic.Identifier,
		"authors":    authors,
	}

	if comic.Series.ID != 0 {
		metadata["belongsTo"] = comic.Series
	}

	return gin.H{
		"metadata": metadata,
		"links": []gin.H{
			{"rel": "cover", "href": comic.CoverURL, "type": "image/png"},
			{"rel": "acquisition", "href": comic.FileURL, "type": "application/x-cbr"},
		},
	}
}

// routes/opds/utils.go
package opds

import (
	"github.com/Bastien2203/comics-reader/models"
	"github.com/gin-gonic/gin"
)

func BuildOPDSPublication(comic models.Comic) gin.H {
	metadata := gin.H{
		"title":      comic.Title,
		"identifier": comic.Identifier,
		"authors":    []gin.H{{"name": comic.Author}},
	}

	if comic.SeriesName != "" {
		metadata["belongsTo"] = gin.H{
			"series": gin.H{
				"name":     comic.SeriesName,
				"position": comic.SeriesPosition,
			},
		}
	}

	return gin.H{
		"metadata": metadata,
		"links": []gin.H{
			{"rel": "cover", "href": comic.CoverURL, "type": "image/jpeg"},
			{"rel": "acquisition", "href": comic.FileURL, "type": "application/x-cbr"},
		},
	}
}

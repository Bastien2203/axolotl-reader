package route_utils

import "github.com/gin-gonic/gin"

func GetTag(c *gin.Context) *string {
	tag := c.Query("tags")
	if tag == "" {
		return nil
	}
	return &tag
}

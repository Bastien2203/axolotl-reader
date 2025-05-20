package route_utils

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func Page(c *gin.Context) int {
	page := c.Query("page")
	if page == "" {
		page = "1"
	}

	pageInt, err := strconv.Atoi(page)
	if err != nil {
		return 1
	}
	return pageInt
}

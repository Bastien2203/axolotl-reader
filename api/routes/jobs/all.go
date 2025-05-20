package jobs_routes

import (
	"net/http"

	"github.com/Bastien2203/comics-reader/jobs"
	"github.com/Bastien2203/comics-reader/middleware"
	"github.com/gin-gonic/gin"
)

func GetAll(c *gin.Context) {
	isAdmin := middleware.IsAuthenticatedAsAdmin(c)

	if !isAdmin {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	jobsHistory := jobs.QueueHistory.GetAll()

	if len(jobsHistory) == 0 {
		jobsHistory = []jobs.JobData{}
	}

	c.JSON(http.StatusOK, jobsHistory)
}

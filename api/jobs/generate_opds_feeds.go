package jobs

import (
	"context"
	"time"

	"github.com/Bastien2203/comics-reader/repositories"
	opds_v2 "github.com/Bastien2203/comics-reader/routes/opds/v2"
)

type GenerateOPDSFeedJob struct {
	SeriesRepository *repositories.SeriesRepository
	ComicRepository  *repositories.ComicRepository
	TagRepository    *repositories.TagRepository
	state            JobState
	createdAt        time.Time
	finishedAt       time.Time
}

func (j *GenerateOPDSFeedJob) Name() string { return "GenerateOPDSFeedJob: " }

func (j *GenerateOPDSFeedJob) Run(ctx context.Context) error {
	return opds_v2.GenerateGlobalFeed(
		j.SeriesRepository,
		j.TagRepository,
		j.ComicRepository,
	)
}

func (j *GenerateOPDSFeedJob) State() JobState {
	return j.state
}

func (j *GenerateOPDSFeedJob) SetState(state JobState) {
	j.state = state
}

func (j *GenerateOPDSFeedJob) CreatedAt() time.Time {
	return j.createdAt
}

func (j *GenerateOPDSFeedJob) SetCreatedAt(createdAt time.Time) {
	j.createdAt = createdAt
}

func (j *GenerateOPDSFeedJob) FinishedAt() time.Time {
	return j.finishedAt
}

func (j *GenerateOPDSFeedJob) SetFinishedAt(finishedAt time.Time) {
	j.finishedAt = finishedAt
}

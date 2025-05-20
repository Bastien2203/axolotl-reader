package jobs

import (
	"context"
	"fmt"
	"time"

	"github.com/Bastien2203/comics-reader/filetools"
)

type GenerateCoverJob struct {
	Identifier string
	BookPath   string
	OutputPath string
	state      JobState
	createdAt  time.Time
	finishedAt time.Time
}

func (j GenerateCoverJob) Name() string { return "CoverJob: " + j.Identifier }

func (j *GenerateCoverJob) Run(ctx context.Context) error {
	img := filetools.GetFirstImageFromCBZ(j.BookPath)
	if img == nil {
		return fmt.Errorf("no image found in %s", j.Identifier)
	}
	return filetools.SaveImage(img, j.OutputPath)
}

func (j *GenerateCoverJob) State() JobState {
	return j.state
}

func (j *GenerateCoverJob) SetState(state JobState) {
	j.state = state
}

func (j *GenerateCoverJob) CreatedAt() time.Time {
	return j.createdAt
}

func (j *GenerateCoverJob) SetCreatedAt(createdAt time.Time) {
	j.createdAt = createdAt
}

func (j *GenerateCoverJob) FinishedAt() time.Time {
	return j.finishedAt
}

func (j *GenerateCoverJob) SetFinishedAt(finishedAt time.Time) {
	j.finishedAt = finishedAt
}

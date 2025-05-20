package jobs

import (
	"context"
	"fmt"

	"time"

	"github.com/Bastien2203/comics-reader/arrays"
	"github.com/Bastien2203/comics-reader/logs"
	"go.uber.org/zap"
)

var Queue = NewJobQueue(100)
var QueueHistory = &arrays.SafeArray[JobData]{}

type JobQueue struct {
	queue chan Job
}

func NewJobQueue(bufferSize int) *JobQueue {
	return &JobQueue{
		queue: make(chan Job, bufferSize),
	}
}

func (jq *JobQueue) StartWorker(n int, ctx context.Context) {
	for i := range n {
		go func(workerID int) {
			for {
				select {
				case <-ctx.Done():
					return
				case job := <-jq.queue:
					job.SetState(Running)
					job.SetCreatedAt(time.Now())
					if err := job.Run(ctx); err != nil {
						job.SetState(Error)
						logs.Logger.Error(fmt.Sprintf("worker %d: job %s failed", workerID, job.Name()), zap.Error(err))
					} else {
						job.SetState(Completed)
					}
					job.SetFinishedAt(time.Now())
					QueueHistory.Add(JobData{
						Name:       job.Name(),
						State:      job.State(),
						CreatedAt:  job.CreatedAt(),
						FinishedAt: job.FinishedAt(),
					})
					if QueueHistory.Len() > 100 {
						QueueHistory.Slice(0, 10)
					}
				}
			}
		}(i)
	}
}

func (jq *JobQueue) Submit(job Job) {
	job.SetState(Pending)
	jq.queue <- job
}

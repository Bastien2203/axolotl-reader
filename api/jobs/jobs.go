package jobs

import (
	"context"
	"encoding/json"
	"time"
)

type JobState int

const (
	Pending JobState = iota
	Running
	Error
	Completed
)

func (s JobState) String() string {
	switch s {
	case Pending:
		return "Pending"
	case Running:
		return "Running"
	case Error:
		return "Failed"
	case Completed:
		return "Completed"
	default:
		return "Unknown"
	}
}
func (s JobState) MarshalJSON() ([]byte, error) {
	switch s {
	case Pending:
		return []byte(`"Pending"`), nil
	case Running:
		return []byte(`"Running"`), nil
	case Error:
		return []byte(`"Error"`), nil
	case Completed:
		return []byte(`"Completed"`), nil
	default:
		return []byte(`"Unknown"`), nil
	}
}

type Job interface {
	Name() string
	Run(ctx context.Context) error
	State() JobState
	SetState(state JobState)
	CreatedAt() time.Time
	SetCreatedAt(createdAt time.Time)
	FinishedAt() time.Time
	SetFinishedAt(finishedAt time.Time)
}

type JobData struct {
	Name       string
	State      JobState
	CreatedAt  time.Time
	FinishedAt time.Time
}

func (jd *JobData) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		Name       string    `json:"name"`
		State      JobState  `json:"state"`
		CreatedAt  time.Time `json:"created_at"`
		FinishedAt time.Time `json:"finished_at"`
		Duration   string    `json:"duration"`
	}{
		Name:       jd.Name,
		State:      jd.State,
		CreatedAt:  jd.CreatedAt,
		FinishedAt: jd.FinishedAt,
		Duration:   jd.FinishedAt.Sub(jd.CreatedAt).Round(time.Second).String(),
	})
}

type JobManager struct {
	jobs []Job
}

func (jm *JobManager) Register(job Job) {
	jm.jobs = append(jm.jobs, job)
}

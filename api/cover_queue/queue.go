package cover_queue

import (
	"github.com/Bastien2203/comics-reader/filetools"
	"github.com/Bastien2203/comics-reader/log"
)

type CoverJob struct {
	Identifier string
	BookPath   string
	OutputPath string
}

var Queue = make(chan CoverJob, 100) // taille ajustable

func StartWorker() {
	go func() {
		for job := range Queue {
			log.Info("Generating cover for", job.Identifier)
			img := filetools.GetFirstImageFromCBZ(job.BookPath)
			if img == nil {
				log.Errorf("Failed to extract image from", job.Identifier)
				continue
			}
			err := filetools.SaveImage(img, job.OutputPath)
			if err != nil {
				log.Errorf("Failed to save cover for", job.Identifier, ":", err)
			} else {
				log.Info("Cover generated for", job.Identifier)
			}
		}
	}()
}

package log

import "log"

func Error(err error) {
	if err != nil {
		log.Println(err)
	}
}

func Info(msg string) {
	log.Println(msg)
}

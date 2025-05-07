package log

import "log"

func Error(err error) {
	if err != nil {
		log.Println(err)
	}
}

func Errorf(format string, args ...any) {
	msg := format
	for _, arg := range args {
		msg += arg.(string) + " "
	}
	log.Println(msg)
}

func Info(args ...any) {
	msg := ""
	for _, arg := range args {
		msg += arg.(string) + " "
	}
	log.Println(msg)
}

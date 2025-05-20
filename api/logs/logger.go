package logs

import "go.uber.org/zap"

var Logger *zap.Logger

func Init() {
	var err error
	cfg := zap.NewProductionConfig()
	cfg.OutputPaths = []string{"stdout", "api.log"}
	Logger, err = cfg.Build()
	if err != nil {
		panic(err)
	}
}

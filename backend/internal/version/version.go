package version

import (
	"runtime"

	"agora.io/rtt-demo/internal/log"
)

var (
	Branch    string
	BuildTime string
	Commit    string
	GoVersion = runtime.Version()
	Project   string
	Version   string
)

type Config struct {
	Service string
}

func Print(logger *log.Logger) {
	logger.Infow("version info",
		"Branch", Branch,
		"BuildTime", BuildTime,
		"Commit", Commit,
		"Arch", runtime.GOARCH,
		"OS", runtime.GOOS,
		"Version", Version,
		"GoVersion", GoVersion,
	)
}

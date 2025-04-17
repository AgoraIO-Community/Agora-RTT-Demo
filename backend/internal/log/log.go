package log

import (
	"context"
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

func getEncoderConfig() zapcore.EncoderConfig {
	return zapcore.EncoderConfig{
		TimeKey:          "ts",
		LevelKey:         "level",
		NameKey:          "logger",
		CallerKey:        "caller",
		MessageKey:       "msg",
		StacktraceKey:    "stacktrace",
		LineEnding:       zapcore.DefaultLineEnding,
		EncodeLevel:      zapcore.CapitalLevelEncoder,    // 大写编码器
		EncodeTime:       zapcore.RFC3339NanoTimeEncoder, // ISO8601 UTC 时间格式
		EncodeDuration:   zapcore.SecondsDurationEncoder,
		EncodeCaller:     zapcore.ShortCallerEncoder, // 全路径编码器
		ConsoleSeparator: " ",
	}
}

const (
	defaultFilePath    = "./data/logs/app.log"
	defaultMaxFileSize = 50
)

func getLogFileWriter(o *Options) zapcore.WriteSyncer {
	if o.LogFileName == "" {
		o.LogFileName = defaultFilePath
	}
	if o.MaxSize <= 0 {
		o.MaxSize = defaultMaxFileSize
	}
	lumberJackLogger := &lumberjack.Logger{
		Filename:   o.LogFileName,
		MaxSize:    o.MaxSize,
		MaxBackups: 1,
		MaxAge:     30,
		Compress:   false,
	}
	return zapcore.AddSync(lumberJackLogger)
}

type Options struct {
	Mode        uint // 0:console,1:file,2:console and file
	LogFileName string
	MaxSize     int
	Level       string // DEBUG、INFO、WARN、ERROR
}

type Level string

const (
	DebugLevel Level = "DEBUG"
	// InfoLevel is the default logging priority.
	InfoLevel  = "INFO"
	WarnLevel  = "WARN"
	ErrorLevel = "ERROR"
)

func New(o *Options) *Logger {
	level := checkLevel(o.Level)
	atom := zap.NewAtomicLevelAt(level)
	encoderConfig := getEncoderConfig()

	core := zapcore.NewCore(
		zapcore.NewConsoleEncoder(encoderConfig),
		zapcore.NewMultiWriteSyncer(getMultiWriteSyncer(o)...),
		atom,
	)
	zapLogger := zap.New(core, zap.AddCaller(), zap.AddCallerSkip(1)).Sugar()
	return &Logger{logger: zapLogger, handlers: []Handler{
		RequestIDHandler(),
	}}
}

type OutputMode uint

const (
	Console OutputMode = iota
	File
	ConsoleAndFile
)

func getMultiWriteSyncer(o *Options) []zapcore.WriteSyncer {
	var multiWriteSyncer []zapcore.WriteSyncer
	switch OutputMode(o.Mode) {
	case Console:
		multiWriteSyncer = append(multiWriteSyncer, os.Stdout)
	case File:
		multiWriteSyncer = append(multiWriteSyncer, getLogFileWriter(o))
	case ConsoleAndFile:
		multiWriteSyncer = append(multiWriteSyncer, getLogFileWriter(o), os.Stdout)
	default:
		multiWriteSyncer = append(multiWriteSyncer, os.Stdout)
	}
	return multiWriteSyncer
}

func checkLevel(level string) zapcore.Level {
	var resultLevel zapcore.Level
	switch Level(level) {
	case DebugLevel:
		resultLevel = zap.DebugLevel
	case InfoLevel:
		resultLevel = zap.InfoLevel
	case WarnLevel:
		resultLevel = zap.WarnLevel
	case ErrorLevel:
		resultLevel = zap.ErrorLevel
	default:
		resultLevel = zap.InfoLevel
	}
	return resultLevel
}

type Handler interface {
	Handle(ctx context.Context) (string, any)
}

type HandlerFunc func(ctx context.Context) (string, any)

func (h HandlerFunc) Handle(ctx context.Context) (string, any) {
	return h(ctx)
}

type Logger struct {
	logger   *zap.SugaredLogger
	handlers []Handler
}

func (l *Logger) AddCallerSkip(i int) *Logger {
	logger := l.logger.Desugar().WithOptions(zap.AddCallerSkip(i)).Sugar()
	return &Logger{logger, l.handlers}
}

func (l *Logger) Info(args ...interface{}) {
	l.logger.Info(args...)
}

func (l *Logger) InfoWithCtx(ctx context.Context, args ...interface{}) {
	l.logger.Info(l.AppendHandlers(ctx, args...)...)
}

func (l *Logger) Infof(template string, args ...interface{}) {
	l.logger.Infof(template, args...)
}

func (l *Logger) InfofWithCtx(ctx context.Context, template string, args ...interface{}) {
	l.logger.Infof(template, l.AppendHandlers(ctx, args...)...)
}

func (l *Logger) Infow(msg string, args ...interface{}) {
	l.logger.Infow(msg, args...)
}

func (l *Logger) InfowWithCtx(ctx context.Context, msg string, args ...interface{}) {
	l.logger.Infow(msg, l.AppendHandlers(ctx, args...)...)
}

func (l *Logger) Debugw(msg string, args ...interface{}) {
	l.logger.Debugw(msg, args...)
}

func (l *Logger) DebugwWithCtx(ctx context.Context, msg string, args ...interface{}) {
	l.logger.Debugw(msg, l.AppendHandlers(ctx, args...)...)
}

func (l *Logger) Debug(args ...interface{}) {
	l.logger.Debug(args...)
}

func (l *Logger) DebugWithCtx(ctx context.Context, args ...interface{}) {
	l.logger.Debug(l.AppendHandlers(ctx, args...)...)
}

func (l *Logger) Debugf(template string, args ...interface{}) {
	l.logger.Debugf(template, args...)
}

func (l *Logger) DebugfWithCtx(ctx context.Context, template string, args ...interface{}) {
	l.logger.Debugf(template, l.AppendHandlers(ctx, args...)...)
}

func (l *Logger) Warn(args ...interface{}) {
	l.logger.Warn(args...)
}

func (l *Logger) WarnWithCtx(ctx context.Context, args ...interface{}) {
	l.logger.Warn(l.AppendHandlers(ctx, args...)...)
}

func (l *Logger) Warnw(msg string, args ...interface{}) {
	l.logger.Warnw(msg, args...)
}

func (l *Logger) WarnwWithCtx(ctx context.Context, msg string, args ...interface{}) {
	l.logger.Warnw(msg, l.AppendHandlers(ctx, args...)...)
}

func (l *Logger) Warnf(template string, args ...interface{}) {
	l.logger.Warnf(template, args...)
}

func (l *Logger) WarnfWithCtx(ctx context.Context, template string, args ...interface{}) {
	l.logger.Warnf(template, l.AppendHandlers(ctx, args...)...)
}

func (l *Logger) Error(args ...interface{}) {
	l.logger.Error(args...)
}

func (l *Logger) ErrorWithCtx(ctx context.Context, args ...interface{}) {
	l.logger.Error(l.AppendHandlers(ctx, args...)...)
}

func (l *Logger) Errorf(template string, args ...interface{}) {
	l.logger.Errorf(template, args...)
}

func (l *Logger) ErrorfWithCtx(ctx context.Context, template string, args ...interface{}) {
	l.logger.Errorf(template, l.AppendHandlers(ctx, args...)...)
}

func (l *Logger) Errorw(msg string, args ...interface{}) {
	l.logger.Errorw(msg, args...)
}

func (l *Logger) ErrorwWithCtx(ctx context.Context, msg string, args ...interface{}) {
	l.logger.Errorw(msg, l.AppendHandlers(ctx, args...)...)
}

func (l *Logger) Fatal(args ...interface{}) {
	l.logger.Fatal(args...)
}

func (l *Logger) FatalWithCtx(ctx context.Context, args ...interface{}) {
	l.logger.Fatal(l.AppendHandlers(ctx, args...)...)
	os.Exit(1)
}

func (l *Logger) Fatalf(template string, args ...interface{}) {
	l.logger.Fatalf(template, args...)
}

func (l *Logger) FatalfWithCtx(ctx context.Context, template string, args ...interface{}) {
	l.logger.Fatalf(template, l.AppendHandlers(ctx, args...)...)
	os.Exit(1)
}

func (l *Logger) Fatalw(msg string, args ...interface{}) {
	l.logger.Fatalw(msg, args...)
}

func (l *Logger) FatalwWithCtx(ctx context.Context, msg string, args ...interface{}) {
	l.logger.Fatalw(msg, l.AppendHandlers(ctx, args...)...)
	os.Exit(1)
}

func (l *Logger) AppendHandlers(ctx context.Context, args ...any) []any {
	var newArgs []any
	if l.handlers != nil {
		for _, h := range l.handlers {
			key, value := h.Handle(ctx)
			if key == "" {
				continue
			}
			newArgs = append(newArgs, key, value)
		}
	}
	return append(newArgs, args...)
}

type CtxKey string

const (
	RequestIdKey CtxKey = "requestId"
)

func SetRequestId(ctx context.Context, requestId string) context.Context {
	return context.WithValue(ctx, RequestIdKey, requestId)
}

func GetRequestIDFromCtx(ctx context.Context) string {
	if v, ok := ctx.Value(RequestIdKey).(string); ok {
		return v
	}

	return ""
}

func RequestIDHandler() HandlerFunc {
	return func(ctx context.Context) (string, any) {
		requestID := GetRequestIDFromCtx(ctx)
		if requestID == "" {
			return "", ""
		}
		return string(RequestIdKey), requestID
	}
}

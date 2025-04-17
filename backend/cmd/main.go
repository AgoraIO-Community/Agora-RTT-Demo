package main

import (
	"context"
	"errors"
	"fmt"
	stdLogger "log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"agora.io/rtt-demo/cmd/option"
	"agora.io/rtt-demo/internal/client"
	"agora.io/rtt-demo/internal/handler"
	"agora.io/rtt-demo/internal/log"
	"agora.io/rtt-demo/internal/middleware"
	"agora.io/rtt-demo/internal/service/impl"
	"agora.io/rtt-demo/internal/version"
)

func setRouter(e *gin.Engine, h *handler.Handler) {
	v1Grop := e.Group("/v1")
	{
		v1Grop.POST("/speech-to-text/projects/:appId/join", h.Join)
		v1Grop.POST("/speech-to-text/projects/:appId/agents/:agentId/leave", h.Leave)
		v1Grop.POST("/speech-to-text/projects/:appId/agents/:agentId/update", h.Update)
		v1Grop.POST("/speech-to-text/projects/:appId/agents/:agentId", h.Get)
	}
}

func setHttpServer(opt *option.ConfigOption, stop chan os.Signal, agoraLogger *log.Logger, done chan struct{}) {
	r := gin.New()

	r.ContextWithFallback = true

	r.Use(gin.Recovery(), middleware.CorsMiddleware())

	r.GET("/healthz", func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "ok")
	})
	httpClient := client.NewHttp(agoraLogger)
	transAIClient := impl.NewTransAIClientImpl(opt, httpClient)
	agoraToken := impl.NewTokenClientImpl()
	h := handler.NewHandler(agoraLogger, opt, transAIClient, agoraToken)

	setRouter(r, h)

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", opt.HttpServer.Port),
		Handler:      r,
		ReadTimeout:  60 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		<-stop

		ctx, cancelFunc := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancelFunc()

		srv.SetKeepAlivesEnabled(false)
		if err := srv.Shutdown(ctx); err != nil {
			agoraLogger.Errorw("http server shutdown", "err", err.Error())
		}

		close(done)
	}()

	agoraLogger.Infow("http server start", "port", opt.HttpServer.Port)

	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		agoraLogger.Errorw("http server", "err", err.Error())
	}
}

func main() {
	done := make(chan struct{}, 1)
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	opt, err := option.NewCmdOption()
	if err != nil {
		stdLogger.Fatalln(err)
	}

	agoraLogger := log.New(&log.Options{
		Mode:        opt.Log.Mode,
		LogFileName: opt.Log.LogFileName,
		MaxSize:     opt.Log.MaxSize,
		Level:       opt.Log.Level,
	})

	version.Print(agoraLogger)

	setHttpServer(opt, stop, agoraLogger, done)

	<-done

	agoraLogger.Info("http server shutdown")
}

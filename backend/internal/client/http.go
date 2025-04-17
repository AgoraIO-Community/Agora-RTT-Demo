package client

import (
	"crypto/tls"
	"net/http"
	"net/http/httputil"
	"time"

	"agora.io/rtt-demo/internal/log"

	"github.com/go-resty/resty/v2"
)

func NewHttp(logger *log.Logger) *resty.Client {
	return resty.New().
		SetTimeout(30 * time.Second).
		SetTLSClientConfig(&tls.Config{
			InsecureSkipVerify: true,
		}).
		SetPreRequestHook(func(c *resty.Client, r *http.Request) error {
			reqDump, err := httputil.DumpRequest(r, true)
			if err != nil {
				logger.Errorw("http api request dump error", "error", err)
			}
			logger.InfowWithCtx(r.Context(), "http api request start", "path", r.URL.String(), "method", r.Method, "requestDump", string(reqDump))

			return nil
		}).
		OnAfterResponse(func(c *resty.Client, r *resty.Response) error {
			requestId := GetRequestID(r.Header())
			taskId := GetTaskID(r.Header())
			contentType := r.RawResponse.Header.Get("Content-Type")
			if contentType == "application/json" || contentType == "application/json; charset=utf-8" {
				logger.InfowWithCtx(r.Request.Context(), "http api request end", "path", r.Request.URL, "method", r.Request.Method, "x-request-id", requestId, "x-task-id", taskId, "status", r.StatusCode(), "response", r.String(), "took", r.Time().String())
			} else {
				logger.InfowWithCtx(r.Request.Context(), "http api request end", "path", r.Request.URL, "method", r.Request.Method, "x-request-id", requestId, "x-task-id", taskId, "status", r.StatusCode(), "response", "response is not json", "took", r.Time().String())
			}

			return nil
		})
}

func GetRequestID(header http.Header) string {
	return header.Get("X-Request-Id")
}

func GetTaskID(handler http.Header) string {
	return handler.Get("X-Task-Id")
}

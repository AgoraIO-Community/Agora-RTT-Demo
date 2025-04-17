package impl

import (
	"context"
	"strconv"

	"github.com/go-resty/resty/v2"

	"agora.io/rtt-demo/cmd/option"
	"agora.io/rtt-demo/internal/service"
)

type TransAIClientImpl struct {
	config     *option.ConfigOption
	httpClient *resty.Client
}

func NewTransAIClientImpl(config *option.ConfigOption, client *resty.Client) *TransAIClientImpl {
	return &TransAIClientImpl{
		config:     config,
		httpClient: client,
	}
}

var _ service.TransAIClient = (*TransAIClientImpl)(nil)

// Join implements service.TransAIClient.
func (t *TransAIClientImpl) Join(ctx context.Context, appId string, auth service.BasicAuth, req *service.JoinReq) (*service.TransAIRes, error) {
	var (
		successRes map[string]any
		errRes     map[string]any
	)

	response, err := t.httpClient.R().
		SetBody(req).
		SetBasicAuth(auth.Username, auth.Password).
		SetResult(&successRes).
		SetError(&errRes).
		SetPathParams(map[string]string{
			"appId": appId,
		}).
		Post(t.config.TransAIServiceConfig.BaseURL + "/api/speech-to-text/v1/projects/{appId}/join")
	if err != nil {
		return nil, err
	}

	requestId := response.Header().Get("X-Request-Id")

	ret := &service.TransAIRes{
		StatusCode: response.StatusCode(),
		RequestId:  requestId,
	}

	if response.IsError() {
		ret.Body = errRes
	} else {
		ret.Body = successRes
	}

	return ret, nil
}

// Leave implements service.TransAIClient.
func (t *TransAIClientImpl) Leave(ctx context.Context, appId string, auth service.BasicAuth, agentId string) (*service.TransAIRes, error) {
	var errRes map[string]any

	response, err := t.httpClient.R().
		SetBasicAuth(auth.Username, auth.Password).
		SetError(&errRes).
		SetPathParams(map[string]string{
			"appId":   appId,
			"agentId": agentId,
		}).
		Post(t.config.TransAIServiceConfig.BaseURL + "/api/speech-to-text/v1/projects/{appId}/agents/{agentId}/leave")
	if err != nil {
		return nil, err
	}

	requestId := response.Header().Get("X-Request-Id")

	ret := &service.TransAIRes{
		StatusCode: response.StatusCode(),
		RequestId:  requestId,
	}

	if response.IsError() {
		ret.Body = errRes
	}

	return ret, nil
}

// Update implements service.TransAIClient.
func (t *TransAIClientImpl) Update(ctx context.Context, appId string, auth service.BasicAuth,
	agentId string, sequenceId int64, updateMask string, req *service.UpdateParam,
) (*service.TransAIRes, error) {
	var (
		successRes map[string]any
		errRes     map[string]any
	)

	response, err := t.httpClient.R().
		SetBasicAuth(auth.Username, auth.Password).
		SetBody(req).
		SetResult(&successRes).
		SetError(&errRes).
		SetPathParams(map[string]string{
			"appId":   appId,
			"agentId": agentId,
		}).
		SetQueryParams(map[string]string{
			"sequenceId": strconv.FormatInt(sequenceId, 10),
			"updateMask": updateMask,
		}).
		Post(t.config.TransAIServiceConfig.BaseURL + "/api/speech-to-text/v1/projects/{appId}/agents/{agentId}/update")
	if err != nil {
		return nil, err
	}
	requestId := response.Header().Get("X-Request-Id")

	ret := &service.TransAIRes{
		StatusCode: response.StatusCode(),
		RequestId:  requestId,
	}

	if response.IsError() {
		ret.Body = errRes
	} else {
		ret.Body = successRes
	}

	return ret, nil
}

// Get implements service.TransAIClient.
func (t *TransAIClientImpl) Get(ctx context.Context, appId string, auth service.BasicAuth, agentId string) (*service.TransAIRes, error) {
	var (
		successRes map[string]any
		errRes     map[string]any
	)

	response, err := t.httpClient.R().
		SetBasicAuth(auth.Username, auth.Password).
		SetResult(&successRes).
		SetError(&errRes).
		SetPathParams(map[string]string{
			"appId":   appId,
			"agentId": agentId,
		}).
		Get(t.config.TransAIServiceConfig.BaseURL + "/api/speech-to-text/v1/projects/{appId}/agents/{agentId}")
	if err != nil {
		return nil, err
	}
	requestId := response.Header().Get("X-Request-Id")

	ret := &service.TransAIRes{
		StatusCode: response.StatusCode(),
		RequestId:  requestId,
	}

	if response.IsError() {
		ret.Body = errRes
	} else {
		ret.Body = successRes
	}

	return ret, nil
}

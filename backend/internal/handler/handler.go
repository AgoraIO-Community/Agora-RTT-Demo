package handler

import (
	"github.com/gin-gonic/gin"

	"agora.io/rtt-demo/cmd/option"
	"agora.io/rtt-demo/internal/log"
	"agora.io/rtt-demo/internal/req"
	"agora.io/rtt-demo/internal/service"
)

type Handler struct {
	logger            *log.Logger
	config            *option.ConfigOption
	transAIService    service.TransAIClient
	agoraTokenService service.AgoraToken
}

func NewHandler(
	logger *log.Logger,
	config *option.ConfigOption,
	transAIService service.TransAIClient,
	agoraTokenService service.AgoraToken,
) *Handler {
	return &Handler{
		logger:            logger,
		config:            config,
		transAIService:    transAIService,
		agoraTokenService: agoraTokenService,
	}
}

func (h *Handler) Join(ctx *gin.Context) {
	var (
		reqBody req.JoinBodyReq
		reqPath req.JoinPathReq
	)

	if err := ctx.ShouldBindUri(&reqPath); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if err := ctx.ShouldBindJSON(&reqBody); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var (
		authUsername string
		authPassword string
		appCert      string
	)

	appIdConfig, ok := h.config.TransAIAppIdConfigs[reqPath.AppId]
	if !ok {
		if reqBody.AuthUsername == "" || reqBody.AuthPassword == "" {
			ctx.JSON(400, gin.H{"error": "authUsername or authPassword is empty"})
			return
		}
		authUsername = reqBody.AuthUsername
		authPassword = reqBody.AuthPassword
		appCert = reqBody.AppCert
	} else {
		authUsername = appIdConfig.AuthUsername
		authPassword = appIdConfig.AuthPassword
		appCert = appIdConfig.AppCert
	}

	basicAuth := service.BasicAuth{
		Username: authUsername,
		Password: authPassword,
	}

	var (
		pubBotToken string
		subBotToken string
		err         error
	)

	if appCert == "" {
		pubBotToken = reqPath.AppId
		subBotToken = reqPath.AppId
	} else {
		subBotToken, err = h.agoraTokenService.Generate(ctx, service.TokenGenerateParams{
			AppID:       reqPath.AppId,
			AppCert:     appCert,
			ChannelName: reqBody.RTCConfig.ChannelName,
			Expire:      7200,
			Types: []uint{
				1, 2,
			},
			UID: reqBody.RTCConfig.SubBotUid,
		})
		if err != nil {
			h.logger.Errorw("Generate sub bot token failed", "error", err.Error())
			ctx.JSON(500, gin.H{"error": "Internal Server Error"})
			return
		}

		pubBotToken, err = h.agoraTokenService.Generate(ctx, service.TokenGenerateParams{
			AppID:       reqPath.AppId,
			AppCert:     appCert,
			ChannelName: reqBody.RTCConfig.ChannelName,
			Expire:      7200,
			Types: []uint{
				1, 2,
			},
			UID: reqBody.RTCConfig.PubBotUid,
		})
		if err != nil {
			h.logger.Errorw("Generate pub bot token failed", "error", err.Error())
			ctx.JSON(500, gin.H{"error": "Internal Server Error"})
			return
		}
	}

	joinReq := &service.JoinReq{
		Languages:   reqBody.Languages,
		Name:        reqBody.Name,
		MaxIdleTime: reqBody.MaxIdleTime,
		RTCConfig: &service.JoinReqRTCConfig{
			ChannelName:          reqBody.RTCConfig.ChannelName,
			SubBotUid:            reqBody.RTCConfig.SubBotUid,
			PubBotUId:            reqBody.RTCConfig.PubBotUid,
			SubBotToken:          subBotToken,
			PubBotToken:          pubBotToken,
			EnableJsonProtocol:   reqBody.RTCConfig.EnableJsonProtocol,
			SubscribeAudioUIds:   reqBody.RTCConfig.SubscribeAudioUIds,
			UnSubscribeAudioUIds: reqBody.RTCConfig.UnSubscribeAudioUIds,
			CryptionMode:         reqBody.RTCConfig.CryptionMode,
			Secret:               reqBody.RTCConfig.Secret,
			Salt:                 reqBody.RTCConfig.Salt,
		},
		ExtensionParams: reqBody.ExtensionParams,
	}

	var translateLanguageConfig []service.JoinReqRTCTranslateConfigLanguage

	for _, language := range reqBody.TranslateConfig.Languages {
		translateLanguageConfig = append(translateLanguageConfig, service.JoinReqRTCTranslateConfigLanguage{
			Source: language.Source,
			Target: language.Target,
		})
	}

	if len(translateLanguageConfig) != 0 {
		joinReq.TranslateConfig = &service.JoinReqRTCTranslateConfig{
			Languages: translateLanguageConfig,
		}
	}

	if reqBody.CaptionConfig != nil {
		if reqBody.CaptionConfig.SliceDuration != nil {
			joinReq.CaptionConfig = &service.JoinReqRTCCaptionConfig{
				SliceDuration: reqBody.CaptionConfig.SliceDuration,
			}
		}

		if reqBody.CaptionConfig.Storage != nil {
			joinReq.CaptionConfig.Storage = &service.JoinReqRTCCaptionConfigStorage{
				AccessKey:      reqBody.CaptionConfig.Storage.AccessKey,
				SecretKey:      reqBody.CaptionConfig.Storage.SecretKey,
				Bucket:         reqBody.CaptionConfig.Storage.Bucket,
				Vendor:         reqBody.CaptionConfig.Storage.Vendor,
				Region:         reqBody.CaptionConfig.Storage.Region,
				FileNamePrefix: reqBody.CaptionConfig.Storage.FileNamePrefix,
			}
		}
	}

	res, err := h.transAIService.Join(ctx, reqPath.AppId, basicAuth, joinReq)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Internal Server Error"})
		return
	}

	ctx.JSON(res.StatusCode, res.Body)
}

func (h *Handler) Leave(ctx *gin.Context) {
	var (
		reqPath req.LeavePathReq
		reqBody req.LeaveBodyReq
	)

	if err := ctx.ShouldBindUri(&reqPath); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if err := ctx.ShouldBindJSON(&reqBody); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var (
		authUsername string
		authPassword string
	)

	appIdConfig, ok := h.config.TransAIAppIdConfigs[reqPath.AppId]
	if !ok {
		if reqBody.AuthUsername == "" || reqBody.AuthPassword == "" {
			ctx.JSON(400, gin.H{"error": "authUsername or authPassword is empty"})
			return
		}
		authUsername = reqBody.AuthUsername
		authPassword = reqBody.AuthPassword
	} else {
		authUsername = appIdConfig.AuthUsername
		authPassword = appIdConfig.AuthPassword
	}

	basicAuth := service.BasicAuth{
		Username: authUsername,
		Password: authPassword,
	}

	res, err := h.transAIService.Leave(ctx, reqPath.AppId, basicAuth, reqPath.AgentId)
	if err != nil {
		h.logger.Errorw("Leave failed", "error", err.Error())
		ctx.JSON(500, gin.H{"error": "Internal Server Error"})
		return
	}
	if res.Body != nil {
		ctx.JSON(res.StatusCode, res.Body)
	} else {
		ctx.String(res.StatusCode, "")
	}
}

func (h *Handler) Update(ctx *gin.Context) {
	var (
		reqBody  req.UpdateBodyReq
		reqPath  req.UpdatePathReq
		reqQuery req.UpdateQueryReq
	)

	if err := ctx.ShouldBindUri(&reqPath); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if err := ctx.ShouldBindQuery(&reqQuery); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if err := ctx.ShouldBindJSON(&reqBody); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var (
		authUsername string
		authPassword string
	)

	appIdConfig, ok := h.config.TransAIAppIdConfigs[reqPath.AppId]
	if !ok {
		if reqBody.AuthUsername == "" || reqBody.AuthPassword == "" {
			ctx.JSON(400, gin.H{"error": "authUsername or authPassword is empty"})
			return
		}
		authUsername = reqBody.AuthUsername
		authPassword = reqBody.AuthPassword
	} else {
		authUsername = appIdConfig.AuthUsername
		authPassword = appIdConfig.AuthPassword
	}

	basicAuth := service.BasicAuth{
		Username: authUsername,
		Password: authPassword,
	}

	updateParam := &service.UpdateParam{
		Languages: reqBody.Languages,
	}

	if len(reqBody.UIdLanguagesConfig) != 0 {
		for _, uIdLanguageConfig := range reqBody.UIdLanguagesConfig {
			updateParam.UIdLanguagesConfig = append(updateParam.UIdLanguagesConfig, service.UIdLanguageConfig{
				UId:       uIdLanguageConfig.UId,
				Languages: uIdLanguageConfig.Languages,
			})
		}
	}

	if reqBody.RTCConfig != nil {
		updateParam.RTCConfig = &service.RTCConfig{
			SubscribeAudioUIds: reqBody.RTCConfig.SubscribeAudioUIds,
		}
	}

	if reqBody.TranslateConfig != nil {
		updateParam.TranslateConfig = &service.TranslateConfig{
			Enable: reqBody.TranslateConfig.Enable,
		}

		for _, language := range reqBody.TranslateConfig.Languages {
			updateParam.TranslateConfig.Languages = append(updateParam.TranslateConfig.Languages, service.Language{
				Source: language.Source,
				Target: language.Target,
			})
		}
	}

	res, err := h.transAIService.Update(ctx, reqPath.AppId, basicAuth,
		reqPath.AgentId, reqQuery.SequenceId,
		reqQuery.UpdateMask, updateParam)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Internal Server Error"})
		return
	}

	ctx.JSON(res.StatusCode, res.Body)
}

func (h *Handler) Get(ctx *gin.Context) {
	var (
		reqPath req.LeavePathReq
		reqBody req.LeaveBodyReq
	)

	if err := ctx.ShouldBindUri(&reqPath); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if err := ctx.ShouldBindJSON(&reqBody); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var (
		authUsername string
		authPassword string
	)

	appIdConfig, ok := h.config.TransAIAppIdConfigs[reqPath.AppId]
	if !ok {
		if reqBody.AuthUsername == "" || reqBody.AuthPassword == "" {
			ctx.JSON(400, gin.H{"error": "authUsername or authPassword is empty"})
			return
		}
		authUsername = reqBody.AuthUsername
		authPassword = reqBody.AuthPassword
	} else {
		authUsername = appIdConfig.AuthUsername
		authPassword = appIdConfig.AuthPassword
	}

	basicAuth := service.BasicAuth{
		Username: authUsername,
		Password: authPassword,
	}

	res, err := h.transAIService.Get(ctx, reqPath.AppId, basicAuth, reqPath.AgentId)
	if err != nil {
		h.logger.Errorw("Leave failed", "error", err.Error())
		ctx.JSON(500, gin.H{"error": "Internal Server Error"})
		return
	}

	ctx.JSON(res.StatusCode, res.Body)
}

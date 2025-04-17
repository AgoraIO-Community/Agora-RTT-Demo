package service

import "context"

type JoinReq struct {
	Languages          []string                   `json:"languages"`
	Name               string                     `json:"name"`
	MaxIdleTime        int                        `json:"maxIdleTime"`
	RTCConfig          *JoinReqRTCConfig          `json:"rtcConfig"`
	TranslateConfig    *JoinReqRTCTranslateConfig `json:"translateConfig,omitempty"`
	CaptionConfig      *JoinReqRTCCaptionConfig   `json:"captionConfig,omitempty"`
	UIdLanguagesConfig *UIdLanguageConfig         `json:"uidLanguagesConfig,omitempty"`
	ExtensionParams    map[string]any             `json:"extensionParams,omitempty"` // internal private params
}

type JoinReqRTCConfig struct {
	ChannelName          string   `json:"channelName"`
	SubBotUid            string   `json:"subBotUid"`
	SubBotToken          string   `json:"subBotToken"`
	PubBotUId            string   `json:"pubBotUid"`
	PubBotToken          string   `json:"pubBotToken"`
	SubscribeAudioUIds   []string `json:"subscribeAudioUids,omitempty"`
	UnSubscribeAudioUIds []string `json:"unSubscribeAudioUids,omitempty"`
	CryptionMode         *uint    `json:"cryptionMode,omitempty"`
	Secret               string   `json:"secret,omitempty"`
	Salt                 string   `json:"salt,omitempty"`
	EnableJsonProtocol   bool     `json:"enableJsonProtocol"`
}

type JoinReqRTCCaptionConfigStorage struct {
	AccessKey      string   `json:"accessKey"`
	SecretKey      string   `json:"secretKey"`
	Bucket         string   `json:"bucket"`
	Vendor         int      `json:"vendor"`
	Region         int      `json:"region"`
	FileNamePrefix []string `json:"fileNamePrefix"`
}

type JoinReqRTCCaptionConfig struct {
	SliceDuration *int                            `json:"sliceDuration,omitempty"`
	Storage       *JoinReqRTCCaptionConfigStorage `json:"storage,omitempty"`
}

type JoinReqRTCTranslateConfig struct {
	Languages []JoinReqRTCTranslateConfigLanguage `json:"languages"`
}

type JoinReqRTCTranslateConfigLanguage struct {
	Source string   `json:"source"`
	Target []string `json:"target"`
}

type TransAIRes struct {
	StatusCode int
	Body       map[string]any
	RequestId  string
}

// Top-level struct
type UpdateParam struct {
	Languages          []string            `json:"languages,omitempty"`
	UIdLanguagesConfig []UIdLanguageConfig `json:"uidLanguagesConfig,omitempty"`
	RTCConfig          *RTCConfig          `json:"rtcConfig,omitempty"`
	TranslateConfig    *TranslateConfig    `json:"translateConfig,omitempty"`
}

type UIdLanguageConfig struct {
	UId       string   `json:"uid"`
	Languages []string `json:"languages"`
}

type RTCConfig struct {
	SubscribeAudioUIds []string `json:"subscribeAudioUids"`
}

type TranslateConfig struct {
	Enable    bool       `json:"enable"`
	Languages []Language `json:"languages"`
}

type Language struct {
	Source string   `json:"source"`
	Target []string `json:"target"`
}

type BasicAuth struct {
	Username string
	Password string
}

type TransAIClient interface {
	Join(ctx context.Context, appId string, auth BasicAuth, req *JoinReq) (*TransAIRes, error)
	Update(ctx context.Context, appId string, auth BasicAuth, agentId string, sequenceId int64, updateMask string, req *UpdateParam) (*TransAIRes, error)
	Get(ctx context.Context, appId string, auth BasicAuth, agentId string) (*TransAIRes, error)
	Leave(ctx context.Context, appId string, auth BasicAuth, agentId string) (*TransAIRes, error)
}

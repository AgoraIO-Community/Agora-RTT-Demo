package req

type UpdatePathReq struct {
	AppId   string `uri:"appId" binding:"required"`
	AgentId string `uri:"agentId" binding:"required"`
}

type UpdateQueryReq struct {
	SequenceId int64  `form:"sequenceId" binding:"required"`
	UpdateMask string `form:"updateMask" binding:"required"`
}

type UpdateBodyReq struct {
	AuthUsername string `json:"authUsername"`
	AuthPassword string `json:"authPassword"`

	Languages          []string            `json:"languages"`
	UIdLanguagesConfig []UIdLanguageConfig `json:"uidLanguagesConfig"`
	RTCConfig          *RTCConfig          `json:"rtcConfig"`
	TranslateConfig    *TranslateConfig    `json:"translateConfig"`
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

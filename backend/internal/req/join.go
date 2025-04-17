package req

type JoinPathReq struct {
	AppId string `uri:"appId" binding:"required"`
}

type JoinBodyReq struct {
	AuthUsername string   `json:"authUsername"`
	AuthPassword string   `json:"authPassword"`
	AppCert      string   `json:"appCert"`
	Languages    []string `json:"languages"`
	MaxIdleTime  int      `json:"maxIdleTime"`
	Name         string   `json:"name"`
	RTCConfig    struct {
		ChannelName          string   `json:"channelName"`
		SubBotUid            string   `json:"subBotUid"`
		PubBotUid            string   `json:"pubBotUid"`
		SubscribeAudioUIds   []string `json:"subscribeAudioUids"`
		UnSubscribeAudioUIds []string `json:"unSubscribeAudioUids"`
		CryptionMode         *uint    `json:"cryptionMode"`
		Secret               string   `json:"secret"`
		Salt                 string   `json:"salt"`
		EnableJsonProtocol   bool     `json:"enableJsonProtocol"`
	} `json:"rtcConfig"`
	CaptionConfig *struct {
		SliceDuration *int `json:"sliceDuration"`
		Storage       *struct {
			AccessKey      string   `json:"accessKey"`
			SecretKey      string   `json:"secretKey"`
			Bucket         string   `json:"bucket"`
			Vendor         int      `json:"vendor"`
			Region         int      `json:"region"`
			FileNamePrefix []string `json:"fileNamePrefix"`
		} `json:"storage"`
	}
	TranslateConfig struct {
		Languages []struct {
			Source string   `json:"source"`
			Target []string `json:"target"`
		} `json:"languages"`
	} `json:"translateConfig"`
	ExtensionParams map[string]any `json:"extensionParams"` // internal private params
}

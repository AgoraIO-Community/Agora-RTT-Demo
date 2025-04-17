package req

type LeavePathReq struct {
	AppId   string `uri:"appId" binding:"required"`
	AgentId string `uri:"agentId" binding:"required"`
}

type LeaveBodyReq struct {
	AuthUsername string `json:"authUsername"`
	AuthPassword string `json:"authPassword"`
}

package impl

import (
	"context"

	accessTokenBuilder "github.com/AgoraIO/Tools/DynamicKey/AgoraDynamicKey/go/src/accesstoken2"

	"agora.io/rtt-demo/internal/service"
)

type TokenClientImpl struct{}

func NewTokenClientImpl() *TokenClientImpl {
	return &TokenClientImpl{}
}

const (
	TokenTypeRTC = iota + 1
	TokenTypeRTM
	TokenTypeChat
)

var _ service.AgoraToken = (*TokenClientImpl)(nil)

func (t *TokenClientImpl) Generate(_ context.Context, params service.TokenGenerateParams) (string, error) {
	accessToken := accessTokenBuilder.NewAccessToken(params.AppID, params.AppCert, params.Expire)

	for _, tokenType := range params.Types {
		switch tokenType {
		case TokenTypeRTC:
			serviceRtc := accessTokenBuilder.NewServiceRtc(params.ChannelName, params.UID)
			serviceRtc.AddPrivilege(accessTokenBuilder.PrivilegeJoinChannel, params.Expire)
			serviceRtc.AddPrivilege(accessTokenBuilder.PrivilegePublishAudioStream, params.Expire)
			serviceRtc.AddPrivilege(accessTokenBuilder.PrivilegePublishVideoStream, params.Expire)
			serviceRtc.AddPrivilege(accessTokenBuilder.PrivilegePublishDataStream, params.Expire)
			accessToken.AddService(serviceRtc)
		case TokenTypeRTM:
			serviceRtm := accessTokenBuilder.NewServiceRtm(params.UID)
			serviceRtm.AddPrivilege(accessTokenBuilder.PrivilegeLogin, params.Expire)
			accessToken.AddService(serviceRtm)
		case TokenTypeChat:
			serviceChat := accessTokenBuilder.NewServiceChat(params.UID)
			serviceChat.AddPrivilege(accessTokenBuilder.PrivilegeChatUser, params.Expire)
			accessToken.AddService(serviceChat)
		}
	}

	return accessToken.Build()
}

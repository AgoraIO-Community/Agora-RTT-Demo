package service

import "context"

type TokenGenerateParams struct {
	AppID       string
	AppCert     string
	ChannelName string
	Expire      uint32
	Types       []uint
	UID         string
}

type AgoraToken interface {
	Generate(ctx context.Context, params TokenGenerateParams) (string, error)
}

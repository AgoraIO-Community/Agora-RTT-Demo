import {
  UID,
  IAgoraRTCRemoteUser,
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  NetworkQuality,
} from "agora-rtc-sdk-ng"
import { ITextItem } from "../parser"

export interface IRtcUser extends IUserTracks {
  userId: UID
}

export interface RtcEvents {
  remoteUserChanged: (user: IRtcUser) => void
  localUserChanged: (tracks: IUserTracks) => void
  networkQuality: (quality: NetworkQuality) => void
  textAdd: (text: ITextItem) => void
  textstreamReceived: (textstream: any) => void
}

export interface IUserTracks {
  videoTrack?: ICameraVideoTrack
  audioTrack?: IMicrophoneAudioTrack
}

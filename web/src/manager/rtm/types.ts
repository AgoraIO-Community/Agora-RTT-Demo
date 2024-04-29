import { STTLanguages, STTStatus } from "@/types"
import { RTMEvents } from "agora-rtm"

export interface ISimpleUserInfo {
  userName: string
  userId: string
}

export interface ILanguageChangedItem {
  transcribe: string[]
  translate: string[]
}

export interface RtmEvents {
  status: (
    status:
      | RTMEvents.RTMConnectionStatusChangeEvent
      | RTMEvents.StreamChannelConnectionStatusChangeEvent,
  ) => void
  userListChanged: (userList: ISimpleUserInfo[]) => void
  languagesChanged: (languages: STTLanguages) => void
  sttStatusChanged: (status: STTStatus) => void
  hostChanged: (hostId: string) => void
}

export enum RtmMessageType {
  UserInfo = "UserInfo",
  BeHost = "BeHost",
  Transcription = "Transcription",
}

export type ValueOf<T> = T[keyof T]

export interface RtmPresenceMessageData {
  [RtmMessageType.UserInfo]?: {
    userName: string
    userId: string
    type: RtmMessageType.UserInfo
  }
  [RtmMessageType.BeHost]?: {
    userId: string
    type: RtmMessageType.BeHost
  }
  [RtmMessageType.Transcription]?: {
    status: "start" | "stop"
    type: RtmMessageType.Transcription
  }
}

export interface BaseRtmMessage {
  type: RtmMessageType
  [key: string]: any
}

export interface ILanguageItem {
  source: string
  target: string[]
}

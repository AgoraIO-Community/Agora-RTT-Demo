import { ILanguageSelect, ISttData, Role } from "@/types"
import { RTMEvents } from "agora-rtm"

export interface ISimpleUserInfo {
  userName: string
  userId: string
  languages: ILanguageItem[]
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
  languagesChanged: (languages: ILanguageSelect) => void
  sttDataChanged: (status: ISttData) => void
  joinRTMSuccess: () => void
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
    languages: ILanguageItem[]
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

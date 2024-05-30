import { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"

export type MenuType = "AI" | "DialogRecord"
export type STTStatus = "start" | "end"
export type STTDataType = "transcribe" | "translate"
export type DialogLanguageType = "live" | "translate"
export type InputStatuses = "warning" | "error" | ""

export interface IUserInfo {
  userName: string
  userId: number
}

export interface IOptions {
  language: string
  channel: string
}

export interface IUserData extends IUserInfo {
  isHost: boolean
  isLocal: boolean
  order: number
  videoTrack?: ICameraVideoTrack
  audioTrack?: IMicrophoneAudioTrack
}

export interface IRequestLanguages {
  source: string
  target: string[]
}

export interface ITranslationItem {
  lang: string
  text: string
}

export interface ITextItem {
  dataType: "transcribe" | "translate"
  uid: string | number
  time: number
  text: string
  isFinal: boolean
  username: string
  startTextTs: number // start time
  textTs: number // end time
  translations?: ITranslationItem[]
}

export interface IChatItem {
  userName: string
  content: string
  translations: ITranslationItem[]
  startTextTs: string | number
  textTs: string | number
  time: string | number
}

export interface IUICaptionData {
  content: string
  translate?: string
  userName: string
  translations?: ITranslationItem[]
}

export interface ILanguageSelect {
  transcribe1?: string
  translate1List?: string[]
  transcribe2?: string
  translate2List?: string[]
}

export interface IMessage {
  key?: number
  content: string
  type: "success" | "error" | "warning" | "info"
  duration?: number // s
}

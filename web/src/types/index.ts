import { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"

export interface IUserInfo {
  userName: string
  userId: number
}

export interface IOptions {
  language: string
  channel: string
}

export type MenuType = "AI" | "DialogRecord"

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

// export interface ITranslationItem {
//   language: string
//   comtent: string
// }
export interface IChatItem {
  userName: string
  content: string
  translations: [{ lang: string; text: string }?]
  startTextTs: string | number
  textTs: string | number
  time: string | number
}

// Subtitle
export interface ISubtitle {
  userName: string
  content: string
  translations: [ITranslationItem?]
  startTextTs: string | number
  textTs: string | number
  time: string | number
}

export interface STTLanguages {
  transcribe1?: string
  translate1: string[]
  transcribe2?: string
  translate2: string[]
}

export type STTStatus = "start" | "end"
export type STTDataType = "transcribe" | "translate"
export type DialogLanguageType = "live" | "translate"

export interface IUiText {
  userName: string
  text: string
  time: number
  isFinal?: boolean
  //
  translation: [string: string]
  startTextTs: number
  textTs: number
}

export interface IUICaptionData {
  content: string
  translate?: string
  userName: string
  translations?: [{ lang: string; text: string }?]
}

export interface IMessage {
  key?: number
  content: string
  type: "success" | "error" | "warning" | "info"
  duration?: number // s
}

export type InputStatuses = "warning" | "error" | ""

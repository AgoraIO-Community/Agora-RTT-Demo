import { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"

export type MenuType = "AI" | "DialogRecord"
export type STTDataType = "transcribe" | "translate"
export type DialogLanguageType = "live" | "translate"
export type InputStatuses = "warning" | "error" | ""
export type Role = "host" | "audience"

export interface ISttData {
  taskId?: string
  startTime?: number // ms
  duration?: number // ms
  status?: "start" | "end" | "default"
}

export interface IUserInfo {
  userName: string
  userId: number | string
  sourceLanguage?: string
}

export type LangDataType = "transcribe" | "translate"

export interface IOptions {
  language: string
  channel: string
}

export interface IUserData extends IUserInfo {
  isHost?: boolean
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
  dataType: LangDataType
  uid: string | number
  lang: string
  time: number
  timestamp: number
  text: string
  isFinal: boolean
  username: string
  startTextTs: number // start time
  textTs: number // end time
  translations?: ITranslationItem[]
  sentenceEndIndex: number
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
  isTranscribe: boolean
  isReceivedUserTranslations?: boolean
  uid: string | number
  lang: string
  time: string | number
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

export enum ROOM_TYPE {
  SINGLE = 1,
  MULTI = 2,
}

export const UPDATE_ERROR_TIP_KEY = 7000
export interface ITextstream {
  // basic information
  uid: string | number // user ID
  time: number // timestamp
  dataType: "transcribe" | "translate" // data type

  // transcribe related
  words?: Array<{
    // transcribe words array
    text: string // text content
    startMs: number // start time (relative to time)
    durationMs: number // duration
    isFinal?: boolean // whether it's the final result
  }>
  durationMs: number // total duration
  culture?: string // language region, e.g. "zh-CN"

  // timestamp related
  textTs: number // text processing timestamp
  startTextTs: number // start text processing timestamp

  // translate related
  trans?: Array<{
    // translate data array
    lang: string // language code
    texts: string[] // translate text array
    isFinal?: boolean // whether it's the final result
  }>

  // optional properties
  id?: string // message ID
  customId?: string // custom ID
  customData?: any // custom data
}

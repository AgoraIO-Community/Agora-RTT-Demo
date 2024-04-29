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

export interface IChatItem {
  userName: string
  content: string
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
}

export interface IUICaptionData {
  content: string
  translate?: string
  userName: string
}

export interface IMessage {
  key?: number
  content: string
  type: "success" | "error" | "warning" | "info"
  duration?: number // s
}

export type InputStatuses = "warning" | "error" | ""

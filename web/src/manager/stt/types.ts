import { RtmManager } from "../rtm"
import { IRequestLanguages } from "@/types"

export interface STTEvents {}

export interface STTManagerStartOptions {
  languages: IRequestLanguages[]
  denoise: boolean
}

export interface STTManagerOptions {
  token: string
  taskId: string
}

export interface STTManagerInitData {
  rtmManager: RtmManager
}

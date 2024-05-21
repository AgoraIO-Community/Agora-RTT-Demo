import { STTStatus, IRequestLanguages } from "@/types"

export interface STTEvents {}

export interface STTManagerStartOptions {
  uid: string | number
  channel: string
  languages: IRequestLanguages[]
}

export interface STTManagerOptions extends STTManagerStartOptions {
  token: string
  taskId: string
}

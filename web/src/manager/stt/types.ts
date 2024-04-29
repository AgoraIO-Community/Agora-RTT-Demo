import { STTStatus, IRequestLanguages } from "@/types"

export interface STTEvents {}

export interface STTManagerStartOptions {
  channel: string
  languages: IRequestLanguages[]
}

export interface STTManagerOptions extends STTManagerStartOptions {
  token: string
  taskId: string
}

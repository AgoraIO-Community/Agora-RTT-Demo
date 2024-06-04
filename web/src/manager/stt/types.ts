import { IRequestLanguages } from "@/types"

export interface STTEvents {}

export interface STTManagerStartOptions {
  languages: IRequestLanguages[]
}

export interface STTManagerOptions {
  token: string
  taskId: string
}

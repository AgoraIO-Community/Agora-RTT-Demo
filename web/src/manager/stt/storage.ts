import { STTManagerOptions } from "./types"

const STT_KEY = "__stt_options__"

export const DEFAULT_STT_OPTIONS: STTManagerOptions = {
  channel: "",
  languages: [],
  token: "",
  taskId: "",
}

export const getSTToptionsFromLocal = (): STTManagerOptions => {
  const options = localStorage.getItem(STT_KEY)
  return options ? JSON.parse(options) : JSON.parse(JSON.stringify(DEFAULT_STT_OPTIONS))
}

export const setSTToptionsToLocal = (options: Partial<STTManagerOptions>) => {
  const curOptions = getSTToptionsFromLocal()
  Object.assign(curOptions, options)
  localStorage.setItem(STT_KEY, JSON.stringify(curOptions))
}

export const removeSTToptionsFromLocal = () => {
  localStorage.removeItem(STT_KEY)
}

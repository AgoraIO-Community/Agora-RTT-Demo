import { getUserInfoFromLocal } from "./storage"
import { CAPTION_SCROLL_PX_LIST } from "./constant"
import { ITextItem, ILanguageSelect } from "@/types"

function _pad(num: number) {
  return num.toString().padStart(2, "0")
}

const _GPT_URL = import.meta.env.VITE_AGORA_GPT_URL

export const REGEX_SPECIAL_CHAR = /[^a-zA-Z0-9_]/g

export const getDefaultLanguage = (): string => {
  if (navigator.language) {
    if (navigator.language == "zh-CN" || navigator.language == "zh") {
      return "zh"
    }
  }

  return "en"
}

export const genRandomUserId = (): number => {
  return 100000 + Math.floor(+Math.random() * 100000)
}

export const isNoNeedLoginPath = (pathname: string) => {
  if (pathname === "/" || pathname == "/404" || pathname == "/login") {
    return true
  } else if (/test/.test(pathname)) {
    return true
  }

  return false
}

export const isLogin = () => {
  const userInfo = getUserInfoFromLocal()
  return !!userInfo.userId
}

// seconds s
// return mm:ss
export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${_pad(minutes)}:${_pad(remainingSeconds)}`
}

// ms
// return hh:mm:ss
export const formatTime2 = (ms: number | string) => {
  const date = new Date(Number(ms))
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()

  return `${_pad(hours)}:${_pad(minutes)}:${_pad(seconds)}`
}

export const isString = (str: any): str is string => {
  return typeof str === "string"
}

export const mapToArray = (map: Map<any, any>): any[] => {
  const res = []
  for (const [key, value] of map) {
    res.push(value)
  }
  return res
}

export const downloadText = (name: string, text: string) => {
  const link = document.createElement("a")
  link.download = `${name}`
  link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
  link.click()
}

export const genContentText = (list: ITextItem[]) => {
  let res = ""
  list.forEach((item) => {
    res += `${item.username}: ${item.text}\n`
  })
  return res
}

export const canElementScroll = (ele: HTMLElement) => {
  return ele.scrollHeight > ele.clientHeight
}

export const getElementScrollY = (ele: HTMLElement): number => {
  if (ele.scrollHeight <= ele.clientHeight) {
    return 0
  }
  return ele.scrollHeight - ele.clientHeight - ele.scrollTop
}

export const getCaptionScrollPX = (scroll: number = 0) => {
  for (let i = CAPTION_SCROLL_PX_LIST.length - 1; i >= 0; i--) {
    const item = CAPTION_SCROLL_PX_LIST[i]
    if (scroll >= item.distance) {
      return item.value
    }
  }
  return scroll
}

export const genUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const showAIModule = () => {
  return !!_GPT_URL
}

// example: isArabic("ar-EG") => true
export const isArabic = (lang: string) => {
  return lang.includes("ar-")
}

export const getDefaultLanguageSelect = (): ILanguageSelect => {
  return {
    transcribe1: undefined,
    translate1List: [],
    transcribe2: undefined,
    translate2List: [],
  }
}

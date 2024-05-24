import { getUserInfoFromLocal } from "./storage"
import { CAPTION_SCROLL_PX_LIST } from "./constant"

function _pad(num: number) {
  return num.toString().padStart(2, "0")
}

export const REGEX_SPECIAL_CHAR = /[^a-zA-Z0-9\s_]/g

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

export const formatTime = (seconds: number) => {
  // const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  // ${_pad(hours)}

  return `${_pad(minutes)}:${_pad(remainingSeconds)}`
}

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

// TODO:genContentText
export const genContentText = (list: any[]) => {
  let res = ""
  list.forEach((item) => {
    res += `${item.userName}: ${item.text}\n`
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

export const getCaptionScrollPX = (top: number = 0) => {
  for (let i = CAPTION_SCROLL_PX_LIST.length - 1; i >= 0; i--) {
    const item = CAPTION_SCROLL_PX_LIST[i]
    if (top >= item.distance) {
      return item.value
    }
  }
  return CAPTION_SCROLL_PX_LIST[0].value
}

export const genUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

import { IUserInfo, IOptions } from "@/types"
import { getDefaultLanguage } from "./utils"

const USER_INFO_KEY = "__user_info__"
const OPTIONS_KEY = "__options__"

export const DEFAULT_USER_INFO: IUserInfo = {
  userId: 0,
  userName: "",
}

export const DEFAULT_OPTIONS = {
  language: getDefaultLanguage(),
  channel: "",
}

export const getUserInfoFromLocal = (): IUserInfo => {
  const userInfo = localStorage.getItem(USER_INFO_KEY)
  return userInfo ? JSON.parse(userInfo) : JSON.parse(JSON.stringify(DEFAULT_USER_INFO))
}

export const setUserInfoToLocal = (userInfo: Partial<IUserInfo>) => {
  const curUserInfo = getUserInfoFromLocal()
  if (userInfo.userId) {
    curUserInfo.userId = userInfo.userId
  }
  if (userInfo.userName) {
    curUserInfo.userName = userInfo.userName
  }
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(curUserInfo))
}

export const removeUserInfoFromLocal = () => {
  localStorage.removeItem(USER_INFO_KEY)
}

export const getOptionsFromLocal = (): IOptions => {
  const options = localStorage.getItem(OPTIONS_KEY)
  return options ? JSON.parse(options) : JSON.parse(JSON.stringify(DEFAULT_OPTIONS))
}

export const setOptionsToLocal = (options: Partial<IOptions>) => {
  const curOptions = getOptionsFromLocal()
  if (options.language) {
    curOptions.language = options.language
  }
  if (options.channel) {
    curOptions.channel = options.channel
  }
  localStorage.setItem(OPTIONS_KEY, JSON.stringify(curOptions))
}

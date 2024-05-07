import {
  IUserInfo,
  IOptions,
  MenuType,
  STTStatus,
  STTLanguages,
  DialogLanguageType,
  IUiText,
  IMessage,
} from "@/types"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
  getOptionsFromLocal,
  getUserInfoFromLocal,
  setUserInfoToLocal,
  setOptionsToLocal,
} from "@/common/storage"
import { EXPERIENCE_DURATION } from "@/common/constant"
import { finalManager } from "@/common"
import { findLastIndex } from "lodash-es"

export interface InitialState {
  // ------- user state -------
  userInfo: IUserInfo
  options: IOptions
  hostId: number
  localVideoMute: boolean
  localAudioMute: boolean
  sttStatus: STTStatus
  sttCountDown: number // ms
  sttLanguages: STTLanguages
  dialogLanguageType: DialogLanguageType
  sttTranscribeTextList: IUiText[]
  sttTranslateTextMap: Record<string, IUiText[]> // string is the language code
  captionLanguages: string[]
  // ------- UI state -------
  memberListShow: boolean
  dialogRecordShow: boolean
  captionShow: boolean
  aiShow: boolean
  menuList: MenuType[]
  page: {
    width: number
    height: number
  }
  messageList: IMessage[]
}

const getInitialState = (): InitialState => {
  return {
    userInfo: getUserInfoFromLocal(),
    options: getOptionsFromLocal(),
    localVideoMute: true,
    localAudioMute: true,
    hostId: 0,
    sttTranscribeTextList: [],
    sttTranslateTextMap: {},
    sttCountDown: EXPERIENCE_DURATION,
    memberListShow: false,
    dialogRecordShow: false,
    captionShow: false,
    aiShow: false,
    captionLanguages: ["live"],
    sttLanguages: {
      transcribe1: undefined,
      translate1: [],
      transcribe2: undefined,
      translate2: [],
    },
    dialogLanguageType: "live",
    menuList: [],
    sttStatus: "end",
    page: {
      width: 0,
      height: 0,
    },
    messageList: [],
  }
}

export const globalSlice = createSlice({
  name: "global",
  initialState: getInitialState(),
  reducers: {
    setOptions: (state, action: PayloadAction<Partial<IOptions>>) => {
      Object.assign(state.options, action.payload)
      setOptionsToLocal(action.payload)
    },
    setUserInfo: (state, action: PayloadAction<Partial<IUserInfo>>) => {
      Object.assign(state.userInfo, action.payload)
      setUserInfoToLocal(action.payload)
    },
    setMemberListShow: (state, action: PayloadAction<boolean>) => {
      state.memberListShow = action.payload
    },
    setDialogRecordShow: (state, action: PayloadAction<boolean>) => {
      state.dialogRecordShow = action.payload
    },
    setCaptionShow: (state, action: PayloadAction<boolean>) => {
      state.captionShow = action.payload
    },
    setAIShow: (state, action: PayloadAction<boolean>) => {
      state.aiShow = action.payload
    },
    addMenuItem: (state, action: PayloadAction<MenuType>) => {
      const index = state.menuList.findIndex((item) => item === action.payload)
      if (index > -1) {
        state.menuList.splice(index, 1)
      }
      state.menuList.unshift(action.payload)
    },
    removeMenuItem: (state, action: PayloadAction<MenuType>) => {
      const index = state.menuList.findIndex((item) => item === action.payload)
      if (index > -1) {
        state.menuList.splice(index, 1)
      }
    },
    setHostId: (state, action: PayloadAction<number>) => {
      state.hostId = action.payload
    },
    setLocalVideoMute: (state, action: PayloadAction<boolean>) => {
      state.localVideoMute = action.payload
    },
    setLocalAudioMute: (state, action: PayloadAction<boolean>) => {
      state.localAudioMute = action.payload
    },
    setPageInfo: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.page = action.payload
    },
    setSTTStatus: (state, action: PayloadAction<STTStatus>) => {
      state.sttStatus = action.payload
    },
    setSttCountDown: (state, action: PayloadAction<number>) => {
      state.sttCountDown = action.payload
    },
    setDialogLanguageType: (state, action: PayloadAction<DialogLanguageType>) => {
      state.dialogLanguageType = action.payload
    },
    setSttLanguages: (state, action: PayloadAction<STTLanguages>) => {
      state.sttLanguages = action.payload
    },
    setCaptionLanguages: (state, action: PayloadAction<string[]>) => {
      state.captionLanguages = action.payload
    },
    addSttTranscribeText: (state, action: PayloadAction<IUiText>) => {
      const { payload } = action
      const { isFinal, userName } = payload
      const curLanguageTextList = state.sttTranscribeTextList
      const preIndex = finalManager.getIndex("live", userName)
      let nextIndex = preIndex
      if (curLanguageTextList[preIndex]?.isFinal) {
        nextIndex = curLanguageTextList.length
      }
      curLanguageTextList[nextIndex] = payload
      finalManager.setIndex("live", userName, nextIndex)
    },
    addSttTranslateText: (state, action: PayloadAction<{ language: string; text: IUiText }>) => {
      const { language, text } = action.payload
      const { isFinal, userName, time } = text
      if (!state.sttTranslateTextMap[language]) {
        state.sttTranslateTextMap[language] = []
      }
      const curLanguageTextList = state.sttTranslateTextMap[language]
      let index = findLastIndex(state.sttTranscribeTextList, (item) => {
        return item.userName === userName && item.time <= time
      })
      const preIndex = finalManager.getIndex(language, userName)
      index = index >= preIndex ? index : preIndex
      if (index >= 0) {
        curLanguageTextList[index] = text
        finalManager.setIndex(language, userName, index)
      }
    },
    resetSttText: (state) => {
      state.sttTranscribeTextList = []
      state.sttTranslateTextMap = {}
      finalManager.reset()
    },
    addMessage: (state, action: PayloadAction<IMessage>) => {
      state.messageList.push({
        ...action.payload,
        key: Date.now(),
      })
    },
    removeMessage: (state, action: PayloadAction<number>) => {
      const index = state.messageList.findIndex((item) => item.key === action.payload)
      if (index >= 0) {
        state.messageList.splice(index, 1)
      }
    },
    reset: (state) => {
      finalManager.reset()
      Object.assign(state, getInitialState())
    },
  },
})

export const {
  setOptions,
  setUserInfo,
  setMemberListShow,
  setDialogRecordShow,
  setCaptionShow,
  setAIShow,
  addMenuItem,
  removeMenuItem,
  setHostId,
  setLocalVideoMute,
  setLocalAudioMute,
  setPageInfo,
  setSTTStatus,
  setSttCountDown,
  setDialogLanguageType,
  setCaptionLanguages,
  setSttLanguages,
  addSttTranscribeText,
  addSttTranslateText,
  resetSttText,
  removeMessage,
  addMessage,
  reset,
} = globalSlice.actions

export default globalSlice.reducer

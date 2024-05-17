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
  // 20240515
  sttSubtitles: ITextItem[]
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
    sttSubtitles: [],
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
        return item?.userName === userName && item.time == time
      })
      if (index < 0) {
        index = findLastIndex(state.sttTranscribeTextList, (item) => {
          return item?.userName === userName && item.time < time
        })
        index = index >= 0 ? index + 1 : -1
      }
      if (index >= 0) {
        curLanguageTextList[index] = text
      }
    },
    updateSubtitles: (state, action: PayloadAction<{ textstream: object; username: string }>) => {
      const { payload } = action
      const { textstream, username } = payload
      console.log("[test] updateSubtitles payload: ", textstream)
      let tempList: ITextItem[] = []
      const { dataType, words, uid, culture, time, durationMs, textTs, trans } = textstream
      switch (dataType) {
        case "transcribe": {
          console.log("[test] textstream transcribe textStr", textstream)
          let textStr: string = ""
          let isFinal = false
          words.forEach((word: any) => {
            textStr += word.text
            if (word.isFinal) {
              isFinal = true
            }
          })
          const st = state.sttSubtitles.findLast((el) => {
            const flag = el.uid == textstream.uid && !el.isFinal
            return flag
          })
          console.log("[test] updateSubtitles: ", state.sttSubtitles)
          if (undefined == st) {
            const subtitle: ITextItem = {} as ITextItem
            // subtitle.isTranslate = false
            subtitle.dataType = "transcribe"
            subtitle.uid = textstream.uid
            subtitle.username = username
            subtitle.language = textstream.culture
            subtitle.text = textStr
            subtitle.isFinal = isFinal
            subtitle.time = textstream.time + textstream.durationMs
            subtitle.startTextTs = textstream.textTs
            subtitle.textTs = textstream.textTs
            tempList = state.sttSubtitles
            console.log("[test] transcribe received[new]:", subtitle)
            const nextIndex = tempList.length
            console.log("[test] updateSubtitles: tempList.length", nextIndex)
            tempList[nextIndex] = subtitle
            console.log("[test] transcribe received[new] tempList:", tempList)
            console.log("[test] transcribe received[new] tempList[0]:", tempList[0])
            // tempList.push(subtitle)
            // state.sttSubtitles = tempList
            // state.sttSubtitles.push(subtitle)
          } else {
            st.text = textStr
            st.isFinal = isFinal
            st.time = textstream.time + textstream.durationMs
            st.textTs = textstream.textTs
            // subtitles.push(st)
            console.log("[test] transcribe received[update]:", st)
          }
          break
        }
        case "translate": {
          // console.log("[test] subtitles: ", subtitles)
          console.log("[test] textstream translate textStr", textstream)
          const st = state.sttSubtitles.findLast((el) => {
            const flag =
              el.uid == textstream.uid &&
              (textstream.textTs >= el.startTextTs || textstream.textTs <= el.textTs)
            return flag
          })
          if (undefined == st) {
            // console.log("[test] Can not find subtitle")
            // callback(false, undefined)
            return
          }
          // console.log("[test] select subtitle: ", st)
          textstream.trans.forEach(
            (transItem: { lang: string; texts: any[]; isFinal: boolean }) => {
              // console.log("[test] transItem", transItem)
              if (undefined == st.translations) {
                // console.log("[test] init translations")
                st.translations = []
              }
              const t = st.translations.findLast((el: ITranslationItem) => {
                return el.lang == transItem.lang
              })
              if (undefined == t) {
                console.log("[test] init translation: ", st.translations)
                st.translations.push({ lang: transItem.lang, text: transItem.texts.join("") })
              } else {
                console.log("[test] update translation: ", st.translations)
                t.text = transItem.texts.join("")
              }
            },
          )
        }
      }
      console.log("[test] updateSubtitles state.subtitles: ", state.sttSubtitles)
      console.log(
        "[test] updateSubtitles state.sttTranscribeTextList: ",
        state.sttTranscribeTextList,
      )
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
  updateSubtitles,
  resetSttText,
  removeMessage,
  addMessage,
  reset,
} = globalSlice.actions

export default globalSlice.reducer

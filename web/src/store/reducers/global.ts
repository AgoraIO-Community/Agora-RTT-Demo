import {
  IUserInfo,
  IOptions,
  MenuType,
  ISttData,
  ILanguageSelect,
  DialogLanguageType,
  IMessage,
  ITextItem,
} from "@/types"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
  getOptionsFromLocal,
  getUserInfoFromLocal,
  setUserInfoToLocal,
  setOptionsToLocal,
} from "@/common/storage"
import { ITextstream } from "@/manager"
// common/hook will use store, so we don't import @/common
import { getDefaultLanguageSelect } from "@/common/utils"

export interface InitialState {
  // ------- stt --------------
  sttData: ISttData
  // ------- url --------------
  queryData: {
    [key: string]: string
  }
  // ------- user state -------
  userInfo: IUserInfo
  options: IOptions
  localVideoMute: boolean
  localAudioMute: boolean
  captionLanguages: ILanguageSelect // caption languages select
  languageSelect: ILanguageSelect // trans language select
  recordLanguages: ILanguageSelect // record language select
  sttSubtitles: ITextItem[]
  // ------- UI state -------
  memberListShow: boolean
  dialogRecordShow: boolean
  captionShow: boolean
  aiShow: boolean
  tipSTTEnable: boolean
  menuList: MenuType[]
  page: {
    width: number
    height: number
  }
  messageList: IMessage[]
}

const getInitialState = (): InitialState => {
  return {
    sttData: {
      status: "end",
    },
    queryData: {},
    userInfo: getUserInfoFromLocal(),
    options: getOptionsFromLocal(),
    localVideoMute: true,
    localAudioMute: true,
    memberListShow: false,
    dialogRecordShow: false,
    captionShow: false,
    aiShow: false,
    captionLanguages: {},
    sttSubtitles: [],
    languageSelect: getDefaultLanguageSelect(),
    recordLanguages: {},
    menuList: [],
    tipSTTEnable: false,
    page: {
      width: 0,
      height: 0,
    },
    messageList: [],
  }
}

const genSubtitle = (
  textstream: ITextstream,
  username: string,
  textStr: string,
  isFinal: boolean,
): ITextItem => {
  const { dataType, uid, culture, sentenceEndIndex } = textstream

  const data: ITextItem = {
    dataType,
    uid,
    username,
    text: textStr,
    lang: culture,
    lastUpateIndex: isFinal ? textStr.length : 0,
    isFinal: typeof sentenceEndIndex == "number" && sentenceEndIndex >= 0,
    time: textstream.time + textstream.durationMs,
    startTextTs: textstream.textTs,
    textTs: textstream.textTs,
  }

  return data
}

export const globalSlice = createSlice({
  name: "global",
  initialState: getInitialState(),
  reducers: {
    setOptions: (state, action: PayloadAction<Partial<IOptions>>) => {
      Object.assign(state.options, action.payload)
      setOptionsToLocal(action.payload)
    },
    setQueryData: (state, action: PayloadAction<{ [key: string]: string }>) => {
      state.queryData = action.payload
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
    setLocalVideoMute: (state, action: PayloadAction<boolean>) => {
      state.localVideoMute = action.payload
    },
    setLocalAudioMute: (state, action: PayloadAction<boolean>) => {
      state.localAudioMute = action.payload
    },
    setPageInfo: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.page = action.payload
    },
    setSttData: (state, action: PayloadAction<ISttData>) => {
      const { payload } = action
      state.sttData = payload
    },
    setLanguageSelect: (state, action: PayloadAction<ILanguageSelect>) => {
      state.languageSelect = action.payload
    },
    setRecordLanguages: (state, action: PayloadAction<ILanguageSelect>) => {
      state.recordLanguages = action.payload
    },
    setCaptionLanguages: (state, action: PayloadAction<ILanguageSelect>) => {
      state.captionLanguages = action.payload
    },
    setSubtitles: (state, action: PayloadAction<ITextItem[]>) => {
      state.sttSubtitles = action.payload
    },
    setTipSTTEnable: (state, action: PayloadAction<boolean>) => {
      state.tipSTTEnable = action.payload
    },
    updateSubtitles: (
      state,
      action: PayloadAction<{ textstream: ITextstream; username: string }>,
    ) => {
      const { payload } = action
      const { textstream, username } = payload
      const { dataType, words, sentenceEndIndex } = textstream
      switch (dataType) {
        case "transcribe": {
          console.log("[test] updateSubtitles transcribe", textstream)
          let textStr: string = ""
          let isStageFinal = false // stage final
          words.forEach((word: any) => {
            textStr += word.text
            if (word.isFinal) {
              isStageFinal = true
            }
          })
          const st = state.sttSubtitles.findLast((el) => {
            return el.uid == textstream.uid && !el.isFinal
          })
          if (!st) {
            // add new subtitle
            const newSubtitle = genSubtitle(textstream, username, textStr, isStageFinal)
            const tempList = state.sttSubtitles
            const nextIndex = tempList.length
            tempList[nextIndex] = newSubtitle
            // console.log("st.text add", newSubtitle.text)
          } else {
            // update subtitle
            const isLastUpdated = typeof sentenceEndIndex == "number" && sentenceEndIndex >= 0
            st.text = st.text.slice(0, st.lastUpateIndex) + textStr
            if (isStageFinal) {
              st.lastUpateIndex = st.text.length
            }
            st.time = textstream.time + textstream.durationMs
            st.textTs = textstream.textTs
            if (isLastUpdated) {
              st.isFinal = true
            } else {
              st.isFinal = false
            }
            // console.log("st.text update", st.text)
          }
          break
        }
        case "translate": {
          const st = state.sttSubtitles.findLast((el) => {
            return (
              el.uid == textstream.uid &&
              (textstream.textTs >= el.startTextTs || textstream.textTs <= el.textTs)
            )
          })
          if (!st) {
            return
          }
          console.log("[test] updateSubtitles translate", textstream)
          textstream.trans?.forEach((transItem) => {
            if (!st.translations) {
              st.translations = []
            }
            const target = st.translations.findLast((el) => {
              return el.lang == transItem.lang
            })
            if (!target) {
              st.translations.push({ lang: transItem.lang, text: transItem.texts.join("") })
            } else {
              target.text = transItem.texts.join("")
            }
          })
        }
      }
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
  setLocalVideoMute,
  setLocalAudioMute,
  setPageInfo,
  setSttData,
  setCaptionLanguages,
  setLanguageSelect,
  setRecordLanguages,
  updateSubtitles,
  setSubtitles,
  removeMessage,
  addMessage,
  setTipSTTEnable,
  setQueryData,
  reset,
} = globalSlice.actions

export default globalSlice.reducer

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
  setSttOptionsToLocal,
} from "@/common/storage"
import { ITextstream } from "@/manager"
// common/hook will use store, so we don't import @/common
import { getDefaultLanguageSelect } from "@/common/utils"
import { EXPERIENCE_DURATION } from "@/common/constant"

export interface InitialState {
  // ------- stt --------------
  sttData: ISttData
  sttCountDown: number // ms
  // ------- user state -------
  userInfo: IUserInfo
  options: IOptions
  localVideoMute: boolean
  localAudioMute: boolean
  captionLanguages: string[]
  captionLanguageSelect: ILanguageSelect
  recordLanguageSelect: ILanguageSelect
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
    sttData: {
      status: "end",
    },
    userInfo: getUserInfoFromLocal(),
    options: getOptionsFromLocal(),
    localVideoMute: true,
    localAudioMute: true,
    sttCountDown: EXPERIENCE_DURATION,
    memberListShow: false,
    dialogRecordShow: false,
    captionShow: false,
    aiShow: false,
    captionLanguages: ["live"],
    sttSubtitles: [],
    captionLanguageSelect: getDefaultLanguageSelect(),
    recordLanguageSelect: getDefaultLanguageSelect(),
    menuList: [],
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
      setSttOptionsToLocal({
        taskId: payload.taskId,
        token: payload.token,
      })
    },
    setSttCountDown: (state, action: PayloadAction<number>) => {
      state.sttCountDown = action.payload
    },
    setCaptionLanguageSelect: (state, action: PayloadAction<ILanguageSelect>) => {
      state.captionLanguageSelect = action.payload
    },
    setRecordLanguageSelect: (state, action: PayloadAction<ILanguageSelect>) => {
      state.recordLanguageSelect = action.payload
    },
    setCaptionLanguages: (state, action: PayloadAction<string[]>) => {
      state.captionLanguages = action.payload
    },
    updateSubtitles: (
      state,
      action: PayloadAction<{ textstream: ITextstream; username: string }>,
    ) => {
      const { payload } = action
      const { textstream, username } = payload
      const { dataType, words } = textstream
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
            return el.uid == textstream.uid && !el.isFinal
          })
          if (!st) {
            const subtitle: ITextItem = {
              dataType: "transcribe",
              uid: textstream.uid,
              username,
              text: textStr,
              isFinal,
              time: textstream.time + textstream.durationMs,
              startTextTs: textstream.textTs,
              textTs: textstream.textTs,
            }
            const tempList = state.sttSubtitles
            const nextIndex = tempList.length
            tempList[nextIndex] = subtitle
          } else {
            st.text = textStr
            st.isFinal = isFinal
            st.time = textstream.time + textstream.durationMs
            st.textTs = textstream.textTs
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
          textstream.trans?.forEach(
            (transItem: { lang: string; texts: any[]; isFinal: boolean }) => {
              if (!st.translations) {
                st.translations = []
              }
              const t = st.translations.findLast((el) => {
                return el.lang == transItem.lang
              })
              if (!t) {
                st.translations.push({ lang: transItem.lang, text: transItem.texts.join("") })
              } else {
                t.text = transItem.texts.join("")
              }
            },
          )
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
  setSttCountDown,
  setCaptionLanguages,
  setCaptionLanguageSelect,
  setRecordLanguageSelect,
  updateSubtitles,
  removeMessage,
  addMessage,
  reset,
} = globalSlice.actions

export default globalSlice.reducer

import {
  IUserInfo,
  IOptions,
  MenuType,
  STTStatus,
  STTLanguages,
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
import { EXPERIENCE_DURATION } from "@/common/constant"

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
  captionLanguages: string[]
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
    setSttLanguages: (state, action: PayloadAction<STTLanguages>) => {
      state.sttLanguages = action.payload
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
  setHostId,
  setLocalVideoMute,
  setLocalAudioMute,
  setPageInfo,
  setSTTStatus,
  setSttCountDown,
  setCaptionLanguages,
  setSttLanguages,
  updateSubtitles,
  removeMessage,
  addMessage,
  reset,
} = globalSlice.actions

export default globalSlice.reducer

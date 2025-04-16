import {
  IUserInfo,
  IOptions,
  MenuType,
  ISttData,
  ILanguageSelect,
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
import { getDefaultLanguageSelect } from "@/common/utils"

export interface InitialState {
  // ------- stt --------------
  sttData: ISttData
  // ------- user state -------
  userInfo: IUserInfo
  options: IOptions
  localVideoMute: boolean
  localAudioMute: boolean
  captionLanguages: string[]
  languageSelect: ILanguageSelect
  recordLanguageSelect: {
    translate1List?: string[]
    translate2List?: string[]
  }
  sttSubtitles: ITextItem[]
  // ------- remote user state -------
  currentSpeaker: number
  remoteUserList: Map<number, IUserInfo>
  // ------- UI state -------
  languageSettingShow: boolean
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
  isUpdating: boolean
  messageList: IMessage[]
}

const getInitialState = (): InitialState => {
  return {
    sttData: {
      status: "default",
    },
    currentSpeaker: 0,
    remoteUserList: new Map(),
    userInfo: getUserInfoFromLocal(),
    options: getOptionsFromLocal(),
    localVideoMute: true,
    localAudioMute: true,
    memberListShow: false,
    languageSettingShow: false,
    dialogRecordShow: false,
    captionShow: false,
    aiShow: false,
    captionLanguages: ["live"],
    // local debugger
    // sttSubtitles: data,
    sttSubtitles: [],
    languageSelect: getDefaultLanguageSelect(),
    recordLanguageSelect: {},
    menuList: [],
    tipSTTEnable: false,
    isUpdating: false,
    page: {
      width: 0,
      height: 0,
    },
    messageList: [],
  }
}

function insertSortedSubtitle(subtitles: ITextItem[], subtitle: ITextItem) {
  const index = subtitles.findIndex(
    (item) => item.textTs > subtitle.textTs || item.textTs === subtitle.textTs,
  )

  if (index === -1) {
    subtitles.push(subtitle)
  } else {
    subtitles.splice(index, 0, subtitle)
  }
}

export const globalSlice = createSlice({
  name: "global",
  initialState: getInitialState(),
  reducers: {
    setIsUpdating: (state, action: PayloadAction<boolean>) => {
      state.isUpdating = action.payload
    },
    setOptions: (state, action: PayloadAction<Partial<IOptions>>) => {
      Object.assign(state.options, action.payload)
      setOptionsToLocal(action.payload)
    },
    setUserInfo: (state, action: PayloadAction<Partial<IUserInfo>>) => {
      Object.assign(state.userInfo, action.payload)
      setUserInfoToLocal(action.payload)
    },
    setCurrentSpeaker: (state, action: PayloadAction<number>) => {
      state.currentSpeaker = action.payload
      console.log("currentSpeaker Current", action.payload)
    },
    addRemoteUser: (state, action: PayloadAction<IUserInfo>) => {
      state.remoteUserList.set(Number(action.payload.userId), action.payload)
    },
    removeRemoteUser: (state, action: PayloadAction<number>) => {
      state.remoteUserList.delete(action.payload)
    },
    setRemoteUserList: (state, action: PayloadAction<IUserInfo[]>) => {
      state.remoteUserList.clear()
      action.payload.forEach((user) => {
        state.remoteUserList.set(Number(user.userId), user)
      })
    },
    setMemberListShow: (state, action: PayloadAction<boolean>) => {
      state.memberListShow = action.payload
    },
    setLanguageSettingShow: (state, action: PayloadAction<boolean>) => {
      state.languageSettingShow = action.payload
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
    setRecordLanguageSelect: (state, action: PayloadAction<ILanguageSelect>) => {
      state.recordLanguageSelect = action.payload
      const translateList = action.payload.translate1List || []
      state.captionLanguages =
        state.captionLanguages[0] === "live" ? ["live", ...translateList] : [...translateList]
    },
    setCaptionLanguages: (state, action: PayloadAction<string[]>) => {
      state.captionLanguages = action.payload
      state.recordLanguageSelect = {
        ...state.recordLanguageSelect,
        translate1List: action.payload.filter((item) => item !== "live"),
      }
    },
    setSubtitles: (state, action: PayloadAction<ITextItem[]>) => {
      state.sttSubtitles = action.payload
    },
    setTipSTTEnable: (state, action: PayloadAction<boolean>) => {
      state.tipSTTEnable = action.payload
    },
    pushSubtitles: (state, action: PayloadAction<ITextItem>) => {
      const data = action.payload.translations
      delete action.payload.translations
      state.sttSubtitles.push(action.payload as unknown as ITextItem)
    },
    setLastSubtitleTrans: (state, action: PayloadAction<ITextItem>) => {
      const data = action.payload.translations
      state.sttSubtitles[state.sttSubtitles.length - 1].translations = data
    },
    updateSubtitles: (
      state,
      action: PayloadAction<{ textstream: ITextstream; username: string }>,
    ) => {
      const { payload } = action
      const { textstream, username } = payload
      const { dataType, uid, time: timestamp, words, textTs, trans, sentenceEndIndex } = textstream

      switch (dataType) {
        case "transcribe": {
          console.log("[text] textstream transcribe:", textstream)

          // Basic validation
          if (!words?.length) return

          // Extract text and confirm if it's the final result
          let textStr = ""
          let isFinal = false
          words.forEach((word: any) => {
            textStr += word.text
            if (word.isFinal) {
              isFinal = true
            }
          })

          // Find the previous subtitle of the same sentence (non-final)
          const existingSubtitleIndex = state.sttSubtitles.findIndex(
            (el) => el.uid === uid && !el.isFinal,
          )

          if (existingSubtitleIndex !== -1) {
            // Update the existing subtitle, keeping startTextTs unchanged
            const subtitle = state.sttSubtitles[existingSubtitleIndex]

            // Check textTs, if the received message textTs is less than the existing one, it represents an outdated message, ignore
            if (textTs <= subtitle.textTs && !isFinal) {
              console.log("[test-warning] Ignoring outdated message:", textTs, "<", subtitle.textTs)
              return
            }

            // Update the existing subtitle
            state.sttSubtitles[existingSubtitleIndex] = {
              ...subtitle,
              text: textStr,
              isFinal,
              time: timestamp + (textstream.durationMs || 0),
              textTs,
              timestamp,
              sentenceEndIndex: textstream.sentenceEndIndex,
              lang: subtitle.lang || textstream.culture,
            }

            console.log("[text] Updated subtitle:", state.sttSubtitles[existingSubtitleIndex])
            // Ensure sttSubtitles are sorted by textTs in ascending order
            state.sttSubtitles.sort((a, b) => a.textTs - b.textTs)
          } else {
            if (!textStr) {
              console.log(
                "[test-warning] Empty text, ignoring message:",
                JSON.stringify(textstream),
              )
              return
            }
            // No previous subtitle was found, or the previous subtitle is already in the final state, check if it's a new sentence
            if (textTs <= state.sttSubtitles[state.sttSubtitles.length - 1]?.textTs && !isFinal) {
              console.log(
                "[test-warning] Ignoring outdated message:",
                textTs,
                "<",
                state.sttSubtitles[state.sttSubtitles.length - 1].textTs,
              )
              return
            }
            const newSubtitle: ITextItem = {
              dataType: "transcribe",
              uid,
              username,
              text: textStr,
              lang: textstream.culture,
              isFinal,
              time: timestamp + (textstream.durationMs || 0),
              startTextTs: textTs,
              textTs,
              timestamp,
              sentenceEndIndex: textstream.sentenceEndIndex,
            }

            console.log("[text] Created new subtitle:", newSubtitle)

            // Insert sort, ensure timestamp order
            insertSortedSubtitle(state.sttSubtitles, newSubtitle)
          }
          break
        }

        case "translate": {
          const st = state.sttSubtitles.findLast((el) => {
            return el.uid == textstream.uid && el.timestamp === textstream.time
          })

          if (!st) {
            // No subtitles were found that matched the time interval
            console.log("[test-warning] not found ", textstream.textTs)
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
          break
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
      // Reset redux status
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
  setLanguageSettingShow,
  setRecordLanguageSelect,
  updateSubtitles,
  setSubtitles,
  removeMessage,
  addMessage,
  setTipSTTEnable,
  reset,
  setIsUpdating,
  setCurrentSpeaker,
  pushSubtitles,
  setRemoteUserList,
  setLastSubtitleTrans,
} = globalSlice.actions

export default globalSlice.reducer

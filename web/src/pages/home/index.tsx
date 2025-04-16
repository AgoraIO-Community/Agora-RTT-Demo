import { useMount, useMessage, areArraysEqual } from "@/common"
import { IUserInfo, IUserData, ILanguageSelect, ISttData, UPDATE_ERROR_TIP_KEY } from "@/types"
import {
  RtcManager,
  RtmManager,
  ISimpleUserInfo,
  IUserTracks,
  IRtcUser,
  SttManager,
  ITextstream,
  ILanguageItem,
} from "@/manager"
import Header from "../../components/header"
import Footer from "../../components/footer"
import CenterArea from "../../components/center-area"
import UserList from "../../components/user-list"
import Caption from "../../components/caption"
import Menu from "../../components/menu"
import { RootState } from "@/store"
import {
  setLocalAudioMute,
  setLocalVideoMute,
  setLanguageSelect,
  reset,
  setCaptionShow,
  addMessage,
  setSttData,
  setSubtitles,
  setRecordLanguageSelect,
  setLanguageSettingShow,
  setCurrentSpeaker,
  pushSubtitles,
  setRemoteUserList,
  setLastSubtitleTrans,
  updateSubtitles,
} from "@/store/reducers/global"
import { useSelector, useDispatch } from "react-redux"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

import styles from "./index.module.scss"
import { Flex, Spin } from "antd"
import { set } from "lodash-es"
import { MAX_COUNT } from "@/components/dialog/language-setting"
import { UID } from "agora-rtc-sdk-ng/esm"

console.log("[test] style", styles)

const rtcManager = new RtcManager()
const rtmManager = new RtmManager()
const sttManager = new SttManager({
  rtmManager,
})

window.rtcManager = rtcManager
window.rtmManager = rtmManager
window.sttManager = sttManager
const HomePage = () => {
  const dispatch = useDispatch()
  const nav = useNavigate()
  const { t } = useTranslation()
  const isMounted = useMount()
  useMessage()
  const localAudioMute = useSelector((state: RootState) => state.global.localAudioMute)
  const localVideoMute = useSelector((state: RootState) => state.global.localVideoMute)
  const userInfo = useSelector((state: RootState) => state.global.userInfo)
  const options = useSelector((state: RootState) => state.global.options)
  const memberListShow = useSelector((state: RootState) => state.global.memberListShow)
  const dialogRecordShow = useSelector((state: RootState) => state.global.dialogRecordShow)
  const captionShow = useSelector((state: RootState) => state.global.captionShow)
  const aiShow = useSelector((state: RootState) => state.global.aiShow)
  const sttData = useSelector((state: RootState) => state.global.sttData)
  const subtitles = useSelector((state: RootState) => state.global.sttSubtitles)
  const remoteUserList = useSelector((state: RootState) => state.global.remoteUserList)

  const { userId, userName } = userInfo
  const { channel } = options
  const [localTracks, setLocalTracks] = useState<IUserTracks>()
  const [userRtmList, setRtmUserList] = useState<ISimpleUserInfo[]>([])
  const [rtcUserMap, setRtcUserMap] = useState<Map<number | string, IRtcUser>>(new Map())
  const [centerUserId, setCenterUserId] = useState(userInfo.userId)
  const [loading, setLoading] = useState(true)
  const languageSelect = useSelector((state: RootState) => state.global.languageSelect)
  const languageSelectRef = useRef(languageSelect)
  const rtmUserListRef = useRef(userRtmList)
  const hasSttStartedRef = useRef(false)
  const globalState = useSelector((state: RootState) => state.global)
  console.log("subtitles", JSON.stringify(subtitles))

  useEffect(() => {
    // @ts-ignore
    window.reduxGlobalState = globalState
  }, [globalState])

  // init
  useEffect(() => {
    if (!userInfo.userId) {
      dispatch(addMessage({ content: "Please login first", type: "error" }))
      nav("/")
      window.location.reload()
      return
    }
    init()

    return () => {
      destroy()
    }
  }, [])

  useEffect(() => {
    let timer: any
    if (sttData.status == "start") {
      timer = setInterval(async () => {
        const now = new Date().getTime()
        if (sttData?.startTime && sttData?.duration) {
          if (now - sttData?.startTime > sttData?.duration) {
            try {
              console.log("[test] time limit stopTranscription")
              await window.sttManager.stopTranscription()
              return clearInterval(timer)
            } catch (error) {
              clearInterval(timer)
            }
          }
        }
      }, 5000)
      return
    }
    return () => {
      timer && clearInterval(timer)
    }
  }, [sttData])

  useEffect(() => {
    if (sttData.status == "start") {
      dispatch(
        setRecordLanguageSelect({
          translate1List: [],
          translate2List: [],
        }),
      )
      sttManager.setOption({
        taskId: sttData.taskId ?? "",
      })
      dispatch(setSubtitles([]))
      dispatch(addMessage({ content: t("setting.sttStart"), type: "success" }))
    } else if (sttData.status == "end") {
      sttManager.removeOption()
      dispatch(setCaptionShow(false))
      dispatch(addMessage({ content: t("setting.sttStop"), type: "success" }))
    }
    hasSttStartedRef.current = sttData.status == "start"
    // do not put isMounted in the dependencies
  }, [sttData.status])

  const simpleUserMap: Map<number | string, IUserInfo> = useMemo(() => {
    const map = new Map<number | string, IUserInfo>()
    for (let i = 0; i < userRtmList.length; i++) {
      const item = userRtmList[i]
      const userId = Number(item.userId)
      map.set(userId, {
        userId,
        userName: item.userName,
        sourceLanguage: item.languages ? item.languages.map((lang) => lang.source).join(",") : "",
      })
    }
    map.set(userInfo.userId, {
      userId: userInfo.userId,
      userName: userInfo.userName,
      sourceLanguage: languageSelect.transcribe1,
    })

    return map
  }, [userRtmList, userInfo])
  // listen events
  useEffect(() => {
    window.rtmManager.on("userListChanged", onRtmUserListChanged)
    window.rtmManager.on("joinRTMSuccess", onRtmJoinSuccess)
    window.rtmManager.on("languagesChanged", onLanguagesChanged)
    window.rtmManager.on("sttDataChanged", onSttDataChanged)
    window.rtcManager.on("localUserChanged", onLocalUserChanged)
    window.rtcManager.on("remoteUserChanged", onRemoteUserChanged)
    window.rtcManager.on("textstreamReceived", onTextStreamReceived)
    window.rtcManager.on("speakerChanged", onSpeakerChanged)

    return () => {
      window.rtmManager.off("userListChanged", onRtmUserListChanged)
      window.rtmManager.off("joinRTMSuccess", onRtmJoinSuccess)
      window.rtmManager.off("languagesChanged", onLanguagesChanged)
      window.rtmManager.off("sttDataChanged", onSttDataChanged)
      window.rtcManager.off("localUserChanged", onLocalUserChanged)
      window.rtcManager.off("remoteUserChanged", onRemoteUserChanged)
      window.rtcManager.off("speakerChanged", onSpeakerChanged)
      window.rtcManager.off("textstreamReceived", onTextStreamReceived)
    }
  }, [])

  useEffect(() => {
    localTracks?.videoTrack?.setEnabled(!localVideoMute)
  }, [localTracks?.videoTrack, localVideoMute])

  useEffect(() => {
    localTracks?.audioTrack?.setEnabled(!localAudioMute)
  }, [localTracks?.audioTrack, localAudioMute])

  const userDataList = useMemo(() => {
    const list: IUserData[] = []

    for (const item of simpleUserMap.values()) {
      const userId = item.userId
      const rtcUser = rtcUserMap.get(userId)
      const isCenterUser = userId === centerUserId
      const isLocalUser = userId === userInfo.userId
      list.push({
        userId,
        isLocal: isLocalUser,
        order: isCenterUser ? 1000 : 1,
        userName: `${item.userName}`,
        videoTrack: isLocalUser ? localTracks?.videoTrack : rtcUser?.videoTrack,
        audioTrack: isLocalUser ? localTracks?.audioTrack : rtcUser?.audioTrack,
        sourceLanguage: item.sourceLanguage,
      })
    }
    return list.sort((a, b) => b.order - a.order)
  }, [simpleUserMap, userInfo, localTracks, centerUserId, rtcUserMap])

  const init = async () => {
    await Promise.all([
      rtcManager.createTracks(),
      rtcManager.join({
        userId,
        channel,
      }),
      sttManager.init({
        userId: userId + "",
        userName,
        channel,
      }),
    ])

    await rtcManager.publish()
  }

  const destroy = async () => {
    if (hasSttStarted) {
      console.log("[test] destroy stopTranscription")
      await sttManager.stopTranscription()
    }
    hasSttStartedRef.current = false
    rtmUserListRef.current = []
    languageSelectRef.current = {}
    await Promise.all([rtcManager.destroy(), sttManager.destroy()])
    dispatch(reset())
  }

  const onLocalUserChanged = (tracks: IUserTracks) => {
    setLocalTracks(tracks)
    if (tracks.videoTrack) {
      dispatch(setLocalVideoMute(false))
    }
    if (tracks.audioTrack) {
      dispatch(setLocalAudioMute(false))
    }
  }

  const hasSttStarted = useMemo(() => {
    return sttData.status == "start"
  }, [sttData])

  const onRtmJoinSuccess = useCallback(() => {
    const { translate1List: transList = [] } = languageSelectRef.current
    console.log("[test] onRtmJoinSuccess", transList.length)
    setLoading(false)
    const query = new URLSearchParams(window.location.hash.split("?")[1])
    // const count = query.get("count") ? parseInt(query.get("count") || "", 10) : MAX_COUNT
    const count = MAX_COUNT
    if (transList.length > count || transList.length === count) {
      dispatch(setLanguageSettingShow(false))
      return
    }
    dispatch(setLanguageSettingShow(true))
  }, [languageSelectRef.current])

  useEffect(() => {
    if (hasSttStarted) {
      return
    }
    const { translate1List: transList = [] } = languageSelectRef.current

    const query = new URLSearchParams(window.location.hash.split("?")[1])
    // const count = query.get("count") ? parseInt(query.get("count") || "", 10) : MAX_COUNT
    const count = MAX_COUNT
    if (transList.length > count || transList.length === count) {
      dispatch(addMessage({ content: "Target language exceeds the limit", type: "error" }))
      dispatch(setLanguageSettingShow(false))
    }
  }, [languageSelectRef.current.translate1List?.length, hasSttStarted])

  const onRtmUserListChanged = (list: ISimpleUserInfo[]) => {
    setRtmUserList([...list])
    rtmUserListRef.current = [...list]
    try {
      const remoteUserList = list.map((item) => {
        console.log("item.languages,item.languages", item.languages)
        return {
          userId: item.userId,
          userName: item.userName,
          sourceLanguage: item.languages ? item.languages.map((lang) => lang.source).join(",") : "",
        }
      })
      dispatch(setRemoteUserList(remoteUserList))
    } catch (error) {
      console.log("[test] onRtmUserListChanged error", error)
    }
  }

  const onRemoteUserChanged = (user: IRtcUser) => {
    setRtcUserMap((prev) => {
      const newMap = new Map(prev)
      newMap.set(Number(user.userId), user)
      return newMap
    })
  }

  const onSttDataChanged = (data: ISttData) => {
    console.log("[test] onSttDataChanged", JSON.stringify(data))
    dispatch(
      setSttData({
        ...sttData,
        ...data,
      }),
    )
  }

  const getUserName = useCallback(
    (uid: string | number) => {
      if (remoteUserList.size === 0) {
        console.log("remoteUserList is empty")
        return
      }
      const user = remoteUserList.get(Number(uid))
      if (!user) {
        console.log(`User with uid ${uid} not found`, JSON.stringify(remoteUserList))
        return
      }
      return user.userName
    },
    [remoteUserList],
  )

  const onTextStreamReceived = useCallback(
    (textstream: ITextstream) => {
      // modify subtitle list
      const targetUser = rtmUserListRef.current.find(
        (item) => Number(item.userId) === Number(textstream.uid),
      )

      dispatch(
        updateSubtitles({
          textstream,
          username: targetUser?.userName || getUserName(textstream.uid) || "",
        }),
      )
    },
    [remoteUserList, rtmUserListRef.current],
  )

  const onLanguagesChanged = (languages: ILanguageSelect) => {
    console.log("[test] onLanguagesChanged1", languages, "hasSttStarted", hasSttStarted)

    console.log(
      "[test] onLanguagesChanged12",
      languageSelectRef.current,
      "hasSttStarted.ref",
      hasSttStartedRef.current,
    )

    dispatch(setLanguageSelect(languages))
    const prevLanguages = languageSelectRef.current
    languageSelectRef.current = languages

    if (!hasSttStartedRef.current) {
      return
    }
    if (!languages.transcribe1) {
      return
    }

    const sourceChanged = languages.transcribe1 !== prevLanguages.transcribe1
    const targetListChanged = !areArraysEqual(
      languages.translate1List || [],
      prevLanguages.translate1List || [],
    )

    if (sourceChanged || targetListChanged) {
      try {
        sttManager.updateTranscription({
          languages: [
            {
              source: languages.transcribe1,
              target: languages.translate1List ?? [],
            },
          ],
        })
      } catch (error: any) {
        console.log("[test] onLanguagesChanged error", error)
        if (error.message === "retry") {
          dispatch(
            addMessage({
              content: "update the target language ...",
              type: "info",
              duration: 5,
              key: UPDATE_ERROR_TIP_KEY,
            }),
          )
        }
      }
    }
  }

  const onSpeakerChanged = (user: UID) => {
    console.log("onSpeakerChanged currentSpeaker", user)
    dispatch(setCurrentSpeaker(Number(user)))
  }

  const onClickUserListItem = (data: IUserData) => {
    setCenterUserId(data.userId)
  }

  return (
    <Spin spinning={loading} wrapperClassName={styles.spin}>
      <Flex className={styles.homePage}>
        <div className={styles.homePage}>
          <Header style={{ flex: "0 0 48px" }} />
          {/* local debugger */}
          {/* <button onClick={addMorkData}>add data</button> */}
          <section className={styles.content}>
            {memberListShow ? (
              <div className={styles.left}>
                <UserList data={userDataList.slice(1)} onClickItem={onClickUserListItem}></UserList>
              </div>
            ) : null}
            <section className={styles.center}>
              <CenterArea data={userDataList[0]}></CenterArea>
              {dialogRecordShow || aiShow ? <Menu></Menu> : null}
            </section>
          </section>

          <Footer style={{ flex: "0 0 80px" }} />
          <Caption visible={captionShow}></Caption>
        </div>
      </Flex>
    </Spin>
  )
}

export default HomePage

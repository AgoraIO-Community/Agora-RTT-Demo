import { useMount, useMessage, useHost } from "@/common"
import { IUserInfo, IUserData, STTStatus, STTLanguages } from "@/types"
import {
  RtcManager,
  RtmManager,
  ISimpleUserInfo,
  IUserTracks,
  IRtcUser,
  SttManager,
  ITextstream,
} from "@/manager"
import Header from "../../components/header"
import Footer from "../../components/footer"
import CenterArea from "../../components/center-area"
import UserList from "../../components/user-list"
import Caption from "../../components/caption"
import Menu from "../../components/menu"
import ExtendMessage from "../../components/extend-message"
import { RootState } from "@/store"
import {
  setHostId,
  setUserInfo,
  setLocalAudioMute,
  setLocalVideoMute,
  setSTTStatus,
  setSttLanguages,
  reset,
  setCaptionShow,
  addMessage,
  setSttCountDown,
  updateSubtitles,
} from "@/store/reducers/global"
import { useSelector, useDispatch } from "react-redux"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useLocation, useBeforeUnload } from "react-router-dom"
import { useTranslation } from "react-i18next"

import styles from "./index.module.scss"

const rtcManager = new RtcManager()
const rtmManager = new RtmManager()
const sttManager = new SttManager()

window.rtcManager = rtcManager
window.rtmManager = rtmManager
window.sttManager = sttManager

let hostStartSTT = false

const HomePage = () => {
  const dispatch = useDispatch()
  const nav = useNavigate()
  const { t } = useTranslation()
  const isMounted = useMount()
  const { contextHolder } = useMessage()
  const localAudioMute = useSelector((state: RootState) => state.global.localAudioMute)
  const localVideoMute = useSelector((state: RootState) => state.global.localVideoMute)
  const userInfo = useSelector((state: RootState) => state.global.userInfo)
  const options = useSelector((state: RootState) => state.global.options)
  const memberListShow = useSelector((state: RootState) => state.global.memberListShow)
  const dialogRecordShow = useSelector((state: RootState) => state.global.dialogRecordShow)
  const captionShow = useSelector((state: RootState) => state.global.captionShow)
  const aiShow = useSelector((state: RootState) => state.global.aiShow)
  const sttStatus = useSelector((state: RootState) => state.global.sttStatus)
  const sttCountDown = useSelector((state: RootState) => state.global.sttCountDown)
  const [localTracks, setLocalTracks] = useState<IUserTracks>()
  const [userRtmList, setRtmUserList] = useState<ISimpleUserInfo[]>([])
  const [rtcUserMap, setRtcUserMap] = useState<Map<number, IRtcUser>>(new Map())
  const [centerUserId, setCenterUserId] = useState(userInfo.userId)
  const [showExtendMessage, setShowExtendMessage] = useState(false)
  const { hostId, isHost } = useHost()

  useEffect(() => {
    let timer: any

    if (isHost && sttStatus == "start") {
      timer = setTimeout(async () => {
        if (sttCountDown <= 0) {
          await Promise.all([
            window.sttManager.stopTranscription(),
            window.rtmManager.setSttStatus("end"),
          ])
          setShowExtendMessage(true)
          return clearTimeout(timer)
        }

        dispatch(setSttCountDown(sttCountDown - 1000))
      }, 1000)
    }

    return () => {
      timer && clearTimeout(timer)
    }
  }, [sttStatus, sttCountDown, isHost])

  // host auto stop stt
  useEffect(() => {
    const onHashchange = () => {
      if (isHost && sttStatus === "start") {
        sttManager.stopTranscription()
        rtmManager.setSttStatus("end")
      }
    }

    window.addEventListener("hashchange", onHashchange)

    if (isHost && sttStatus == "start") {
      hostStartSTT = true
    } else {
      hostStartSTT = false
    }

    return () => {
      window.removeEventListener("hashchange", onHashchange)
    }
  }, [isHost, sttStatus])

  // init
  useEffect(() => {
    if (!userInfo.userId) {
      dispatch(addMessage({ content: "Please login first", type: "error" }))
      nav("/")
    }
    init()

    return () => {
      destory()
    }
  }, [])

  useEffect(() => {
    if (isMounted) {
      if (sttStatus == "end") {
        dispatch(setCaptionShow(false))
        dispatch(addMessage({ content: t("setting.sttStopped"), type: "success" }))
      } else {
        setShowExtendMessage(false)
        dispatch(addMessage({ content: t("setting.sttStarted"), type: "success" }))
      }
    }
  }, [sttStatus])

  const simpleUserMap: Map<number, IUserInfo> = useMemo(() => {
    const map = new Map<number, IUserInfo>()
    for (let i = 0; i < userRtmList.length; i++) {
      const item = userRtmList[i]
      const userId = Number(item.userId)
      map.set(userId, {
        userId,
        userName: item.userName,
      })
    }
    map.set(userInfo.userId, {
      userId: userInfo.userId,
      userName: userInfo.userName,
    })

    return map
  }, [userRtmList, userInfo])

  // listen events
  useEffect(() => {
    window.rtmManager.on("userListChanged", onRtmUserListChanged)
    window.rtmManager.on("hostChanged", onHostChanged)
    window.rtmManager.on("languagesChanged", onLanguagesChanged)
    window.rtmManager.on("sttStatusChanged", onSTTStatusChanged)
    window.rtcManager.on("localUserChanged", onLocalUserChanged)
    window.rtcManager.on("remoteUserChanged", onRemoteUserChanged)
    window.rtcManager.on("textstreamReceived", onTextStreamReceived)

    return () => {
      window.rtmManager.off("userListChanged", onRtmUserListChanged)
      window.rtmManager.off("hostChanged", onHostChanged)
      window.rtmManager.off("languagesChanged", onLanguagesChanged)
      window.rtmManager.off("sttStatusChanged", onSTTStatusChanged)
      window.rtcManager.off("localUserChanged", onLocalUserChanged)
      window.rtcManager.off("remoteUserChanged", onRemoteUserChanged)
      window.rtcManager.off("textstreamReceived", onTextStreamReceived)
    }
  }, [simpleUserMap])

  useEffect(() => {
    localTracks?.videoTrack?.setMuted(localVideoMute)
  }, [localTracks?.videoTrack, localVideoMute])

  useEffect(() => {
    localTracks?.audioTrack?.setMuted(localAudioMute)
  }, [localTracks?.audioTrack, localAudioMute])

  const userDataList = useMemo(() => {
    const list: IUserData[] = []

    for (const item of simpleUserMap.values()) {
      const userId = item.userId
      const rtcUser = rtcUserMap.get(userId)
      const isHost = item.userId === hostId
      const isCenterUser = userId === centerUserId
      const isLocalUser = userId === userInfo.userId
      list.push({
        userId,
        isHost,
        isLocal: isLocalUser,
        order: isCenterUser ? 1000 : isHost ? 100 : 1,
        userName: item.userName,
        videoTrack: isLocalUser ? localTracks?.videoTrack : rtcUser?.videoTrack,
        audioTrack: isLocalUser ? localTracks?.audioTrack : rtcUser?.audioTrack,
      })
    }
    return list.sort((a, b) => b.order - a.order)
  }, [simpleUserMap, userInfo, localTracks, centerUserId, rtcUserMap, hostId])

  const curUserData = useMemo(() => {
    return userDataList[0] as IUserData
  }, [userDataList])

  const init = async () => {
    const userId = userInfo.userId
    const channel = options.channel
    const userName = userInfo.userName
    await Promise.all([
      rtcManager.createTracks(),
      rtcManager.join({
        userId,
        channel,
      }),
      rtmManager.join({
        userId: userId + "",
        channel,
      }),
    ])
    await rtmManager.updateUserInfo({
      userId: userId + "",
      userName,
    })
    await rtcManager.publish()
  }

  const destory = async () => {
    try {
      if (hostStartSTT) {
        hostStartSTT = false
        await Promise.all([sttManager.stopTranscription(), rtmManager.setSttStatus("end")])
      }
    } catch (e) {
      // don't block rtc/rtm destory
      console.error("[test] destory error", e)
    }
    await Promise.all([rtcManager.destroy(), rtmManager.destroy()])
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

  const onRtmUserListChanged = (list: ISimpleUserInfo[]) => {
    console.log("[test] onRtmUserListChanged", list)
    setRtmUserList(list)
  }

  const onHostChanged = (hostId: string) => {
    console.log("[test] onHostChanged", hostId)
    dispatch(setHostId(Number(hostId)))
  }

  const onRemoteUserChanged = (user: IRtcUser) => {
    setRtcUserMap((prev) => {
      const newMap = new Map(prev)
      newMap.set(Number(user.userId), user)
      return newMap
    })
  }

  const onSTTStatusChanged = (status: STTStatus) => {
    console.log("[test] onSTTStatusChanged", status)
    dispatch(setSTTStatus(status))
  }

  const onTextStreamReceived = (textstream: ITextstream) => {
    console.log("[test] HomePage onTextStreamReceived: ", textstream)
    // modify subtitle list
    const targetUser = simpleUserMap.get(Number(textstream.uid))
    dispatch(updateSubtitles({ textstream, username: targetUser?.userName || "" }))
  }

  const onLanguagesChanged = (languages: STTLanguages) => {
    console.log("[test] onLanguagesChanged", languages)
    dispatch(setSttLanguages(languages))
  }

  const onClickUserListItem = (data: IUserData) => {
    setCenterUserId(data.userId)
  }

  return (
    <div className={styles.homePage}>
      {contextHolder}
      <Header style={{ flex: "0 0 48px" }} />
      <section className={styles.content}>
        {memberListShow ? (
          <div className={styles.left}>
            <UserList data={userDataList.slice(1)} onClickItem={onClickUserListItem}></UserList>
          </div>
        ) : null}
        <section className={styles.center}>
          <CenterArea data={curUserData}></CenterArea>
        </section>
        {dialogRecordShow || aiShow ? (
          <section className={styles.right}>
            <Menu></Menu>
          </section>
        ) : null}
      </section>
      <Footer style={{ flex: "0 0 80px" }} />
      <Caption visible={captionShow}></Caption>
      <ExtendMessage
        open={showExtendMessage}
        onClose={() => setShowExtendMessage(false)}
      ></ExtendMessage>
    </div>
  )
}

export default HomePage

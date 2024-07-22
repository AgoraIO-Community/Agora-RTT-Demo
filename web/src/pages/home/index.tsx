import { useMount, useMessage } from "@/common"
import { IUserInfo, IUserData, ILanguageSelect, ISttData } from "@/types"
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
import { RootState } from "@/store"
import {
  setLocalAudioMute,
  setLocalVideoMute,
  setLanguageSelect,
  reset,
  setCaptionShow,
  addMessage,
  updateSubtitles,
  setSttData,
  setSubtitles,
  setRecordLanguageSelect,
} from "@/store/reducers/global"
import { useSelector, useDispatch } from "react-redux"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import styles from "./index.module.scss"

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
  const { contextHolder } = useMessage()
  const localAudioMute = useSelector((state: RootState) => state.global.localAudioMute)
  const localVideoMute = useSelector((state: RootState) => state.global.localVideoMute)
  const userInfo = useSelector((state: RootState) => state.global.userInfo)
  const options = useSelector((state: RootState) => state.global.options)
  const memberListShow = useSelector((state: RootState) => state.global.memberListShow)
  const dialogRecordShow = useSelector((state: RootState) => state.global.dialogRecordShow)
  const captionShow = useSelector((state: RootState) => state.global.captionShow)
  const aiShow = useSelector((state: RootState) => state.global.aiShow)
  const sttData = useSelector((state: RootState) => state.global.sttData)
  const { userId, userName } = userInfo
  const { channel } = options
  const [localTracks, setLocalTracks] = useState<IUserTracks>()
  const [userRtmList, setRtmUserList] = useState<ISimpleUserInfo[]>([])
  const [rtcUserMap, setRtcUserMap] = useState<Map<number | string, IRtcUser>>(new Map())
  const [centerUserId, setCenterUserId] = useState(userInfo.userId)

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
    let timer: any

    if (sttData.status == "start") {
      timer = setInterval(async () => {
        const now = new Date().getTime()
        if (sttData?.startTime && sttData?.duration) {
          if (now - sttData?.startTime > sttData?.duration) {
            await window.sttManager.stopTranscription()
            return clearInterval(timer)
          }
        }
      }, 5000)
    }

    return () => {
      timer && clearInterval(timer)
    }
  }, [sttData])

  useEffect(() => {
    if (isMounted) {
      if (sttData.status == "start") {
        dispatch(
          setRecordLanguageSelect({
            translate1List: [],
            translate2List: [],
          }),
        )
        sttManager.setOption({
          taskId: sttData.taskId ?? "",
          token: sttData.token ?? "",
        })
        dispatch(setSubtitles([]))
        dispatch(addMessage({ content: t("setting.sttStart"), type: "success" }))
      } else if (sttData.status == "end") {
        sttManager.removeOption()
        dispatch(setCaptionShow(false))
        dispatch(addMessage({ content: t("setting.sttStop"), type: "success" }))
      }
    }
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
    window.rtmManager.on("languagesChanged", onLanguagesChanged)
    window.rtmManager.on("sttDataChanged", onSttDataChanged)
    window.rtcManager.on("localUserChanged", onLocalUserChanged)
    window.rtcManager.on("remoteUserChanged", onRemoteUserChanged)
    window.rtcManager.on("textstreamReceived", onTextStreamReceived)

    return () => {
      window.rtmManager.off("userListChanged", onRtmUserListChanged)
      window.rtmManager.off("languagesChanged", onLanguagesChanged)
      window.rtmManager.off("sttDataChanged", onSttDataChanged)
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
      const isCenterUser = userId === centerUserId
      const isLocalUser = userId === userInfo.userId
      list.push({
        userId,
        isLocal: isLocalUser,
        order: isCenterUser ? 1000 : 1,
        userName: item.userName,
        videoTrack: isLocalUser ? localTracks?.videoTrack : rtcUser?.videoTrack,
        audioTrack: isLocalUser ? localTracks?.audioTrack : rtcUser?.audioTrack,
      })
    }
    return list.sort((a, b) => b.order - a.order)
  }, [simpleUserMap, userInfo, localTracks, centerUserId, rtcUserMap])

  const curUserData = useMemo(() => {
    return userDataList[0] as IUserData
  }, [userDataList])

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

  const destory = async () => {
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

  const onRtmUserListChanged = (list: ISimpleUserInfo[]) => {
    console.log("[test] onRtmUserListChanged", list)
    setRtmUserList(list)
  }

  const onRemoteUserChanged = (user: IRtcUser) => {
    setRtcUserMap((prev) => {
      const newMap = new Map(prev)
      newMap.set(Number(user.userId), user)
      return newMap
    })
  }

  const onSttDataChanged = (data: ISttData) => {
    console.log("[test] onSttDataChanged", data)
    dispatch(setSttData(data))
  }

  const onTextStreamReceived = (textstream: ITextstream) => {
    // modify subtitle list
    const targetUser = simpleUserMap.get(Number(textstream.uid))
    dispatch(updateSubtitles({ textstream, username: targetUser?.userName || "" }))
  }

  const onLanguagesChanged = (languages: ILanguageSelect) => {
    console.log("[test] onLanguagesChanged", languages)
    dispatch(setLanguageSelect(languages))
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
    </div>
  )
}

export default HomePage

import Avatar from "@/components/avatar"
import { useEffect, useMemo, useRef, useState } from "react"
import { IUserData } from "@/types"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { MicIcon, HostIcon } from "@/components/icons"
import { LocalStreamPlayer, RemoteStreamPlayer } from "../stream-player"

import styles from "./index.module.scss"

export const RATIO = 1.777778

interface ICenterAreaProps {
  data: IUserData
}

interface IArea {
  width: number
  height: number
}

const CenterArea = (props: ICenterAreaProps) => {
  const { data } = props
  const userInfo = useSelector((state: RootState) => state.global.userInfo)
  const localAudioMute = useSelector((state: RootState) => state.global.localAudioMute)
  const localVideoMute = useSelector((state: RootState) => state.global.localVideoMute)
  const centerAreaRef = useRef<HTMLDivElement>(null)
  const [centerArea, setCenterArea] = useState<IArea>({ width: 0, height: 0 })

  const videoMute = useMemo(() => {
    if (data.isLocal) {
      return localVideoMute
    }
    return !data.videoTrack
  }, [localVideoMute, data])

  const audioMute = useMemo(() => {
    if (data.isLocal) {
      return localAudioMute
    }
    return !data.audioTrack
  }, [localAudioMute, data])

  const userNameText = useMemo(() => {
    return data.isLocal ? userInfo.userName + " (Me)" : data.userName
  }, [data])

  const resizeObserver = new ResizeObserver((entries) => {
    const width = entries[0].contentRect.width
    const height = entries[0].contentRect.height
    setCenterArea({
      width,
      height,
    })
  })

  useEffect(() => {
    resizeObserver.observe(centerAreaRef.current as Element)
    setCenterArea({
      width: centerAreaRef.current?.offsetWidth || 0,
      height: centerAreaRef.current?.offsetHeight || 0,
    })
    return () => {
      resizeObserver.disconnect()
    }
  }, [centerAreaRef])

  const videoWrapper: IArea = useMemo(() => {
    const centerHeight = centerArea.height || 0
    const centerWidth = centerArea.width || 0

    let finalWidth = centerWidth
    let finalHeight = finalWidth / RATIO

    if (finalHeight > centerHeight) {
      finalHeight = centerHeight
      finalWidth = centerHeight * RATIO
    }

    return {
      width: Math.floor(finalWidth),
      height: Math.floor(finalHeight),
    }
  }, [centerArea, centerAreaRef])

  return (
    <div className={styles.centerArea} ref={centerAreaRef}>
      {videoMute ? (
        // only audio
        <div className={styles.videoMute}>
          <Avatar size="large" userName={data.userName} isHost={data.isHost}></Avatar>
          <div className={styles.textWrapper}>
            <span className={styles.text}>{userNameText}</span>
            <span className={styles.iconWrapper}>
              <MicIcon width={12} height={12} color="#fff" active={!audioMute}></MicIcon>
            </span>
          </div>
          <div className={styles.streamPlayerWrapper}>
            {data.isLocal ? (
              <LocalStreamPlayer videoTrack={data.videoTrack}></LocalStreamPlayer>
            ) : (
              <RemoteStreamPlayer
                audioTrack={data.audioTrack}
                videoTrack={data.videoTrack}
              ></RemoteStreamPlayer>
            )}
          </div>
        </div>
      ) : (
        // has video
        <div
          className={styles.videoUnMute}
          style={{
            width: videoWrapper.width + "px",
            height: videoWrapper.height + "px",
          }}
        >
          {data.isLocal ? (
            <LocalStreamPlayer videoTrack={data.videoTrack}></LocalStreamPlayer>
          ) : (
            <RemoteStreamPlayer
              audioTrack={data.audioTrack}
              videoTrack={data.videoTrack}
            ></RemoteStreamPlayer>
          )}
          <div className={styles.userInfo}>
            <MicIcon width={16} height={16} color="#fff" active={!audioMute}></MicIcon>
            <span className={styles.text}>{userNameText}</span>
            {data.isHost ? <HostIcon color="#FFAA08" width={16} height={16}></HostIcon> : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default CenterArea

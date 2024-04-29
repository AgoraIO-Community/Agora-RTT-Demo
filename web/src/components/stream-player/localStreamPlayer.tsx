import {
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  VideoPlayerConfig,
} from "agora-rtc-sdk-ng"
import { useRef, useState, useLayoutEffect, forwardRef, useEffect, useMemo } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/store"

import styles from "./index.module.scss"

interface StreamPlayerProps {
  videoTrack?: ICameraVideoTrack
  audioTrack?: IMicrophoneAudioTrack
  style?: React.CSSProperties
  fit?: "cover" | "contain" | "fill"
  onClick?: () => void
}

export const LocalStreamPlayer = forwardRef((props: StreamPlayerProps, ref) => {
  const { videoTrack, audioTrack, style = {}, fit = "cover", onClick = () => {} } = props
  const localVideoMute = useSelector((state: RootState) => state.global.localVideoMute)
  const vidDiv = useRef(null)

  useLayoutEffect(() => {
    const config = { fit } as VideoPlayerConfig
    if (localVideoMute) {
      videoTrack?.stop()
    } else {
      if (!videoTrack?.isPlaying) {
        videoTrack?.play(vidDiv.current!, config)
      }
    }

    return () => {
      videoTrack?.stop()
    }
  }, [videoTrack, fit, localVideoMute])

  // local audio track need not to be played
  // useLayoutEffect(() => {}, [audioTrack, localAudioMute])

  return <div className={styles.streamPlayer} style={style} ref={vidDiv} onClick={onClick}></div>
})

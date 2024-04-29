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
  videoTrack?: ICameraVideoTrack | IRemoteVideoTrack
  audioTrack?: IMicrophoneAudioTrack | IRemoteAudioTrack
  style?: React.CSSProperties
  fit?: "cover" | "contain" | "fill"
  onClick?: () => void
}

export const RemoteStreamPlayer = forwardRef((props: StreamPlayerProps, ref) => {
  const { videoTrack, audioTrack, style = {}, fit = "cover", onClick = () => {} } = props

  const vidDiv = useRef(null)

  useLayoutEffect(() => {
    const config = { fit } as VideoPlayerConfig
    if (!videoTrack?.isPlaying) {
      videoTrack?.play(vidDiv.current!, config)
    }

    return () => {
      videoTrack?.stop()
    }
  }, [videoTrack, fit])

  useLayoutEffect(() => {
    if (!audioTrack?.isPlaying) {
      audioTrack?.play()
    }
  }, [audioTrack])

  return <div className={styles.streamPlayer} style={style} ref={vidDiv} onClick={onClick}></div>
})

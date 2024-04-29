import { IUserData } from "@/types"
import { MicIcon, HostIcon } from "@/components/icons"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { LocalStreamPlayer, RemoteStreamPlayer } from "@/components/stream-player"
import { useMemo } from "react"

import styles from "./index.module.scss"

interface IUserItemProps {
  data: IUserData
  onClick?: (data: IUserData) => void
}

const UserItem = (props: IUserItemProps) => {
  const { data, onClick = (data: IUserData) => {} } = props
  const { isLocal } = data
  const { userName, isHost } = data
  const localVideoMute = useSelector((state: RootState) => state.global.localVideoMute)
  const localAudioMute = useSelector((state: RootState) => state.global.localAudioMute)

  const videoMute = useMemo(() => {
    if (isLocal) {
      return localVideoMute
    }
    return !data.videoTrack
  }, [localVideoMute, data])

  const audioMute = useMemo(() => {
    if (isLocal) {
      return localAudioMute
    }
    return !data.audioTrack
  }, [localAudioMute, data])

  const userNameText = useMemo(() => {
    return isLocal ? userName + " (Me)" : userName
  }, [data])

  return videoMute ? (
    <div className={styles.itemCamMute} onClick={() => onClick(data)}>
      <MicIcon width={16} height={16} active={!audioMute} color="#667085"></MicIcon>
      <span className={styles.text}>{userNameText}</span>
      {isHost ? <HostIcon width={16} height={16} color="#FFAA08"></HostIcon> : null}
    </div>
  ) : (
    <div className={styles.itemCamUnMute} onClick={() => onClick(data)}>
      {data.isLocal ? (
        <LocalStreamPlayer videoTrack={data.videoTrack}></LocalStreamPlayer>
      ) : (
        <RemoteStreamPlayer
          audioTrack={data.audioTrack}
          videoTrack={data.videoTrack}
        ></RemoteStreamPlayer>
      )}
      <div className={styles.micIconWrapper}>
        <MicIcon width={16} height={16} active={!audioMute} color="#fff"></MicIcon>
      </div>
      <div className={styles.userInfo}>
        <span className={styles.text}>{userNameText}</span>
        {isHost ? <HostIcon width={16} height={16} color="#FFAA08"></HostIcon> : null}
      </div>
    </div>
  )
}

export default UserItem

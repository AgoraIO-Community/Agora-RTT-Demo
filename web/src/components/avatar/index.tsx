import { useMemo } from "react"
import { HostIcon } from "@/components/icons"

import styles from "./index.module.scss"

interface IAvatarProps {
  size?: "default" | "large"
  isHost?: boolean
  userName: string
}

const Avatar = (props: IAvatarProps) => {
  const { size = "default", userName = "", isHost = false } = props

  const finUserName = useMemo(() => {
    if (userName.length < 2) {
      return userName
    }
    return userName[0].toUpperCase() + userName[1]
  }, [userName])

  return (
    <span className={`${styles.avatar} ${size}`}>
      <span className={styles.text}>{finUserName}</span>
      {isHost && (
        <span className={styles.host}>
          <HostIcon color="#fff"></HostIcon>
        </span>
      )}
    </span>
  )
}

export default Avatar

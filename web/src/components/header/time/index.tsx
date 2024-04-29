import { useEffect, useState } from "react"
import { TimeIcon } from "../../icons"
import { formatTime } from "@/common"
import styles from "./index.module.scss"

const Time = () => {
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      getRTCStats()
    }, 1000)
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [])

  const getRTCStats = () => {
    const status = window.rtcManager.client.getRTCStats()
    const duration = status?.Duration ?? 0
    setDuration(duration)
  }

  return (
    <span className={styles.time}>
      <TimeIcon></TimeIcon>
      <span className={styles.text}>{formatTime(duration)}</span>
    </span>
  )
}

export default Time

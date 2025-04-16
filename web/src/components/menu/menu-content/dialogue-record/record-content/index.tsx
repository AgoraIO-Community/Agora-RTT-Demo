import Avatar from "@/components/avatar"
import { RootState } from "@/store"
import { formatTime2, isArabic } from "@/common"
import { useSelector } from "react-redux"
import { useCallback, useEffect, useRef, useState } from "react"

import styles from "./index.module.scss"

// Smooth scroll function
const smoothScrollToBottom = (element: HTMLElement, duration = 300) => {
  const targetPosition = element.scrollHeight - element.clientHeight
  const startPosition = element.scrollTop
  const distance = targetPosition - startPosition
  let startTime: number | null = null

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime
    const timeElapsed = currentTime - startTime
    const progress = Math.min(timeElapsed / duration, 1)
    // Easing function to make scrolling more natural
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

    element.scrollTop = startPosition + distance * ease(progress)

    if (timeElapsed < duration) {
      requestAnimationFrame(animation)
    }
  }

  requestAnimationFrame(animation)
}

const RecordContent = () => {
  const languageSelect = useSelector((state: RootState) => state.global.languageSelect)
  const subtitles = useSelector((state: RootState) => state.global.sttSubtitles)
  const userInfo = useSelector((state: RootState) => state.global.userInfo)
  const remoteUserList = useSelector((state: RootState) => state.global.remoteUserList)
  const { transcribe1 } = languageSelect
  // local debugger
  // const [lastSourceLanguage, setLastSourceLanguage] = useState("en-US")
  const [lastSourceLanguage, setLastSourceLanguage] = useState(transcribe1)
  const contentRef = useRef<HTMLElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const previousSubtitlesLengthRef = useRef(subtitles.length)
  const isUserScrollingRef = useRef(false)
  const scrollTimerRef = useRef<number | null>(null)

  // Detect whether the user scrolls and the scrolling direction
  const onScroll = () => {
    if (!contentRef.current || isUserScrollingRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 20

    if (isAtBottom) {
      setShouldAutoScroll(true)
    } else {
      setShouldAutoScroll(false)
    }
  }

  // Functions that perform scrolling
  const performScroll = (duration = 400) => {
    if (!contentRef.current || !shouldAutoScroll) return

    // Cancel the previous timer (if any)
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = null
    }

    // Mark user scrolling status
    isUserScrollingRef.current = true
    smoothScrollToBottom(contentRef.current, duration)
    scrollTimerRef.current = window.setTimeout(() => {
      isUserScrollingRef.current = false
      scrollTimerRef.current = null
    }, duration + 50)
  }

  useEffect(() => {
    const element = contentRef.current
    if (element) {
      element.addEventListener("scroll", onScroll)
      return () => {
        element.removeEventListener("scroll", onScroll)
      }
    }
  }, [])

  useEffect(() => {
    if (transcribe1) {
      setLastSourceLanguage(transcribe1)
    }
  }, [transcribe1])

  // Automatic scrolling when processing new messages
  useEffect(() => {
    performScroll(300)
  }, [subtitles])

  // Scroll to the bottom when the component is first loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      performScroll(600) // Use a longer animation time for initialization
    }, 300) // Give more time for content rendering
    return () => clearTimeout(timer)
  }, [])

  const getUserName = useCallback(
    (uid: string | number) => {
      const user = remoteUserList.get(Number(uid))
      if (!user) {
        return ""
      }
      return user.userName
    },
    [remoteUserList],
  )

  const getUserSourceLanguage = useCallback(
    (uid: string | number) => {
      const user = remoteUserList.get(Number(uid))
      if (!user) {
        return
      }
      return user.sourceLanguage
    },
    [remoteUserList],
  )

  return (
    <section className={styles.record} ref={contentRef}>
      {subtitles.map(
        (item, index) =>
          (item.text || item.translations) && (
            <div
              key={`${item.time}_${index}`}
              className={`${styles.item} ${item.uid === userInfo.userId ? styles.itemSelf : styles.itemOther}`}
            >
              {item.uid !== userInfo.userId && (
                <div className={styles.left}>
                  <Avatar userName={item.username || getUserName(item.uid)}></Avatar>
                </div>
              )}
              <div
                className={`${styles.right} ${item.uid === userInfo.userId ? styles.rightSelf : styles.rightOther}`}
              >
                <div className={styles.up}>
                  <div className={styles.userName}>{item.username || getUserName(item.uid)}</div>
                  <div className={styles.time}>{formatTime2(item.timestamp)}</div>
                </div>
                <div
                  className={`${styles.bottom} ${item.uid === userInfo.userId ? styles.bubbleSelf : styles.bubbleOther}`}
                >
                  <div className={styles.content} data-type="source" data-source={transcribe1}>
                    <span
                      style={
                        item.uid === userInfo.userId
                          ? { color: "#ffffff96" }
                          : { color: "#33333396" }
                      }
                    >
                      [{item.lang || getUserSourceLanguage(item.uid)}]：
                    </span>
                    <span
                      style={
                        item.uid === userInfo.userId ? { color: "#ffffff" } : { color: "#33333396" }
                      }
                    >
                      {item.text}
                    </span>
                  </div>
                  {item.lang !== transcribe1 && item.translations && (
                    <div className={styles.translate} key={index} data-type="target">
                      {item.translations?.find((trans) => trans.lang === transcribe1)?.lang && (
                        <span
                          className={styles.bold}
                          style={
                            item.uid === userInfo.userId
                              ? { color: "#ffffff" }
                              : { color: "#0084ff" }
                          }
                        >{`[${item.translations?.find((trans) => trans.lang === transcribe1)?.lang}]: `}</span>
                      )}
                      <span
                        style={
                          item.uid === userInfo.userId ? { color: "#ffffff" } : { color: "#0084ff" }
                        }
                        className={`${isArabic(item?.lang) ? styles.arabic : ""}`}
                      >
                        {item.translations?.find((trans) => trans.lang === transcribe1)?.text}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {item.uid === userInfo.userId && (
                <div className={styles.right}>
                  <Avatar userName={item.username || getUserName(item.uid)}></Avatar>
                </div>
              )}
            </div>
          ),
      )}
    </section>
  )
}

export default RecordContent

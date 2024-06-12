import Avatar from "@/components/avatar"
import { RootState } from "@/store"
import { formatTime2, isArabic } from "@/common"
import { IChatItem } from "@/types"
import { useSelector } from "react-redux"
import { useEffect, useMemo, useRef, useState } from "react"

import styles from "./index.module.scss"

let lastScrollTop = 0

const RecordContent = () => {
  const recordLanguageSelect = useSelector((state: RootState) => state.global.recordLanguageSelect)
  const languageSelect = useSelector((state: RootState) => state.global.languageSelect)
  const subtitles = useSelector((state: RootState) => state.global.sttSubtitles)
  const { translate1List = [], translate2List = [] } = recordLanguageSelect
  const { transcribe1, transcribe2 } = languageSelect
  const contentRef = useRef<HTMLElement>(null)
  const [humanScroll, setHumanScroll] = useState(false)

  const chatList: IChatItem[] = useMemo(() => {
    const reslist: IChatItem[] = []
    subtitles.forEach((el) => {
      if (el.lang == transcribe1) {
        const chatItem: IChatItem = {
          userName: el.username,
          content: el.text,
          translations: [],
          startTextTs: el.startTextTs,
          textTs: el.textTs,
          time: el.startTextTs,
        }
        el.translations?.forEach((tran) => {
          if (translate1List.includes(tran.lang)) {
            const tranItem = { lang: tran.lang, text: tran.text }
            chatItem.translations?.push(tranItem)
          }
        })
        reslist.push(chatItem)
      } else if (el.lang == transcribe2) {
        const chatItem: IChatItem = {
          userName: el.username,
          content: el.text,
          translations: [],
          startTextTs: el.startTextTs,
          textTs: el.textTs,
          time: el.startTextTs,
        }
        el.translations?.forEach((tran) => {
          if (translate2List.includes(tran.lang)) {
            const tranItem = { lang: tran.lang, text: tran.text }
            chatItem.translations?.push(tranItem)
          }
        })
        reslist.push(chatItem)
      }
    })
    return reslist.sort((a: IChatItem, b: IChatItem) => Number(a.time) - Number(b.time))
  }, [translate1List, translate2List, transcribe1, transcribe2, subtitles])

  const onScroll = (e: any) => {
    const scrollTop = contentRef.current?.scrollTop ?? 0
    if (scrollTop < lastScrollTop) {
      setHumanScroll(true)
    }
    lastScrollTop = scrollTop
  }

  useEffect(() => {
    contentRef.current?.addEventListener("scroll", onScroll)

    return () => {
      contentRef.current?.removeEventListener("scroll", onScroll)
      lastScrollTop = 0
    }
  }, [contentRef])

  useEffect(() => {
    if (humanScroll) {
      return
    }
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [chatList, humanScroll])

  return (
    <section className={styles.record} ref={contentRef}>
      {chatList.map((item, index) => (
        <div key={index} className={styles.item}>
          <div className={styles.left}>
            <Avatar userName={item.userName}></Avatar>
          </div>
          <div className={styles.right}>
            <div className={styles.up}>
              <div className={styles.userName}>{item.userName}</div>
              <div className={styles.time}>{formatTime2(item.time)}</div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.content}>{item.content}</div>
              {item.translations?.map((tran, index) => (
                <div className={styles.translate} key={index}>
                  <span className={styles.bold}>{`[${tran?.lang}]: `}</span>
                  <span className={`${isArabic(tran?.lang) ? styles.arabic : ""}`}>
                    {tran?.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

export default RecordContent

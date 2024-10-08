import Avatar from "@/components/avatar"
import { RootState } from "@/store"
import { formatTime2, isArabic } from "@/common"
import { IChatItem } from "@/types"
import { useSelector } from "react-redux"
import { useEffect, useMemo, useRef, useState } from "react"

import styles from "./index.module.scss"

const RecordContent = () => {
  const recordLanguages = useSelector((state: RootState) => state.global.recordLanguages)
  const subtitles = useSelector((state: RootState) => state.global.sttSubtitles)
  const contentRef = useRef<HTMLElement>(null)

  const chatList: IChatItem[] = useMemo(() => {
    const reslist: IChatItem[] = []
    subtitles.forEach((el) => {
      if (el.lang == recordLanguages.transcribe1) {
        const chatItem: IChatItem = {
          userName: el.username,
          content: el.text,
          translations: [],
          startTime: el.startTime,
        }
        el.translations?.forEach((tran) => {
          if (recordLanguages?.translate1List?.includes(tran.lang)) {
            const tranItem = { lang: tran.lang, text: tran.text }
            chatItem.translations?.push(tranItem)
          }
        })
        reslist.push(chatItem)
      } else if (el.lang == recordLanguages.transcribe2) {
        const chatItem: IChatItem = {
          userName: el.username,
          content: el.text,
          translations: [],
          startTime: el.startTime,
        }
        el.translations?.forEach((tran) => {
          if (recordLanguages?.translate2List?.includes(tran.lang)) {
            const tranItem = { lang: tran.lang, text: tran.text }
            chatItem.translations?.push(tranItem)
          }
        })
        reslist.push(chatItem)
      }
    })
    return reslist.sort((a: IChatItem, b: IChatItem) => Number(a.startTime) - Number(b.startTime))
  }, [recordLanguages, subtitles])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [chatList])

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
              <div className={styles.time}>{formatTime2(item.startTime)}</div>
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

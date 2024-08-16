import { useEffect, useState, useRef, useMemo } from "react"
import { getElementScrollY, getCaptionScrollPX } from "@/common"
import CaptionItem from "./caption-item"
import { IChatItem } from "@/types"
import { useSelector } from "react-redux"
import { RootState } from "@/store"

import styles from "./index.module.scss"

interface ICaptionProps {
  speed?: number
  visible?: boolean
}

const Caption = (props: ICaptionProps) => {
  const { visible } = props
  const captionLanguages = useSelector((state: RootState) => state.global.captionLanguages)
  const captionRef = useRef<HTMLDivElement>(null)
  const subtitles = useSelector((state: RootState) => state.global.sttSubtitles)

  const captionList: IChatItem[] = useMemo(() => {
    const reslist: IChatItem[] = []

    subtitles.forEach((el) => {
      if (el.lang == captionLanguages.transcribe1) {
        const chatItem: IChatItem = {
          userName: el.username,
          content: el.text,
          translations: [],
          startTime: el.startTime,
        }
        el.translations?.forEach((tran) => {
          if (captionLanguages?.translate1List?.includes(tran.lang)) {
            const tranItem = { lang: tran.lang, text: tran.text }
            chatItem.translations?.push(tranItem)
          }
        })
        reslist.push(chatItem)
      } else if (el.lang == captionLanguages.transcribe2) {
        const chatItem: IChatItem = {
          userName: el.username,
          content: el.text,
          translations: [],
          startTime: el.startTime,
        }
        el.translations?.forEach((tran) => {
          if (captionLanguages?.translate2List?.includes(tran.lang)) {
            const tranItem = { lang: tran.lang, text: tran.text }
            chatItem.translations?.push(tranItem)
          }
        })
        reslist.push(chatItem)
      }
    })

    return reslist
  }, [captionLanguages, subtitles])

  const animate = () => {
    if (!captionRef.current) {
      return
    }
    const curScrollY = getElementScrollY(captionRef.current)
    if (curScrollY > 0) {
      // TODO: use transformY instead of scrollTop
      const curScrollTop = captionRef.current.scrollTop ?? 0
      const val = getCaptionScrollPX(curScrollY)
      captionRef.current.scrollTop = curScrollTop + val
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      animate()
    }, 35)

    return () => {
      clearInterval(id)
    }
  }, [captionList])

  return (
    <div className={`${styles.caption} ${!visible ? "hidden" : ""}`} ref={captionRef}>
      {captionList.map((item, index) => (
        <CaptionItem key={index} data={item}></CaptionItem>
      ))}
    </div>
  )
}

export default Caption

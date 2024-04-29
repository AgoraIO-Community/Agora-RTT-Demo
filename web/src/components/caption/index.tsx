import { useEffect, useState, useRef, useMemo } from "react"
import { getElementScrollY, getCaptionScrollPX } from "@/common"
import CaptionItem from "./caption-item"
import { IUICaptionData, IUiText } from "@/types"
import { useSelector } from "react-redux"
import { RootState } from "@/store"

import styles from "./index.module.scss"

interface ICaptionProps {
  speed?: number
  visible?: boolean
}

const Caption = (props: ICaptionProps) => {
  const { visible } = props

  const sttTranscribeTextList = useSelector(
    (state: RootState) => state.global.sttTranscribeTextList,
  )
  const sttTranslateTextMap = useSelector((state: RootState) => state.global.sttTranslateTextMap)
  const captionLanguages = useSelector((state: RootState) => state.global.captionLanguages)
  const captionRef = useRef<HTMLDivElement>(null)

  const captionList: IUICaptionData[] = useMemo(() => {
    const list: IUICaptionData[] = []
    if (captionLanguages.includes("live")) {
      const hasTranslate = captionLanguages.length > 1
      if (!hasTranslate) {
        sttTranscribeTextList.forEach((item: IUiText, index) => {
          list.push({
            content: item.text,
            translate: "",
            userName: item.userName,
          })
        })
      } else {
        const language = captionLanguages.filter((item) => item !== "live")[0]
        const translateArr: IUiText[] = sttTranslateTextMap[language] || []
        for (let i = 0; i < sttTranscribeTextList.length; i++) {
          const transcribeItem = sttTranscribeTextList[i]
          const translateItem = translateArr[i]
          if (transcribeItem) {
            list.push({
              content: transcribeItem?.text ?? "",
              translate: translateItem?.text ?? "",
              userName: transcribeItem?.userName ?? "",
            })
          }
        }
      }
    } else {
      captionLanguages.forEach((language: string, index) => {
        const translateArr: IUiText[] = sttTranslateTextMap[language] || []
        for (let i = 0; i < translateArr.length; i++) {
          const item = translateArr[i]
          if (item) {
            list.push({
              content: "",
              translate: item?.text ?? "",
              userName: item?.userName ?? "",
            })
          }
        }
      })
    }
    return list
  }, [captionLanguages, sttTranslateTextMap, sttTranscribeTextList])

  const animate = () => {
    if (!captionRef.current) {
      return
    }
    const scrollY = getElementScrollY(captionRef.current)
    if (scrollY > 0) {
      // TODO: use transformY instead of scrollTop
      // CaptionItem will be included in container and use transformY to move
      const curScrollTop = captionRef.current.scrollTop ?? 0
      captionRef.current.scrollTop = curScrollTop + getCaptionScrollPX(scrollY)
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

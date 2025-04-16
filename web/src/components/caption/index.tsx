import { useEffect, useState, useRef, useMemo } from "react"
import { getElementScrollY, getCaptionScrollPX } from "@/common"
import CaptionItem from "./caption-item"
import { IUICaptionData } from "@/types"
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
  const transcribe = useSelector((state: RootState) => state.global.languageSelect.transcribe1)
  const localUserLanguageRef = useRef(new Set())
  const captionRef = useRef<HTMLDivElement>(null)
  const subtitles = useSelector((state: RootState) => state.global.sttSubtitles)
  const { userId: localUserId } = useSelector((state: RootState) => state.global.userInfo)

  const captionList: IUICaptionData[] = useMemo(() => {
    // create a map of user ID to subtitle items, improve lookup efficiency
    const userSubtitleMap = new Map()

    // The first traversal is established and the mapping relationship is established.
    subtitles.forEach((item) => {
      if (!userSubtitleMap.has(item.uid)) {
        userSubtitleMap.set(item.uid, [])
      }
      userSubtitleMap.get(item.uid).push(item)
    })

    // The second traversal builds the subtitle list required for the UI.
    return subtitles
      .map((subtitle) => {
        // 1. create basic subtitle data
        const captionData: IUICaptionData = {
          userName: subtitle.username,
          translations: [],
          content: "",
          isTranscribe: subtitle.lang === transcribe,
          isReceivedUserTranslations: false,
          uid: subtitle.uid,
          lang: subtitle.lang,
          time: subtitle.timestamp,
        }

        if (
          transcribe &&
          subtitle.lang &&
          transcribe !== subtitle.lang &&
          subtitle.uid !== localUserId
        ) {
          // 2. get all subtitle items for this user
          const userSubtitles = userSubtitleMap.get(subtitle.uid) || []

          // 3. check if there is a subtitle with the current selected language as the translation target
          const hasTargetTranslation = userSubtitles.some((item: { translations: any[] }) =>
            item.translations?.some((trans) => localUserLanguageRef.current.has(trans.lang)),
          )
          captionData.isReceivedUserTranslations = hasTargetTranslation
        } else {
          captionData.isReceivedUserTranslations = true
        }

        // 4. process content and translations
        // if the current subtitle is the selected language
        captionData.content = subtitle.text
        // find translation
        const translation = subtitle.translations?.find((t) => t.lang === transcribe)
        if (translation) {
          captionData.translations?.push({
            lang: translation.lang,
            text: translation.text,
          })
        }

        return captionData
      })
      .filter((item) => item.content) // filter out subtitles with no content
  }, [subtitles, transcribe])

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
  }, [subtitles])

  useEffect(() => {
    if (transcribe) {
      localUserLanguageRef.current.add(transcribe)
      return
    }
    localUserLanguageRef.current.clear()
  }, [transcribe])

  return (
    <div className={`${styles.caption} ${!visible ? "hidden" : ""}`} ref={captionRef}>
      {captionList.map((item, index) => (
        <CaptionItem key={`${item.time}_${index}`} data={item}></CaptionItem>
      ))}
    </div>
  )
}

export default Caption

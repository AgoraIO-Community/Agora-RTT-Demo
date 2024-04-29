import Avatar from "../../../avatar"
import { RootState } from "@/store"
import { formatTime2 } from "@/common"
import { IChatItem } from "@/types"
import { useSelector } from "react-redux"
import { useMemo } from "react"

import styles from "./index.module.scss"

const RecordContent = () => {
  const dialogLanguageType = useSelector((state: RootState) => state.global.dialogLanguageType)
  const sttTranscribeTextList = useSelector(
    (state: RootState) => state.global.sttTranscribeTextList,
  )
  const sttTranslateTextMap = useSelector((state: RootState) => state.global.sttTranslateTextMap)
  const captionLanguages = useSelector((state: RootState) => state.global.captionLanguages)

  const curTranslateLanguage = useMemo(() => {
    const target = captionLanguages.find((item) => item !== "live")
    return target || ""
  }, [captionLanguages])

  const chatList: IChatItem[] = useMemo(() => {
    const reslist: IChatItem[] = []
    let targetList = []
    if (dialogLanguageType == "live") {
      targetList = sttTranscribeTextList
    } else {
      targetList = sttTranslateTextMap[curTranslateLanguage] || []
    }

    targetList.forEach((item) => {
      if (item.isFinal) {
        reslist.push({
          userName: item.userName,
          content: item.text,
          time: item.time,
        })
      }
    })

    return reslist.sort((a: IChatItem, b: IChatItem) => Number(a.time) - Number(b.time))
  }, [dialogLanguageType, sttTranscribeTextList, sttTranslateTextMap, curTranslateLanguage])

  return (
    <section className={styles.record}>
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
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

export default RecordContent

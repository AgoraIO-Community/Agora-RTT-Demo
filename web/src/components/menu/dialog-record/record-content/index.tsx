import Avatar from "../../../avatar"
import { RootState } from "@/store"
import { formatTime2 } from "@/common"
import { IChatItem, ITranslationItem } from "@/types"
import { useSelector } from "react-redux"
import { useMemo } from "react"

import styles from "./index.module.scss"

const RecordContent = () => {
  const dialogLanguageType = useSelector((state: RootState) => state.global.dialogLanguageType)
  const captionLanguages = useSelector((state: RootState) => state.global.captionLanguages)
  const subtitles = useSelector((state: RootState) => state.global.sttSubtitles)

  const curTranslateLanguage = useMemo(() => {
    const target = captionLanguages.find((item) => item !== "live")
    return target || ""
  }, [captionLanguages])

  const chatList: IChatItem[] = useMemo(() => {
    const reslist: IChatItem[] = []
    subtitles.forEach((el) => {
      const chatItem: IChatItem = {
        userName: el.username,
        content: el.text,
        translations: [],
        startTextTs: el.startTextTs,
        textTs: el.textTs,
        time: el.startTextTs,
      }
      el.translations?.forEach((tran) => {
        const tranItem = { lang: tran.lang, text: tran.text }
        chatItem.translations?.push(tranItem)
      })
      reslist.push(chatItem)
    })
    console.log("[test] [record] list: ", reslist)
    return reslist.sort((a: IChatItem, b: IChatItem) => Number(a.time) - Number(b.time))
  }, [dialogLanguageType, curTranslateLanguage])

  return (
    <section className={styles.record}>
      {chatList.map((item, index) => (
        <div key={index} className={styles.item}>
          {/* <div className={styles.left}>
            <Avatar userName={item.userName}></Avatar>
          </div> */}
          <div className={styles.right}>
            <div className={styles.up}>
              <div className={styles.userName}>{item.userName}</div>
              <div className={styles.time}>{formatTime2(item.time)}</div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.content}>{item.content}</div>
              {item.translations?.map((tran, index) => (
                <div className={styles.content}>
                  {captionLanguages.includes(tran?.lang ?? "")
                    ? "[" + tran?.lang + "] " + tran?.text
                    : null}
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

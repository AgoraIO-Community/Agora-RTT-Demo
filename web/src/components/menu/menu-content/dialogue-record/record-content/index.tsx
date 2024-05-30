import Avatar from "@/components/avatar"
import { RootState } from "@/store"
import { formatTime2, isArabic } from "@/common"
import { IChatItem } from "@/types"
import { useSelector } from "react-redux"
import { useMemo } from "react"

import styles from "./index.module.scss"

const RecordContent = () => {
  const recordLanguageSelect = useSelector((state: RootState) => state.global.recordLanguageSelect)
  const subtitles = useSelector((state: RootState) => state.global.sttSubtitles)

  const { translate1List = [], translate2List = [] } = recordLanguageSelect

  const translateList = useMemo(() => {
    return [...translate1List, ...translate2List]
  }, [translate1List, translate2List])

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
        if (translateList.includes(tran.lang)) {
          const tranItem = { lang: tran.lang, text: tran.text }
          chatItem.translations?.push(tranItem)
        }
      })
      reslist.push(chatItem)
    })
    // console.log("[test] [record] list: ", reslist)
    return reslist.sort((a: IChatItem, b: IChatItem) => Number(a.time) - Number(b.time))
  }, [translateList, subtitles])

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

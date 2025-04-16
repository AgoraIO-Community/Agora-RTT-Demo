import { isArabic } from "@/common/utils"
import { IUICaptionData } from "@/types"

import styles from "./index.module.scss"
import { useCallback } from "react"
import { RootState } from "@/store"
import { useSelector } from "react-redux"

interface ICaptionItemProps {
  data: IUICaptionData
}

const CaptionItem = (props: ICaptionItemProps) => {
  const { data } = props
  const { userName, content, translations, isReceivedUserTranslations, uid, lang } = data
  const remoteUserList = useSelector((state: RootState) => state.global.remoteUserList)

  const getUserName = useCallback(
    (uid: string | number) => {
      const user = remoteUserList.get(Number(uid))
      if (!user) {
        return
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
    <div className={styles.captionItem}>
      {content || translations?.length ? (
        <div className={styles.userName}>
          {userName || getUserName(uid)}:{/* {getUserSourceLanguage(uid)}: */}
        </div>
      ) : null}
      {content ? (
        <div className={styles.content}>
          {`[${lang || getUserSourceLanguage(uid)}]`}:{content}
        </div>
      ) : null}
      {translations?.map((item, index) => (
        <div
          className={`${styles.translate} ${isArabic(item?.lang) ? styles.arabic : ""}`}
          key={index}
        >
          {`[${item.lang}]`}: {item?.text}
        </div>
      ))}
      {!isReceivedUserTranslations && (
        <div className={styles.userTranslate}>
          <span className={styles.loadingTips}> Configuring translation engine</span>
          <span className={styles.loadingDots}>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      )}
    </div>
  )
}

export default CaptionItem


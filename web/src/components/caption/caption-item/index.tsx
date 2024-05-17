import { IUICaptionData } from "@/types"
import { useSelector } from "react-redux"
import { RootState } from "@/store"

import styles from "./index.module.scss"


interface ICaptionItemProps {
  data: IUICaptionData
}

const CaptionItem = (props: ICaptionItemProps) => {
  const { data } = props
  const { userName, content, translate, translations } = data
  const captionLanguages = useSelector((state: RootState) => state.global.captionLanguages)
  return (
    <div className={styles.captionItem}>
      <div className={styles.userName}>{userName}:</div>
      {content ? <div className={styles.content}>{content}</div> : null}
      {translations?.map((item, index) => (
        <div className={styles.translate}>
          {captionLanguages.includes(item?.lang ?? "")
            ? "[" + item?.lang + "] " + item?.text
            : null}
        </div>
      ))}
    </div>
  )
}

export default CaptionItem

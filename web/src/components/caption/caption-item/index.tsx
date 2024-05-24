import { IUICaptionData } from "@/types"
import { useSelector } from "react-redux"
import { RootState } from "@/store"

import styles from "./index.module.scss"

interface ICaptionItemProps {
  data: IUICaptionData
}

const CaptionItem = (props: ICaptionItemProps) => {
  const { data } = props
  const { userName, content, translations } = data
  return (
    <div className={styles.captionItem}>
      {content || translations?.length ? <div className={styles.userName}>{userName}:</div> : null}
      {content ? <div className={styles.content}>{content}</div> : null}
      {translations?.map((item, index) => (
        <div className={styles.translate} key={index}>
          {"[" + item?.lang + "] " + item?.text}
        </div>
      ))}
    </div>
  )
}

export default CaptionItem

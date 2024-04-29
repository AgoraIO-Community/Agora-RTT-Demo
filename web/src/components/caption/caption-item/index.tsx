import { IUICaptionData } from "@/types"

import styles from "./index.module.scss"

interface ICaptionItemProps {
  data: IUICaptionData
}

const CaptionItem = (props: ICaptionItemProps) => {
  const { data } = props
  const { userName, content, translate } = data
  return (
    <div className={styles.captionItem}>
      <div className={styles.userName}>{userName}:</div>
      {content ? <div className={styles.content}>{content}</div> : null}
      {translate ? <div className={styles.translate}>{translate}</div> : null}
    </div>
  )
}

export default CaptionItem

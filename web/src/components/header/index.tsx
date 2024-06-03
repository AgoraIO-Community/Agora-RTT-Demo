import { TranscriptionIcon } from "../icons"
import { RootState } from "@/store"
import Time from "./time"
import NetWork from "./network"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

import styles from "./index.module.scss"

interface IHeaderProps {
  style?: React.CSSProperties
}

const Header = (props: IHeaderProps) => {
  const { style } = props
  const sttStatus = useSelector((state: RootState) => state.global.sttStatus)
  const options = useSelector((state: RootState) => state.global.options)
  const { channel } = options
  const { t } = useTranslation()

  return (
    <header className={styles.header} style={style}>
      <NetWork></NetWork>
      <span className={styles.channelName}>{channel}</span>
      <span className={styles.transcription}>
        {sttStatus == "start" ? (
          <>
            <TranscriptionIcon></TranscriptionIcon>
            <span className={styles.text}>{t("transcribing")}</span>
          </>
        ) : null}
      </span>
      <Time></Time>
    </header>
  )
}

export default Header

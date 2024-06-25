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
  const sttData = useSelector((state: RootState) => state.global.sttData)
  const options = useSelector((state: RootState) => state.global.options)
  const { channel } = options
  const { t } = useTranslation()

  const onClickChannel = async () => {
    // test stt query api
    // const res = await window.sttManager.queryTranscription()
    // console.log("[test]", res)
    // ...
    // test stt update api
    // const res = await window.sttManager.updateTranscription({
    //   data: {
    //     languages: ["zh-CN"],
    //     rtcConfig: {
    //       subscribeAudioUids: ["111"],
    //     },
    //     translateConfig: {
    //       enable: false,
    //     },
    //   },
    //   updateMaskList: ["languages", "rtcConfig.subscribeAudioUids", "translateConfig.enable"],
    // })
    // console.log("[test]", res)
  }

  return (
    <header className={styles.header} style={style}>
      <NetWork></NetWork>
      <span className={styles.channelName} onClick={onClickChannel}>
        {channel}
      </span>
      <span className={styles.transcription}>
        {sttData.status == "start" ? (
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

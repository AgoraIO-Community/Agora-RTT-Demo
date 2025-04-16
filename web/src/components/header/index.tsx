import { TranscriptionIcon } from "../icons"
import { RootState } from "@/store"
import Time from "./time"
import NetWork from "./network"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

import styles from "./index.module.scss"
import { Modal } from "antd"
import { useState } from "react"
import { DevSetting } from "../dialog/dev-setting"

interface IHeaderProps {
  style?: React.CSSProperties
}

const Header = (props: IHeaderProps) => {
  const { style } = props
  const sttData = useSelector((state: RootState) => state.global.sttData)
  const options = useSelector((state: RootState) => state.global.options)
  const [showSecretModal, setShowSecretModal] = useState(false)
  const { channel } = options
  let clickCount = 0
  let time = 0
  const MAX_CLICK_COUNT = 5

  const { t } = useTranslation()
  const onClickHeader = () => {
    if (!time) {
      time = new Date().getTime()
    }
    const now = new Date().getTime()
    if (now - time < 1000) {
      time = now
      if (clickCount + 1 >= MAX_CLICK_COUNT) {
        setShowSecretModal(true)
        clickCount = 0
        time = 0
      } else {
        clickCount++
      }
    } else {
      time = now
      clickCount = 1
    }
  }

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
    <header className={styles.header} style={style} onClick={onClickHeader}>
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
      <DevSetting
        showSecretModal={showSecretModal}
        onOk={() => setShowSecretModal(false)}
        onCancel={() => setShowSecretModal(false)}
      />
    </header>
  )
}

export default Header

import RecordContent from "./record-content"
import { RootState } from "@/store"
import { setSttCountDown } from "@/store/reducers/global"
import { useSelector, useDispatch } from "react-redux"
import {
  formatTime,
  EXPERIENCE_DURATION,
  downloadText,
  genContentText,
  useResizeObserver,
} from "@/common"
import { message } from "antd"

import styles from "./index.module.scss"
import { useTranslation } from "react-i18next"
import { useMemo, useRef } from "react"

const DialogRecord = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const sttStatus = useSelector((state: RootState) => state.global.sttStatus)
  const sttCountDown = useSelector((state: RootState) => state.global.sttCountDown)
  const options = useSelector((state: RootState) => state.global.options)
  const dialogLanguageType = useSelector((state: RootState) => state.global.dialogLanguageType)
  const sttLanguages = useSelector((state: RootState) => state.global.sttLanguages)
  const captionLanguages = useSelector((state: RootState) => state.global.captionLanguages)
  const sttTranscribeTextList = useSelector(
    (state: RootState) => state.global.sttTranscribeTextList,
  )
  const sttTranslateTextMap = useSelector((state: RootState) => state.global.sttTranslateTextMap)
  const hostId = useSelector((state: RootState) => state.global.hostId)
  const userInfo = useSelector((state: RootState) => state.global.userInfo)
  const headerRef = useRef<HTMLDivElement>(null)
  const headerDimensions = useResizeObserver(headerRef)

  const { channel } = options

  const isHost = useMemo(() => {
    return hostId === userInfo.userId
  }, [hostId, userInfo.userId])

  const contentTop = useMemo(() => {
    return headerDimensions.height + headerDimensions.top || 0
  }, [headerDimensions])

  const onClickExtend = () => {
    dispatch(setSttCountDown(EXPERIENCE_DURATION))
  }

  const onClickStorage = () => {
    let language = ""
    let content = ""
    if (dialogLanguageType == "live") {
      language = sttLanguages.transcribe1 ?? ""
      content = genContentText(sttTranscribeTextList)
    } else {
      language = captionLanguages.find((item) => item !== "live") || ""
      content = genContentText(sttTranslateTextMap[language] || [])
    }
    downloadText(`${channel}_${language}.txt`, content)
    message.success("storage success!")
  }

  return (
    <div className={styles.dialogRecord}>
      <section ref={headerRef} className={styles.header}>
        {sttStatus == "start" ? (
          <>
            {isHost && sttCountDown ? (
              <div className={styles.try}>
                <span className={styles.text}>
                  {t("conversation.onTrial")} &nbsp;
                  <span className={styles.time}>{formatTime(sttCountDown / 1000)}</span> &nbsp;
                  <span>{t("conversation.extendExperienceText")}</span>
                </span>
                <span className={styles.btn} onClick={onClickExtend}>
                  {t("conversation.extendExperience")}
                </span>
              </div>
            ) : null}
            <div className={styles.turnOn}>{t("conversation.sttStarted")}</div>
          </>
        ) : (
          <div className={styles.turnOn}>{t("conversation.sttStopped")}</div>
        )}
      </section>
      <section
        className={styles.content}
        style={{
          top: contentTop + "px",
        }}
      >
        <RecordContent></RecordContent>
        {sttTranscribeTextList.length ? (
          <div className={styles.btnStorage} onClick={onClickStorage}>
            {t("storage")}
          </div>
        ) : null}
      </section>
    </div>
  )
}
export default DialogRecord

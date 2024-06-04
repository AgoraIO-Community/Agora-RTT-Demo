import RecordContent from "./record-content"
import { RootState } from "@/store"
import { setSttCountDown, addMessage } from "@/store/reducers/global"
import { useSelector, useDispatch } from "react-redux"
import { SettingIcon } from "@/components/icons"
import {
  formatTime,
  EXPERIENCE_DURATION,
  downloadText,
  genContentText,
  useResizeObserver,
  showAIModule,
} from "@/common"
import LanguageShowDialog from "@/components/dialog/language-show"

import styles from "./index.module.scss"
import { useTranslation } from "react-i18next"
import { useEffect, useMemo, useRef, useState } from "react"

interface DialogueRecordProps {
  onExport?: (value: string) => void
}

const DialogueRecord = (props: DialogueRecordProps) => {
  const { onExport } = props
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const sttData = useSelector((state: RootState) => state.global.sttData)
  const sttCountDown = useSelector((state: RootState) => state.global.sttCountDown)
  const options = useSelector((state: RootState) => state.global.options)
  const captionLanguageSelect = useSelector(
    (state: RootState) => state.global.captionLanguageSelect,
  )
  const sttSubtitles = useSelector((state: RootState) => state.global.sttSubtitles)
  const userInfo = useSelector((state: RootState) => state.global.userInfo)
  const { transcribe1 } = captionLanguageSelect
  const { channel } = options
  const headerRef = useRef<HTMLDivElement>(null)
  const tryRef = useRef<HTMLDivElement>(null)
  const [openLanguageShowDialog, setOpenLanguageShowDialog] = useState(false)
  const headerDimensions = useResizeObserver(headerRef)

  useEffect(() => {
    if (!tryRef?.current) {
      return
    }

    if (headerDimensions.width >= 600) {
      tryRef.current.style.width = "500px"
    } else if (headerDimensions.width >= 500) {
      tryRef.current.style.width = "420px"
    }
  }, [headerDimensions])

  const contentTop = useMemo(() => {
    return headerDimensions.height + headerDimensions.top || 0
  }, [headerDimensions])

  const onClickExtend = () => {
    dispatch(setSttCountDown(EXPERIENCE_DURATION))
  }

  const onClickSetting = () => {
    setOpenLanguageShowDialog(!openLanguageShowDialog)
  }

  const onClickStorage = () => {
    const language = transcribe1
    const content = genContentText(sttSubtitles)
    downloadText(`${channel}_${language}.txt`, content)
    dispatch(addMessage({ type: "success", content: t("storage.success") }))
  }

  const onClickExport = () => {
    const content = genContentText(sttSubtitles)
    onExport?.(content)
    dispatch(addMessage({ type: "success", content: t("export.success") }))
  }

  return (
    <div className={styles.dialogRecord}>
      <section ref={headerRef} className={styles.header}>
        {sttData.status == "start" ? (
          <>
            <div className={styles.start}>
              <div className={styles.try} ref={tryRef}>
                <span className={styles.text}>
                  {t("conversation.onTrial")} &nbsp;
                  <span className={styles.time}>{formatTime(sttCountDown / 1000)}</span> &nbsp;
                  <span>{t("conversation.extendExperienceText")}</span>
                </span>
                <span className={styles.btn} onClick={onClickExtend}>
                  {t("conversation.extendExperience")}
                </span>
              </div>
              {/* setting */}
              <div className={styles.setting} onClick={onClickSetting}>
                <SettingIcon></SettingIcon>
              </div>
            </div>
            <div className={styles.conversation}>{t("conversation.sttStarted")}</div>
          </>
        ) : (
          <div className={styles.conversation}>{t("conversation.sttStopped")}</div>
        )}
      </section>
      <section
        className={styles.content}
        style={{
          top: contentTop + "px",
        }}
      >
        <RecordContent></RecordContent>
        {sttSubtitles.length ? (
          <div className={styles.btnWrapper}>
            {showAIModule() ? (
              <div className={styles.btn} onClick={onClickExport}>
                {t("export.text")}
              </div>
            ) : null}
            <div className={styles.btn} onClick={onClickStorage}>
              {t("storage.text")}
            </div>
          </div>
        ) : null}
      </section>
      <LanguageShowDialog
        open={openLanguageShowDialog}
        onCancel={() => {
          setOpenLanguageShowDialog(false)
        }}
        onOk={() => {
          setOpenLanguageShowDialog(false)
        }}
      ></LanguageShowDialog>
    </div>
  )
}
export default DialogueRecord

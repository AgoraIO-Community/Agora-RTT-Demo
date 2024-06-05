import RecordContent from "./record-content"
import { RootState } from "@/store"
import { addMessage } from "@/store/reducers/global"
import { useSelector, useDispatch } from "react-redux"
import { downloadText, genContentText, showAIModule } from "@/common"
import LanguageShowDialog from "@/components/dialog/language-show"
import RecordHeader from "./record-header"

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
  const options = useSelector((state: RootState) => state.global.options)
  const captionLanguageSelect = useSelector(
    (state: RootState) => state.global.captionLanguageSelect,
  )
  const sttSubtitles = useSelector((state: RootState) => state.global.sttSubtitles)
  const { transcribe1 } = captionLanguageSelect
  const { channel } = options
  const [openLanguageShowDialog, setOpenLanguageShowDialog] = useState(false)

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
      <RecordHeader
        onClickSetting={() => {
          setOpenLanguageShowDialog(!openLanguageShowDialog)
        }}
      ></RecordHeader>
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

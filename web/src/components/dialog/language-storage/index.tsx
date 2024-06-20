import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
import { Modal, Alert, Select, Space } from "antd"
import { ITextItem, LangDataType } from "@/types"
import { LANGUAGE_OPTIONS, downloadText, genContentText } from "@/common"
import { addMessage } from "@/store/reducers/global"
import { useTranslation } from "react-i18next"

import styles from "./index.module.scss"
import { useMemo, useState } from "react"

interface ILanguageSettingDialogProps {
  open?: boolean
  onOk?: () => void
  onCancel?: () => void
}

export const genTranslateContentText = (lang: string, type: LangDataType, list: ITextItem[]) => {
  let res = ""
  if (type == "transcribe") {
    list.forEach((item) => {
      if (item.lang === lang) {
        res += `${item.username}: ${item.text}\n`
      }
    })
  } else {
    list.forEach((item) => {
      item.translations?.forEach((v) => {
        if (v.lang === lang) {
          res += `${item.username}: ${v.text}\n`
        }
      })
    })
  }
  return res
}

const LanguageStorageDialog = (props: ILanguageSettingDialogProps) => {
  const dispatch = useDispatch()
  const { open, onOk, onCancel } = props
  const { t } = useTranslation()
  const options = useSelector((state: RootState) => state.global.options)
  const languageSelect = useSelector((state: RootState) => state.global.languageSelect)
  const sttSubtitles = useSelector((state: RootState) => state.global.sttSubtitles)
  const recordLanguageSelect = useSelector((state: RootState) => state.global.recordLanguageSelect)
  const { transcribe1, transcribe2 } = languageSelect
  const { translate1List = [], translate2List = [] } = recordLanguageSelect
  const { channel } = options
  const [language, setLanguage] = useState<string>()

  const languageOptions = useMemo(() => {
    const res: any[] = []

    if (transcribe1) {
      const target = LANGUAGE_OPTIONS.find((item) => item.value === transcribe1)
      res.push({
        value: target?.value,
        label: "live: " + target?.label,
      })
    }

    if (transcribe2) {
      const target = LANGUAGE_OPTIONS.find((item) => item.value === transcribe2)
      res.push({
        value: target?.value,
        label: "live: " + target?.label,
      })
    }

    translate1List.forEach((lang) => {
      const target = LANGUAGE_OPTIONS.find((item) => item.value === lang)
      res.push({
        value: lang,
        label: "translate: " + target?.label,
      })
    })

    translate2List.forEach((lang) => {
      const target = LANGUAGE_OPTIONS.find((item) => item.value === lang)
      if (res.find((item) => item.value === lang)) return
      res.push({
        value: lang,
        label: "translate: " + target?.label,
      })
    })

    return res
  }, [transcribe1, transcribe2, translate1List, translate2List])

  const curType: LangDataType = useMemo(() => {
    if (language == transcribe1) {
      return "transcribe"
    }
    if (language == transcribe2) {
      return "transcribe"
    }

    return "translate"
  }, [transcribe1, transcribe2, language])

  const onClickBtn = async () => {
    onOk?.()
    if (language) {
      const name = `${channel}_${language}`
      const content = genTranslateContentText(language, curType, sttSubtitles)
      downloadText(`${name}.txt`, content)
      dispatch(addMessage({ type: "success", content: t("storage.success") }))
    }
  }

  const onChange = (value: string) => {
    setLanguage(value)
  }

  return (
    <Modal
      width={600}
      title={t("dialog.languageExport")}
      open={open}
      footer={null}
      onOk={onOk}
      onCancel={onCancel}
    >
      <section className={styles.content}>
        <div className={styles.textTop}>{t("dialog.languageExportTip")}</div>
        <div className={styles.section}>
          <Select
            value={language}
            onChange={onChange}
            style={{ width: 300 }}
            options={languageOptions}
          />
        </div>
      </section>
      <div className={styles.btnWrapper}>
        <span className={styles.btn} onClick={onClickBtn}>
          {t("confirm")}
        </span>
      </div>
    </Modal>
  )
}

export default LanguageStorageDialog

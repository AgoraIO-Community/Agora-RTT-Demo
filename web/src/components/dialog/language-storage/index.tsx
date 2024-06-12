import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
import { Modal, Alert, Select, Space } from "antd"
import { ITextItem } from "@/types"
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

export const genTranslateContentText = (lang: string, list: ITextItem[]) => {
  let res = ""
  list.forEach((item) => {
    item.translations?.forEach((v) => {
      if (v.lang === lang) {
        res += `${item.username}: ${v.text}\n`
      }
    })
  })
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

  const onClickBtn = async () => {
    onOk?.()
    if (language) {
      let name = channel
      let content = ""
      if (language == "live") {
        if (transcribe1) {
          name += `_${transcribe1}`
        }
        if (transcribe2) {
          name += `_${transcribe2}`
        }
        content = genContentText(sttSubtitles)
      } else {
        name += `_${language}`
        content = genTranslateContentText(language, sttSubtitles)
      }
      downloadText(`${name}.txt`, content)
      dispatch(addMessage({ type: "success", content: t("storage.success") }))
    }
  }

  const onChange = (value: string) => {
    setLanguage(value)
  }

  // const languageList: ILanguageItem[] = useMemo(() => {
  //   const res: ILanguageItem[] = []

  //   if (transcribe1) {
  //     res.push({
  //       type: "transcribe",
  //       lang: transcribe1,
  //     })
  //   }
  //   if (transcribe2) {
  //     res.push({
  //       type: "transcribe",
  //       lang: transcribe2,
  //     })
  //   }
  //   if (translate1List) {
  //     translate1List.forEach((lang) => {
  //       res.push({
  //         type: "translate",
  //         lang,
  //         from: transcribe1,
  //       })
  //     })
  //   }
  //   if (translate2List) {
  //     translate2List.forEach((lang) => {
  //       res.push({
  //         type: "translate",
  //         lang,
  //         from: transcribe2,
  //       })
  //     })
  //   }

  //   return res
  // }, [transcribe1, transcribe2, translate1List, translate2List])

  const languageOptions = useMemo(() => {
    const res = []
    res.push({
      value: "live",
      label: "live",
    })
    translate1List.forEach((lang) => {
      const target = LANGUAGE_OPTIONS.find((item) => item.value === lang)
      res.push({
        value: lang,
        label: target?.label,
      })
    })
    translate2List.forEach((lang) => {
      const target = LANGUAGE_OPTIONS.find((item) => item.value === lang)
      res.push({
        value: lang,
        label: target?.label,
      })
    })

    return res
  }, [translate1List, translate2List])

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

import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
import { useEffect, useMemo, useState } from "react"
import { Modal, Alert, Select, Space } from "antd"
import { LANGUAGE_OPTIONS } from "@/common"
import { setRecordLanguages, addMessage } from "@/store/reducers/global"
import { useTranslation } from "react-i18next"

import styles from "./index.module.scss"

interface ILanguageSettingDialogProps {
  open?: boolean
  onOk?: () => void
  onCancel?: () => void
}

const SELECT_TRANS_LANGUAGE_PLACEHOLDER = "Please select a language to translate into"
const MAX_COUNT = 2

const LanguageRecordDialog = (props: ILanguageSettingDialogProps) => {
  const { open, onOk, onCancel } = props
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const languageSelect = useSelector((state: RootState) => state.global.languageSelect)
  const recordLanguages = useSelector((state: RootState) => state.global.recordLanguages)
  const [tempLanguages, setTempLanguages] = useState(recordLanguages)

  useEffect(() => {
    setTempLanguages(recordLanguages)
  }, [recordLanguages])

  const translate1Options = useMemo(() => {
    const options: any[] = []
    languageSelect.translate1List?.forEach((item) => {
      const target = LANGUAGE_OPTIONS.find((el) => el.value === item)
      if (target) {
        options.push({
          value: target?.value,
          label: target?.label,
        })
      }
    })
    return options
  }, [languageSelect])

  const translate2Options = useMemo(() => {
    const options: any[] = []
    languageSelect.translate2List?.forEach((item) => {
      const target = LANGUAGE_OPTIONS.find((el) => el.value === item)
      if (target) {
        options.push({
          value: target.value,
          label: target.label,
        })
      }
    })

    return options
  }, [languageSelect])

  const onClickBtn = async () => {
    dispatch(setRecordLanguages(tempLanguages))
    dispatch(
      addMessage({
        content: t("setting.saveSuccess"),
        type: "success",
      }),
    )
    onOk?.()
  }

  return (
    <Modal
      width={600}
      title={t("dialog.languageShow")}
      open={open}
      footer={null}
      onOk={onOk}
      onCancel={onCancel}
    >
      <div className={styles.content}>
        <div className={styles.section}>
          <Space>
            <div className={styles.text} style={{ width: 160 }}>
              {t("setting.liveLanguage")} 1
            </div>
            <div className={styles.text}>
              {t("setting.liveLanguage")} 1 - {t("translationLanguage")}
            </div>
          </Space>
          <div className={styles.selectWrapper}>
            <Space>
              <Select
                value={tempLanguages.transcribe1}
                style={{ width: 160 }}
                options={LANGUAGE_OPTIONS}
                onChange={(val) => {
                  setTempLanguages((pre) => ({
                    ...pre,
                    transcribe1: val,
                    translate1List: val ? pre.translate1List : [],
                  }))
                }}
              />
              <Select
                value={tempLanguages.translate1List}
                onChange={(val) => {
                  setTempLanguages((pre) => ({
                    ...pre,
                    translate1List: val,
                  }))
                }}
                allowClear
                disabled={!tempLanguages.transcribe1}
                showSearch={false}
                mode="multiple"
                placeholder={SELECT_TRANS_LANGUAGE_PLACEHOLDER}
                maxCount={MAX_COUNT}
                style={{ width: 380 }}
                maxTagTextLength={10}
                options={translate1Options}
              />
            </Space>
          </div>
        </div>
        <div className={styles.section}>
          <Space>
            <div className={styles.text} style={{ width: 160 }}>
              {t("setting.liveLanguage")} 2
            </div>
            <div className={styles.text}>
              {t("setting.liveLanguage")} 2 - {t("translationLanguage")}
            </div>
          </Space>
          <div className={styles.selectWrapper}>
            <Space>
              <Select
                value={tempLanguages.transcribe2}
                allowClear
                style={{ width: 160 }}
                options={LANGUAGE_OPTIONS}
                onChange={(val) => {
                  setTempLanguages((pre) => ({
                    ...pre,
                    transcribe2: val,
                    translate2List: val ? pre.translate2List : [],
                  }))
                }}
              />
              <Select
                value={tempLanguages.translate2List}
                onChange={(val) => {
                  setTempLanguages((pre) => ({
                    ...pre,
                    translate2List: val,
                  }))
                }}
                disabled={!tempLanguages.transcribe2}
                allowClear
                showSearch={false}
                mode="multiple"
                placeholder={SELECT_TRANS_LANGUAGE_PLACEHOLDER}
                maxCount={MAX_COUNT}
                style={{ width: 380 }}
                maxTagTextLength={10}
                options={translate2Options}
              />
            </Space>
          </div>
        </div>
      </div>
      <div className={styles.btnWrapper}>
        <span className={styles.btn} onClick={onClickBtn}>
          {t("confirm")}
        </span>
      </div>
    </Modal>
  )
}

export default LanguageRecordDialog

import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
import { useEffect, useMemo, useState } from "react"
import { Modal, Alert, Select, Space } from "antd"
import { LANGUAGE_OPTIONS } from "@/common"
import { setRecordLanguageSelect, addMessage } from "@/store/reducers/global"
import { useTranslation } from "react-i18next"

import styles from "./index.module.scss"

interface ILanguageSettingDialogProps {
  open?: boolean
  onOk?: () => void
  onCancel?: () => void
}

const SELECT_TRANS_LANGUAGE_PLACEHOLDER = "Please select a language to translate into"
const MAX_COUNT = 2

const LanguageShowDialog = (props: ILanguageSettingDialogProps) => {
  const { open, onOk, onCancel } = props
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const languageSelect = useSelector((state: RootState) => state.global.languageSelect)
  const recordLanguageSelect = useSelector((state: RootState) => state.global.recordLanguageSelect)
  const {
    transcribe1,
    translate1List: captionTranslate1List = [],
    transcribe2,
    translate2List: captionTranslate2List = [],
  } = languageSelect
  const { translate1List: recordTranslate1List = [], translate2List: recordTranslate2List = [] } =
    recordLanguageSelect
  const [translateLanguage1List, setTranslateLanguage1List] =
    useState<string[]>(recordTranslate1List)
  const [translateLanguage2List, setTranslateLanguage2List] =
    useState<string[]>(recordTranslate2List)

  useEffect(() => {
    setTranslateLanguage1List(recordTranslate1List)
    setTranslateLanguage2List(recordTranslate2List)
  }, [recordLanguageSelect])

  const translateLanguage1Options = useMemo(() => {
    const options: any[] = []
    captionTranslate1List.forEach((item) => {
      const target = LANGUAGE_OPTIONS.find((el) => el.value === item)
      if (target) {
        options.push({
          value: target?.value,
          label: target?.label,
        })
      }
    })
    return options
  }, [captionTranslate1List])

  const translateLanguage2Options = useMemo(() => {
    const options: any[] = []
    captionTranslate2List.forEach((item) => {
      const target = LANGUAGE_OPTIONS.find((el) => el.value === item)
      if (target) {
        options.push({
          value: target.value,
          label: target.label,
        })
      }
    })

    return options
  }, [captionTranslate2List])

  const onClickBtn = async () => {
    dispatch(
      setRecordLanguageSelect({
        translate1List: translateLanguage1List,
        translate2List: translateLanguage2List,
      }),
    )
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
                value={transcribe1}
                disabled={true}
                style={{ width: 160 }}
                options={LANGUAGE_OPTIONS}
              />
              <Select
                value={translateLanguage1List}
                onChange={(value) => {
                  setTranslateLanguage1List(value)
                }}
                allowClear
                disabled={!transcribe1}
                showSearch={false}
                mode="multiple"
                placeholder={SELECT_TRANS_LANGUAGE_PLACEHOLDER}
                maxCount={MAX_COUNT}
                style={{ width: 380 }}
                maxTagTextLength={10}
                options={translateLanguage1Options}
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
                value={transcribe2}
                disabled={true}
                allowClear
                style={{ width: 160 }}
                options={LANGUAGE_OPTIONS}
              />
              <Select
                value={translateLanguage2List}
                onChange={(value) => {
                  setTranslateLanguage2List(value)
                }}
                disabled={!transcribe2}
                allowClear
                showSearch={false}
                mode="multiple"
                placeholder={SELECT_TRANS_LANGUAGE_PLACEHOLDER}
                maxCount={MAX_COUNT}
                style={{ width: 380 }}
                maxTagTextLength={10}
                options={translateLanguage2Options}
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

export default LanguageShowDialog

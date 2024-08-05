import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
import { useEffect, useMemo, useState } from "react"
import { Modal, Alert, Select, Space } from "antd"
import { LANGUAGE_OPTIONS } from "@/common"
import { setCaptionLanguages, addMessage } from "@/store/reducers/global"
import { useTranslation } from "react-i18next"

import styles from "./index.module.scss"
import { ILanguageSelect } from "@/types"

interface ILanguageSettingDialogProps {
  open?: boolean
  onOk?: () => void
  onCancel?: () => void
}

const SELECT_TRANS_LANGUAGE_PLACEHOLDER = "Please select a language to translate into"
const MAX_COUNT = 2

const LanguageCaptionDialog = (props: ILanguageSettingDialogProps) => {
  const { open, onOk, onCancel } = props
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const languageSelect = useSelector((state: RootState) => state.global.languageSelect)
  const captionLanguages = useSelector((state: RootState) => state.global.captionLanguages)
  const [tempLanguages, setTempLanguages] = useState<ILanguageSelect>(captionLanguages)

  useEffect(() => {
    setTempLanguages(captionLanguages)
  }, [captionLanguages])

  const transcribe1Options = useMemo(() => {
    const options: any[] = []

    if (languageSelect.transcribe1) {
      options.push({
        value: languageSelect.transcribe1,
        label: LANGUAGE_OPTIONS.find((el) => el.value === languageSelect.transcribe1)?.label,
      })
    }

    return options
  }, [languageSelect])

  const transcribe2Options = useMemo(() => {
    const options: any[] = []

    if (languageSelect.transcribe2) {
      options.push({
        value: languageSelect.transcribe2,
        label: LANGUAGE_OPTIONS.find((el) => el.value === languageSelect.transcribe2)?.label,
      })
    }

    return options
  }, [languageSelect])

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
          value: target?.value,
          label: target?.label,
        })
      }
    })
    return options
  }, [languageSelect])

  const onClickBtn = async () => {
    dispatch(setCaptionLanguages(tempLanguages))
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
      title={t("dialog.languageCaption")}
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
                options={transcribe1Options}
                onChange={(value) => {
                  setTempLanguages((pre) => ({
                    ...pre,
                    transcribe1: value,
                  }))
                }}
              />
              <Select
                value={tempLanguages.translate1List}
                onChange={(value: string[]) => {
                  setTempLanguages((pre) => ({
                    ...pre,
                    translate1List: value,
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
                options={transcribe2Options}
                onChange={(value) => {
                  setTempLanguages((pre) => ({
                    ...pre,
                    transcribe2: value,
                  }))
                }}
              />
              <Select
                value={tempLanguages.translate2List}
                onChange={(value: string[]) => {
                  setTempLanguages((pre) => ({
                    ...pre,
                    translate2List: value,
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

export default LanguageCaptionDialog

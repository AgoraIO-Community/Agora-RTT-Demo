import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
import { useEffect, useMemo, useRef, useState } from "react"
import { Modal, Alert, Select, Space } from "antd"
import { LANGUAGE_OPTIONS } from "@/common"
import { LoadingOutlined } from "@ant-design/icons"
import { ILanguageItem } from "@/manager"
import { addMessage, setRecordLanguageSelect, setSubtitles } from "@/store/reducers/global"
import { useTranslation } from "react-i18next"

import styles from "./index.module.scss"

interface ILanguageSettingDialogProps {
  open?: boolean
  onOk?: () => void
  onCancel?: () => void
}

const SELECT_LIVE_LANGUAGE_PLACEHOLDER = "Select on-site language"
const SELECT_TRANS_LANGUAGE_PLACEHOLDER = "Please select a language to translate into"
const MAX_COUNT = 5
let clickCount = 0
const MAX_CLICK_COUNT = 5
let time = 0

const LanguageSettingDialog = (props: ILanguageSettingDialogProps) => {
  const { open, onOk, onCancel } = props
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const sttData = useSelector((state: RootState) => state.global.sttData)
  const languageSelect = useSelector((state: RootState) => state.global.languageSelect)
  const { transcribe1, translate1List = [], transcribe2, translate2List = [] } = languageSelect
  const [sourceLanguage1, setSourceLanguage1] = useState(transcribe1)
  const [sourceLanguage1List, setSourceLanguage1List] = useState<string[]>(translate1List)
  const [sourceLanguage2, setSourceLanguage2] = useState(transcribe2)
  const [sourceLanguage2List, setSourceLanguage2List] = useState<string[]>(translate2List)
  const [loading, setLoading] = useState(false)
  const titleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (transcribe1) {
      setSourceLanguage1(transcribe1)
    }
    setSourceLanguage1List(translate1List)
    if (transcribe2) {
      setSourceLanguage2(transcribe2)
    }
    setSourceLanguage2List(translate2List)
  }, [languageSelect])

  const hasSttStarted = useMemo(() => {
    return sttData.status == "start"
  }, [sttData])

  const languages = useMemo(() => {
    const languages: ILanguageItem[] = []
    if (sourceLanguage1) {
      languages.push({
        source: sourceLanguage1,
        target: sourceLanguage1List,
      })
    }
    if (sourceLanguage2) {
      languages.push({
        source: sourceLanguage2,
        target: sourceLanguage2List,
      })
    }
    return languages
  }, [sourceLanguage1, sourceLanguage1List, sourceLanguage2, sourceLanguage2List])

  const btnText = useMemo(() => {
    if (!hasSttStarted) {
      return t("setting.sttStart")
    } else {
      return t("setting.sttStop")
    }
  }, [hasSttStarted])

  const checkSomeSourceLanguage = () => {
    return sourceLanguage1 && sourceLanguage2 && sourceLanguage1 == sourceLanguage2
  }

  const onClickBtn = async () => {
    if (loading) {
      return
    }
    if (checkSomeSourceLanguage()) {
      return dispatch(addMessage({ content: t("setting.sameLanguage"), type: "success" }))
    }
    setLoading(true)
    try {
      if (!hasSttStarted) {
        await window.sttManager.startTranscription({
          languages,
        })
      } else {
        await window.sttManager.stopTranscription()
      }
    } catch (e: any) {
      console.error(e)
      dispatch(addMessage({ content: e.message, type: "error" }))
    }
    setLoading(false)
    onOk?.()
  }

  const checkMaxTranslateList = (list1: string[] = [], list2: string[] = []) => {
    const arr = [...new Set([...list1, ...list2])]
    if (arr.length > 5) {
      dispatch(addMessage({ content: t("setting.translationLanguageMax"), type: "error" }))
      return false
    }
    return true
  }

  const onClickTitle = () => {
    if (!time) {
      time = new Date().getTime()
    }
    const now = new Date().getTime()
    if (now - time < 1000) {
      time = now
      if (clickCount + 1 >= MAX_CLICK_COUNT) {
        onMultipleClickTitle()
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

  const onMultipleClickTitle = () => {
    const duration = 120 * 60 * 1000
    window.sttManager.extendDuration({
      duration,
    })
    dispatch(
      addMessage({
        content: t("message.extendExperience"),
        type: "success",
      }),
    )
  }

  return (
    <Modal
      width={600}
      title={
        <div ref={titleRef} className="title" onClick={onClickTitle}>
          {t("footer.langaugesSetting")}
        </div>
      }
      open={open}
      footer={null}
      onOk={onOk}
      onCancel={onCancel}
    >
      <div className={styles.content}>
        <Alert message={t("setting.limitDuration")} showIcon type="warning" />
        <div className={styles.textTop}>{t("setting.languagesSelect")}</div>
        <div className={styles.textBottom}>{t("setting.tip")}</div>
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
                value={sourceLanguage1}
                onChange={(value) => {
                  setSourceLanguage1(value)
                  if (!value) {
                    setSourceLanguage1List([])
                  }
                }}
                disabled={hasSttStarted}
                allowClear
                placeholder={SELECT_LIVE_LANGUAGE_PLACEHOLDER}
                style={{ width: 160 }}
                options={LANGUAGE_OPTIONS}
              />
              <Select
                value={sourceLanguage1List}
                onChange={(value) => {
                  if (checkMaxTranslateList(value, sourceLanguage2List)) {
                    setSourceLanguage1List(value)
                  }
                }}
                allowClear
                disabled={hasSttStarted || !sourceLanguage1}
                showSearch={false}
                mode="multiple"
                placeholder={SELECT_TRANS_LANGUAGE_PLACEHOLDER}
                maxCount={MAX_COUNT}
                style={{ width: 380 }}
                maxTagTextLength={10}
                options={LANGUAGE_OPTIONS}
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
                value={sourceLanguage2}
                onChange={(value) => {
                  setSourceLanguage2(value)
                  if (!value) {
                    setSourceLanguage2List([])
                  }
                }}
                disabled={hasSttStarted}
                allowClear
                placeholder={SELECT_LIVE_LANGUAGE_PLACEHOLDER}
                style={{ width: 160 }}
                options={LANGUAGE_OPTIONS}
              />
              <Select
                value={sourceLanguage2List}
                onChange={(value) => {
                  if (checkMaxTranslateList(sourceLanguage1List, value)) {
                    setSourceLanguage2List(value)
                  }
                }}
                disabled={hasSttStarted || !sourceLanguage2}
                allowClear
                showSearch={false}
                mode="multiple"
                placeholder={SELECT_TRANS_LANGUAGE_PLACEHOLDER}
                maxCount={MAX_COUNT}
                style={{ width: 380 }}
                maxTagTextLength={10}
                options={LANGUAGE_OPTIONS}
              />
            </Space>
          </div>
        </div>
      </div>
      <div className={styles.btnWrapper}>
        <span className={styles.btn} onClick={onClickBtn}>
          {btnText}
          {loading ? <LoadingOutlined></LoadingOutlined> : null}
        </span>
      </div>
    </Modal>
  )
}

export default LanguageSettingDialog

import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
import { useEffect, useMemo, useRef, useState } from "react"
import { Modal, Alert, Select, Space, Flex } from "antd"
import { LANGUAGE_OPTIONS } from "@/common"
import { LoadingOutlined } from "@ant-design/icons"
import { ILanguageItem } from "@/manager"
import {
  addMessage,
  removeMessage,
  setIsUpdating,
  setLanguageSelect,
} from "@/store/reducers/global"
import { useTranslation } from "react-i18next"

import styles from "./index.module.scss"
import TextArea from "antd/es/input/TextArea"
import { UPDATE_ERROR_TIP_KEY } from "@/types"

interface ILanguageSettingDialogProps {
  open?: boolean
  onOk?: () => void
  onCancel?: () => void
  showTargetLanguage?: boolean
}

const SELECT_LIVE_LANGUAGE_PLACEHOLDER = "Select on-site language"
const SELECT_TRANS_LANGUAGE_PLACEHOLDER = "Please select a language to translate into"
export const MAX_COUNT = 10
let clickCount = 0
const MAX_CLICK_COUNT = 5
let time = 0

const LanguageSettingDialog = (props: ILanguageSettingDialogProps) => {
  const { open, onOk, onCancel, showTargetLanguage = true } = props
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const sttData = useSelector((state: RootState) => state.global.sttData)
  // const roomType = useSelector((state: RootState) => state.global.roomType)
  const isUpdating = useSelector((state: RootState) => state.global.isUpdating)
  const languageSelect = useSelector((state: RootState) => state.global.languageSelect)
  const { transcribe1, translate1List = [], transcribe2, translate2List = [] } = languageSelect
  const [sourceLanguage1, setSourceLanguage1] = useState(transcribe1)
  const [sourceLanguage1List, setSourceLanguage1List] = useState<string[]>(translate1List)
  const [sourceLanguage2, setSourceLanguage2] = useState(transcribe2)
  const [sourceLanguage2List, setSourceLanguage2List] = useState<string[]>(translate2List)
  const [loading, setLoading] = useState(false)
  const [extensionParams, setExtensionParams] = useState("")
  const [isDevMode, setIsDevMode] = useState(false)
  const titleRef = useRef<HTMLDivElement>(null)
  const [hasSourceLanguage, setHasSourceLanguage] = useState(true)
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
    setHasSourceLanguage(!!sourceLanguage1)
    if (!sourceLanguage1) {
      return dispatch(addMessage({ content: t("setting.setSourceLanguage"), type: "error" }))
    }

    if (checkSomeSourceLanguage()) {
      return dispatch(addMessage({ content: t("setting.sameLanguage"), type: "success" }))
    }

    setLoading(true)

    try {
      if (!hasSttStarted) {
        const query = new URLSearchParams(window.location.hash.split("?")[1])
        // const count = query.get("count") ? parseInt(query.get("count") || "", 10) : MAX_COUNT
        const count = MAX_COUNT
        if (translate1List.length > count || translate1List.length === count) {
          dispatch(addMessage({ content: "Target language exceeds the limit", type: "error" }))
          setLoading(false)
          onCancel?.()
          return
        }
        dispatch(
          setLanguageSelect({
            ...languageSelect,
            transcribe1: sourceLanguage1,
            transcribe2: sourceLanguage2,
          }),
        )
        await window.sttManager.startTranscription({
          languages,
          extensionParams,
        })
      } else {
        console.log("click button stopTranscription");
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
    if (arr.length > MAX_COUNT) {
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
    setIsDevMode(true)
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

  const handleUpdateSource = async () => {
    if (isUpdating) {
      return
    }
    dispatch(setIsUpdating(true))
    dispatch(
      setLanguageSelect({
        ...languageSelect,
        transcribe1: sourceLanguage1,
        transcribe2: sourceLanguage2,
      }),
    )
    if (!hasSttStarted) {
      await window.sttManager.startTranscription({
        languages,
        extensionParams,
      })
      dispatch(setIsUpdating(false))
      return
    }
    try {
      await window.sttManager.updateTranscription({
        languages,
      })
      dispatch(setIsUpdating(false))
      dispatch(removeMessage(UPDATE_ERROR_TIP_KEY))
      onCancel?.()
    } catch (error: any) {
      console.log("updateTranscription error", error.message)
      dispatch(setIsUpdating(false))
      onCancel?.()
      dispatch(
        addMessage({
          content: "update too frequently, please try again later",
          type: "error",
          duration: 5,
          key: UPDATE_ERROR_TIP_KEY,
        }),
      )
    }
  }

  const handleExtensionParamsChanged = (e: any) => {
    setExtensionParams(e.target.value)
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
      maskClosable={false}
      // local debugger
      // closable={hasSttStarted || true}
      closable={hasSttStarted}
    >
      <div className={styles.content}>
        <Alert message={t("setting.limitDuration")} showIcon type="warning" />
        <div className={styles.textTop}>{t("setting.languagesSelect")}</div>
        <div className={styles.textBottom}>{t("setting.tipMulti")}</div>
        <div className={styles.section}>
          <Space>
            <div className={styles.text} style={{ width: 160 }}>
              {t("setting.liveLanguage")} 1
            </div>
            {showTargetLanguage && (
              <div className={styles.text}>
                {t("setting.liveLanguage")} 1 - {t("translationLanguage")}
              </div>
            )}
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
                // allowClear
                placeholder={SELECT_LIVE_LANGUAGE_PLACEHOLDER}
                style={{ width: 160 }}
                options={LANGUAGE_OPTIONS}
                status={!hasSourceLanguage ? "error" : ""}
              />
              {showTargetLanguage && (
                <Select
                  value={sourceLanguage1List}
                  onChange={(value) => {
                    if (checkMaxTranslateList(value, sourceLanguage2List)) {
                      setSourceLanguage1List(value)
                    }
                  }}
                  // allowClear
                  disabled={true}
                  showSearch={false}
                  mode="multiple"
                  placeholder={SELECT_TRANS_LANGUAGE_PLACEHOLDER}
                  maxCount={MAX_COUNT}
                  style={{ width: 380 }}
                  maxTagTextLength={MAX_COUNT}
                  options={LANGUAGE_OPTIONS}
                />
              )}
            </Space>
          </div>
        </div>
        {isDevMode && !hasSttStarted && (
          <Flex style={{ marginTop: 20 }}>
            <TextArea
              placeholder="Please input extension params. e.g:{control***:**}"
              value={extensionParams}
              onChange={handleExtensionParamsChanged}
            />
          </Flex>
        )}
      </div>
      <div className={styles.btnWrapper}>
        {hasSttStarted && (
          <span className={styles.btn} onClick={handleUpdateSource}>
            {t("setting.sttUpdate")}
            {isUpdating ? <LoadingOutlined></LoadingOutlined> : null}
          </span>
        )}
        <span className={styles.btn} onClick={onClickBtn}>
          {btnText}
          {loading ? <LoadingOutlined></LoadingOutlined> : null}
        </span>
      </div>
    </Modal>
  )
}

export default LanguageSettingDialog

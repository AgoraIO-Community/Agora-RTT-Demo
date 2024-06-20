import { Input, Select, Upload } from "antd"
import { LoadingOutlined } from "@ant-design/icons"
import {
  AI_PROMPT_PLACEHOLDER,
  AI_RESULT_PLACEHOLDER,
  AI_PROMPT_OPTIONS,
  AI_USER_CONTENT_OPTIONS,
  apiAiAnalysis,
} from "@/common"
import { UploadIcon } from "@/components/icons"
import { forwardRef, useMemo, useRef, useState, useImperativeHandle } from "react"

import styles from "./index.module.scss"
import { useTranslation } from "react-i18next"

const { TextArea } = Input

interface AiAssistantProps {}

export interface AiAssistantHandler {
  setConversation: (value: string) => void
}

const AiAssistant = forwardRef((props: AiAssistantProps, ref) => {
  const { t } = useTranslation()
  const [systemText, setSystemText] = useState("")
  const [system, setSystem] = useState("")
  const [contentText, setContentText] = useState("")
  const [resultText, setResultText] = useState("")
  const [conversationSelectValue, setConversationSelectValue] = useState("")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => {
    return {
      setConversation(value) {
        setContentText(value)
      },
    } as AiAssistantHandler
  })

  const aiUserContentOptions = useMemo(() => {
    return AI_USER_CONTENT_OPTIONS.filter((item) => item.type === system).map((item) => ({
      label: item.label,
      value: item.label,
    }))
  }, [system])

  const onPromptChange = (value: string) => {
    setSystem(value)
    setConversationSelectValue("")
    // setContentText("")
    const target = AI_PROMPT_OPTIONS.find((item) => item.label === value)
    if (target) {
      setSystemText(target.value)
    }
  }

  const onConversationChange = (value: string) => {
    setConversationSelectValue(value)
    const target = AI_USER_CONTENT_OPTIONS.find((item) => item.label === value)
    if (target) {
      setContentText(target.value)
    }
  }

  const onSystemTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSystemText(e.target.value)
  }

  const onConversationTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setContentText(e.target.value)
  }

  const onClickClearResult = () => {
    setResultText("")
  }

  const onClickClearAll = () => {
    setSystemText("")
    setContentText("")
    setResultText("")
  }

  const onClickAnalyze = async () => {
    if (loading) {
      return
    }
    setLoading(true)
    const res = await apiAiAnalysis({ system: systemText, userContent: contentText })
    setResultText(res.result)
    setLoading(false)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setContentText(content)
      }
      reader.readAsText(file)
    }
  }

  const onClickUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={styles.aiAssistant}>
      <div className={styles.prompt}>
        <div className={styles.text}>{t("prompt")}</div>
        <Select
          placeholder={t("ai.selectPromptSample")}
          className={styles.select}
          options={AI_PROMPT_OPTIONS.map((item) => ({
            label: item.label,
            value: item.label,
          }))}
          onChange={onPromptChange}
        ></Select>
        <TextArea
          rows={10}
          placeholder={AI_PROMPT_PLACEHOLDER}
          value={systemText}
          onChange={onSystemTextChange}
        ></TextArea>
      </div>
      <div className={styles.conversation}>
        <div className={styles.text}>{t("conversationText")}</div>
        <div className={styles.select}>
          <Select
            style={{ width: 210 }}
            placeholder={t("ai.selectConversation")}
            options={aiUserContentOptions}
            onChange={onConversationChange}
            value={conversationSelectValue}
          ></Select>
          <span className={styles.btn} onClick={onClickUpload}>
            <input accept=".txt" type="file" onChange={onFileChange} ref={fileInputRef}></input>
            <span className={styles.text}>{t("loadText")}</span>
            <UploadIcon></UploadIcon>
          </span>
        </div>
        <TextArea
          rows={10}
          placeholder="-"
          value={contentText}
          onChange={onConversationTextChange}
        ></TextArea>
      </div>
      <div className={styles.result}>
        <div className={styles.text}>{t("analysisResult")}</div>
        <div className={styles.textAreaWrapper}>
          <TextArea
            rows={10}
            placeholder={AI_RESULT_PLACEHOLDER}
            classNames={{
              textarea: styles.cusTextarea,
            }}
            value={resultText}
          ></TextArea>
          {/* <span className={styles.btn} onClick={onClickClearResult}>
            Clear Result
          </span> */}
        </div>
      </div>
      <div className={styles.btnWrapper}>
        <span className={styles.btnAnalyze} onClick={onClickAnalyze}>
          {t("analyze")}
          {loading ? <LoadingOutlined></LoadingOutlined> : null}
        </span>
        <span className={styles.btnClearAll} onClick={onClickClearAll}>
          {t("clearAll")}
        </span>
      </div>
    </div>
  )
})

export default AiAssistant

import React, { useState } from "react"
import { CloseOutlined } from "@ant-design/icons"
import { useDispatch } from "react-redux"
import { setSttCountDown } from "@/store/reducers/global"
import { EXPERIENCE_DURATION } from "@/common"
import { useTranslation } from "react-i18next"

import styles from "./index.module.scss"

interface IExtendMessageProps {
  open?: boolean
  onClose?: () => void
}

const ExtendMessage = (props: IExtendMessageProps) => {
  const { open = false, onClose } = props
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const onClickExtend = () => {
    window.sttManager.reStartTranscription()
    window.rtmManager.setSttStatus("start")
    dispatch(setSttCountDown(EXPERIENCE_DURATION))
    onClose?.()
  }

  return open ? (
    <div className={styles.extendMessage}>
      <span className={styles.text}>{t("conversation.extendExperienceFreeText")}</span>
      <span className={styles.btn} onClick={onClickExtend}>
        {t("conversation.extendExperience")}
      </span>
      <CloseOutlined onClick={() => onClose?.()}></CloseOutlined>
    </div>
  ) : null
}

export default ExtendMessage

import {
  MicIcon,
  CamIcon,
  MemberIcon,
  CaptionIcon,
  TranscriptionIcon,
  SettingIcon,
  AiIcon,
  ArrowUpIcon,
} from "../icons"
import { useHost } from "@/common"
import { useSelector, useDispatch } from "react-redux"
import {
  setUserInfo,
  setMemberListShow,
  setDialogRecordShow,
  setCaptionShow,
  setAIShow,
  removeMenuItem,
  addMenuItem,
  setLocalAudioMute,
  setLocalVideoMute,
  addMessage,
} from "@/store/reducers/global"
import LanguageSettingDialog from "../dialog/language-setting"
import CaptionPopover from "./caption-popover"
import { RootState } from "@/store"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import styles from "./index.module.scss"

interface IFooterProps {
  style?: React.CSSProperties
}

const showAI = !!import.meta.env.VITE_AGORA_GPT_URL

const Footer = (props: IFooterProps) => {
  const { style } = props
  const nav = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { hostId, isHost } = useHost()
  const localAudioMute = useSelector((state: RootState) => state.global.localAudioMute)
  const localVideoMute = useSelector((state: RootState) => state.global.localVideoMute)
  const memberListShow = useSelector((state: RootState) => state.global.memberListShow)
  const dialogRecordShow = useSelector((state: RootState) => state.global.dialogRecordShow)
  const captionShow = useSelector((state: RootState) => state.global.captionShow)
  const aiShow = useSelector((state: RootState) => state.global.aiShow)
  const sttStatus = useSelector((state: RootState) => state.global.sttStatus)
  const [showLanguageSetting, setShowLanguageSetting] = useState(false)

  const MicText = useMemo(() => {
    return localAudioMute ? t("footer.unMuteAudio") : t("footer.muteAudio")
  }, [localAudioMute])

  const CameraText = useMemo(() => {
    return localVideoMute ? t("footer.unMuteVideo") : t("footer.muteVideo")
  }, [localVideoMute])

  const captionText = useMemo(() => {
    return captionShow ? t("footer.stopCC") : t("footer.startCC")
  }, [captionShow])

  const onClickMic = () => {
    dispatch(setLocalAudioMute(!localAudioMute))
  }

  const onClickCam = () => {
    dispatch(setLocalVideoMute(!localVideoMute))
  }

  const onClickMember = () => {
    dispatch(setMemberListShow(!memberListShow))
  }

  const onClickDialogRecord = () => {
    dispatch(setDialogRecordShow(!dialogRecordShow))
    if (dialogRecordShow) {
      dispatch(removeMenuItem("DialogRecord"))
    } else {
      dispatch(addMenuItem("DialogRecord"))
    }
  }

  const onClickCaption = () => {
    if (sttStatus !== "start") {
      if (!isHost) {
        return dispatch(addMessage({ content: t("footer.tipHostEnableCCFirst"), type: "info" }))
      }
      return dispatch(addMessage({ content: t("footer.tipEnableSTTFirst"), type: "info" }))
    }
    dispatch(setCaptionShow(!captionShow))
  }

  const onClickAiShow = () => {
    dispatch(setAIShow(!aiShow))
    if (aiShow) {
      dispatch(removeMenuItem("AI"))
    } else {
      dispatch(addMenuItem("AI"))
    }
  }

  const toggleLanguageSettingDialog = () => {
    if (!isHost) {
      return dispatch(addMessage({ content: t("footer.tipHostEnableCC"), type: "info" }))
    }
    setShowLanguageSetting(!showLanguageSetting)
  }

  const toggleDialogSelect = () => {}

  const onClickEnd = () => {
    nav("/")
    dispatch(addMessage({ content: "end meeting success!", type: "success" }))
  }

  return (
    <footer className={styles.footer} style={style}>
      <section className={styles.content}>
        {/* audio */}
        <span className={styles.item} onClick={onClickMic}>
          <MicIcon active={!localAudioMute}></MicIcon>
          <span className={styles.text}>{MicText}</span>
        </span>
        {/* video */}
        <span className={styles.item} onClick={onClickCam}>
          <CamIcon active={!localVideoMute}></CamIcon>
          <span className={styles.text}>{CameraText}</span>
        </span>
        {/* member */}
        <span className={styles.item} onClick={onClickMember}>
          <MemberIcon active={memberListShow}></MemberIcon>
          <span className={styles.text}>{t("footer.participantsList")}</span>
        </span>
        {/* caption */}
        <span
          className={`${styles.item} ${sttStatus == "end" ? "disabled" : ""}`}
          onClick={onClickCaption}
        >
          <CaptionIcon disabled={sttStatus == "end"} active={captionShow}></CaptionIcon>
          <span className={styles.text}>{captionText}</span>
        </span>
        <CaptionPopover>
          <span className={styles.arrowWrapper}>
            <ArrowUpIcon width={16} height={16}></ArrowUpIcon>
          </span>
        </CaptionPopover>
        {/* dialog */}
        <span className={`${styles.item}`} onClick={onClickDialogRecord}>
          <TranscriptionIcon active={dialogRecordShow}></TranscriptionIcon>
          <span className={styles.text}>{t("footer.conversationHistory")}</span>
        </span>
        {/* language */}
        <span
          className={`${styles.item} ${!isHost ? "disabled" : ""}`}
          onClick={toggleLanguageSettingDialog}
        >
          <SettingIcon disabled={!isHost}></SettingIcon>
          <span className={`${styles.text}`}>{t("footer.langaugesSetting")}</span>
        </span>
        {/* ai */}
        {showAI ? (
          <span className={styles.item} onClick={onClickAiShow}>
            <AiIcon active={aiShow}></AiIcon>
            <span className={styles.text}>{t("footer.aIAssistant")}</span>
          </span>
        ) : null}
      </section>
      <span className={styles.end} onClick={onClickEnd}>
        {t("closeConversation")}
      </span>
      <LanguageSettingDialog
        open={showLanguageSetting}
        onOk={() => setShowLanguageSetting(false)}
        onCancel={() => setShowLanguageSetting(false)}
      ></LanguageSettingDialog>
    </footer>
  )
}

export default Footer

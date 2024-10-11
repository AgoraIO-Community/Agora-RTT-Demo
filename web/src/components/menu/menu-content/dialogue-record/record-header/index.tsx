import { useEffect, useRef, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
import { useResizeObserver, formatTime } from "@/common"
import { SettingIcon } from "@/components/icons"
import { useTranslation } from "react-i18next"

import styles from "./index.module.scss"

interface IRecordHeaderProps {
  onClickSetting?: () => void
}

const RecordHeader = (props: IRecordHeaderProps) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const sttData = useSelector((state: RootState) => state.global.sttData)
  const [experienceDuration, setExperienceDuration] = useState(0)
  const headerRef = useRef<HTMLDivElement>(null)
  const tryRef = useRef<HTMLDivElement>(null)
  const headerDimensions = useResizeObserver(headerRef)

  useEffect(() => {
    if (!tryRef?.current) {
      return
    }
    if (headerDimensions.width >= 600) {
      tryRef.current.style.width = "500px"
    } else if (headerDimensions.width >= 500) {
      tryRef.current.style.width = "420px"
    }
  }, [headerDimensions])

  useEffect(() => {
    let timer: any

    if (sttData.status == "start") {
      timer = setInterval(async () => {
        if (sttData.startTime && sttData.duration) {
          const now = new Date().getTime()
          const duration = Math.floor((sttData.startTime + sttData.duration - now) / 1000)
          setExperienceDuration(duration)
        }
      }, 1000)
    }

    return () => {
      timer && clearInterval(timer)
    }
  }, [sttData])

  const onClickExtend = () => {
    window.sttManager.extendDuration({
      startTime: new Date().getTime(),
    })
  }

  const onClickSetting = () => {
    props?.onClickSetting?.()
  }

  return (
    <section ref={headerRef} className={styles.header}>
      {sttData.status == "start" ? (
        <>
          <div className={styles.start}>
            <div className={styles.try} ref={tryRef}>
              <span className={styles.text}>
                {t("conversation.onTrial")} &nbsp;
                <span className={styles.time}>{formatTime(experienceDuration)}</span> &nbsp;
                <span>{t("conversation.extendExperienceText")}</span>
              </span>
              <span className={styles.btn} onClick={onClickExtend}>
                {t("conversation.extendExperience")}
              </span>
            </div>
            {/* setting */}
            <div className={styles.setting} onClick={onClickSetting}>
              <SettingIcon></SettingIcon>
            </div>
          </div>
          <div className={styles.conversation}>{t("conversation.sttStarted")}</div>
        </>
      ) : (
        <div className={styles.conversation}>{t("conversation.sttStopped")}</div>
      )}
    </section>
  )
}

export default RecordHeader

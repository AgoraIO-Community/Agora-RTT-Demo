import { Switch, Input, message, Radio, App } from "antd"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/store"
import { InputStatuses, ROOM_TYPE } from "@/types"
import { useTranslation } from "react-i18next"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { genRandomUserId, REGEX_SPECIAL_CHAR, GITHUB_URL, parseQuery } from "@/common"
import { setOptions, setUserInfo } from "@/store/reducers/global"
import { version } from "../../../package.json"
import { useNavigate, useLocation } from "react-router-dom"

import styles from "./index.module.scss"
import logoSrc from "@/assets/login_logo.png"
import githubSrc from "@/assets/github.jpg"

const LoginPage = () => {
  const nav = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const { message } = App.useApp()
  const options = useSelector((state: RootState) => state.global.options)
  // const roomType = useSelector((state: RootState) => state.global.roomType)
  const [channel, setChannel] = useState("")
  const [userName, setUserName] = useState("")
  const [channelInputStatuses, setChannelInputStatuses] = useState<InputStatuses>("")
  const [showLanguageSetting, setShowLanguageSetting] = useState(false)

  const onChangeChannel = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (REGEX_SPECIAL_CHAR.test(value)) {
      setChannelInputStatuses("error")
      value = value.replace(REGEX_SPECIAL_CHAR, "")
    } else {
      setChannelInputStatuses("")
    }
    setChannel(value)
  }

  const onChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (REGEX_SPECIAL_CHAR.test(value)) {
      value = value.replace(REGEX_SPECIAL_CHAR, "")
    }
    setUserName(value)
  }

  const onLanguageChange = useCallback(
    (checked: boolean) => {
      const language = checked ? "zh" : "en"
      dispatch(setOptions({ language }))
      i18n.changeLanguage(language)
    },
    [i18n],
  )

  const onClickJoin = () => {
    if (!channel) {
      return message.error("please enter channel name!")
    }
    if (!userName) {
      return message.error("please enter user name!")
    }
    // const prefix = roomType === ROOM_TYPE.SINGLE ? `${uuidv4().slice(0, 4)}-` : ""

    dispatch(setOptions({ channel: `${channel}` }))
    dispatch(
      setUserInfo({
        userName,
        userId: genRandomUserId(),
      }),
    )
    if (location.search) {
      nav(`/home?${location.search.slice(1)}`)
    } else {
      nav("/home")
    }
  }

  const onClickGithub = () => {
    window.open(GITHUB_URL, "_blank")
  }

  return (
    <div className={styles.loginPage}>
      <section className={styles.content}>
        <section className={styles.top}>
          <span className={styles.github} onClick={onClickGithub}>
            <img src={githubSrc} alt="" />
            <span className={styles.text}>{t("login.github")}</span>
          </span>
          <span className={styles.language}>
            <Switch
              size="default"
              checkedChildren="中文"
              unCheckedChildren="English"
              value={options.language === "zh"}
              onChange={onLanguageChange}
            />
          </span>
        </section>
        <div className={styles.title}>
          <div className={styles.logo}>
            <img src={logoSrc} alt="" />
          </div>
          <div className={styles.text}>{t("login.title")}</div>
        </div>
        <div className={styles.item}>
          <Input
            status={channelInputStatuses}
            allowClear
            placeholder="please enter channel name"
            onChange={onChangeChannel}
            value={channel}
          />
        </div>
        <div className={styles.item}>
          <Input
            allowClear
            placeholder="please enter user name"
            onChange={onChangeUserName}
            value={userName}
          />
        </div>
        <div className={styles.btn} onClick={onClickJoin}>
          {t("login.join")}
        </div>
        <div className={styles.version}>Version {version}</div>
      </section>
    </div>
  )
}

export default LoginPage

import { Popover } from "antd"
import { CheckOutlined } from "@ant-design/icons"
import { LANGUAGE_LIST } from "@/common"
import { RootState } from "@/store"
import { setCaptionLanguages } from "@/store/reducers/global"
import { useSelector, useDispatch } from "react-redux"
import { DialogLanguageType } from "@/types"

import styles from "./index.module.scss"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

interface ICaptionPopoverProps {
  children?: React.ReactNode
}

interface CaptionPopoverItem {
  text: string
  active: boolean
  stt: string
  type: DialogLanguageType
}

const CaptionPopover = (props: ICaptionPopoverProps) => {
  const { children } = props
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const captionLanguages = useSelector((state: RootState) => state.global.captionLanguages)
  const languageSelect = useSelector((state: RootState) => state.global.languageSelect)

  const captionItems = useMemo(() => {
    const items: CaptionPopoverItem[] = []
    items.push({
      text: t("liveLanguage"),
      stt: "live",
      type: "live",
      active: captionLanguages.includes("live"),
    })
    const { translate1List = [], translate2List = [] } = languageSelect
    const translateArr = [...new Set([...translate1List, ...translate2List])]
    for (let i = 0; i < translateArr.length; i++) {
      const target = LANGUAGE_LIST.find((item) => item.code == translateArr[i])
      if (target) {
        items.push({
          text: target?.label || "",
          stt: translateArr[i],
          type: "translate",
          active: captionLanguages.includes(translateArr[i]),
        })
      }
    }

    return items
  }, [captionLanguages, languageSelect])

  const onSelect = (item: CaptionPopoverItem) => {
    const languages = [...captionLanguages]
    const index = languages.indexOf(item.stt)
    if (index > -1) {
      languages.splice(index, 1)
    } else {
      languages.push(item.stt)
    }
    const translateArr = languages.filter((item) => item !== "live")
    if (translateArr.length >= 2) {
      const index = languages.findIndex((item) => item !== "live")
      languages.splice(index, 1)
    }
    dispatch(setCaptionLanguages(languages))
  }

  return (
    <Popover
      overlayInnerStyle={{ padding: 0 }}
      content={
        <div className={styles.content}>
          {captionItems.map((item, index) => {
            return (
              <div
                key={index}
                className={`${styles.item} ${item.active ? "active" : ""}`}
                onClick={() => onSelect(item)}
              >
                <span className={styles.text}>{item.text}</span>
                {item.active ? (
                  <CheckOutlined
                    style={{
                      color: "#3D53F5",
                    }}
                  ></CheckOutlined>
                ) : null}
              </div>
            )
          })}
        </div>
      }
      trigger="click"
    >
      {children}
    </Popover>
  )
}

export default CaptionPopover

import { Popover } from "antd"
import { CheckOutlined } from "@ant-design/icons"
import { RootState } from "@/store"
import { setDialogLanguageType } from "@/store/reducers/global"
import { useSelector, useDispatch } from "react-redux"
import { DialogLanguageType } from "@/types"

import styles from "./index.module.scss"
import { useTranslation } from "react-i18next"

interface IDialogPopoverProps {
  children?: React.ReactNode
}

const DialogPopover = (props: IDialogPopoverProps) => {
  const { children } = props
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const dialogLanguageType = useSelector((state: RootState) => state.global.dialogLanguageType)

  const onSelect = (languageType: DialogLanguageType) => {
    if (dialogLanguageType != languageType) {
      dispatch(setDialogLanguageType(languageType))
    }
  }

  return (
    <Popover
      overlayInnerStyle={{ padding: 0 }}
      content={
        <div className={styles.content}>
          <div
            className={`${styles.item} ${dialogLanguageType == "live" ? "active" : ""}`}
            onClick={() => onSelect("live")}
          >
            <span className={styles.text}>{t("liveLanguage")}</span>
            {dialogLanguageType == "live" ? (
              <CheckOutlined
                style={{
                  color: "#3D53F5",
                }}
              ></CheckOutlined>
            ) : null}
          </div>
          <div
            className={`${styles.item} ${dialogLanguageType == "translate" ? "active" : ""}`}
            onClick={() => onSelect("translate")}
          >
            <span className={styles.text}>{t("translationLanguage")}</span>
            {dialogLanguageType == "translate" ? (
              <CheckOutlined
                style={{
                  color: "#3D53F5",
                }}
              ></CheckOutlined>
            ) : null}
          </div>
        </div>
      }
      trigger="click"
    >
      {children}
    </Popover>
  )
}

export default DialogPopover

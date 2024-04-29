import MenuTitle from "./menu-title"
import { RootState } from "@/store"
import { useSelector } from "react-redux"
import AiAssistant from "./ai-assistant"
import DialogRecord from "./dialog-record"

import styles from "./index.module.scss"

const Menu = () => {
  const menuList = useSelector((state: RootState) => state.global.menuList)
  const activeType = menuList[0]

  return (
    <div className={styles.menu}>
      <MenuTitle></MenuTitle>
      <div className={styles.content}>
        {activeType === "AI" ? <AiAssistant></AiAssistant> : <DialogRecord></DialogRecord>}
      </div>
    </div>
  )
}

export default Menu

import { useSelector, useDispatch } from "react-redux"
import { addMenuItem } from "@/store/reducers/global"
import AiAssistant, { AiAssistantHandler } from "./ai-assistant"
import DialogueRecord from "./dialogue-record"
import { RootState } from "@/store"
import { useRef } from "react"

import styles from "./index.module.scss"

const MenuContent = () => {
  const dispatch = useDispatch()
  const menuList = useSelector((state: RootState) => state.global.menuList)
  const activeType = menuList[0]
  const aiAssistantRef = useRef<AiAssistantHandler>(null)

  const onExport = (value: string) => {
    dispatch(addMenuItem("AI"))
    setTimeout(() => {
      aiAssistantRef.current?.setConversation(value)
    }, 0)
  }

  return (
    <div className={styles.menuContent}>
      {activeType === "AI" ? (
        <AiAssistant ref={aiAssistantRef}></AiAssistant>
      ) : (
        <DialogueRecord onExport={onExport}></DialogueRecord>
      )}
    </div>
  )
}

export default MenuContent

import { useRef, useMemo, useEffect, useState } from "react"
import MenuTitle from "./menu-title"
import { RootState } from "@/store"
import { useSelector } from "react-redux"
import AiAssistant from "./ai-assistant"
import DialogRecord from "./dialog-record"

import styles from "./index.module.scss"

const MIN_WIDTH = 368
let menuWidth = MIN_WIDTH
let startX = 0
let isDragging = false

const Menu = () => {
  const menuList = useSelector((state: RootState) => state.global.menuList)
  const memberListShow = useSelector((state: RootState) => state.global.memberListShow)
  const activeType = menuList[0]
  const borderLeftRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const MAX_WIDTH = useMemo(() => {
    const MEMBER_LIST_WIDTH = 200
    const CENTER_MIN_WIDTH = 200
    const screenWidth = window.innerWidth
    return screenWidth - (memberListShow ? MEMBER_LIST_WIDTH : 0) - CENTER_MIN_WIDTH
  }, [memberListShow])

  useEffect(() => {
    if (!borderLeftRef.current) {
      return
    }
    borderLeftRef.current.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      borderLeftRef.current?.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [MAX_WIDTH])

  const handleMouseDown = (e: MouseEvent) => {
    startX = e.clientX
    menuWidth = menuRef.current!.offsetWidth
    isDragging = true
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const diff = startX - e.clientX
      let newMenuWidth = menuWidth + diff
      if (newMenuWidth > MAX_WIDTH) {
        newMenuWidth = MAX_WIDTH
      } else if (newMenuWidth < MIN_WIDTH) {
        newMenuWidth = MIN_WIDTH
      }
      menuRef.current!.style.width = `${newMenuWidth}px`
    }
  }

  const handleMouseUp = () => {
    isDragging = false
  }

  return (
    <div className={styles.menu} ref={menuRef}>
      <div className={styles.borderLeft} ref={borderLeftRef}></div>
      <MenuTitle></MenuTitle>
      <div className={styles.content}>
        {activeType === "AI" ? <AiAssistant></AiAssistant> : <DialogRecord></DialogRecord>}
      </div>
    </div>
  )
}

export default Menu

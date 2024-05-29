import { useRef, useMemo, useEffect, useState } from "react"
import MenuTitle from "./menu-title"
import MenuContent from "./menu-content"
import { RootState } from "@/store"
import { useSelector } from "react-redux"

import styles from "./index.module.scss"

let menuWidth = 0
let startX = 0
let isDragging = false

const Menu = () => {
  const memberListShow = useSelector((state: RootState) => state.global.memberListShow)
  const borderLeftRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const menuInitWith = useMemo(() => {
    return menuRef.current?.offsetWidth ?? 0
  }, [menuRef.current])

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
      const MIN_WIDTH = menuInitWith
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
      <MenuContent></MenuContent>
    </div>
  )
}

export default Menu

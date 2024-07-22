import { RefObject, useEffect, useRef, useState, useMemo } from "react"
import { Button, message } from "antd"
import { RootState, AppDispatch } from "@/store"
import { removeMessage, setPageInfo } from "@/store/reducers/global"
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux"
import { TOAST_DURATION } from "@/common"

export const useAppDispatch = () => useDispatch<AppDispatch>()

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useCatchError = () => {
  const _showError = (error: Error) => {
    if (error?.message) {
      message.error(error.message, TOAST_DURATION)
    }
  }

  const handleError = (e: ErrorEvent) => {
    const { error } = e
    _showError(error)
  }

  const unhandledRejection = (e: PromiseRejectionEvent) => {
    const { reason } = e
    _showError(reason)
  }

  useEffect(() => {
    window.addEventListener("error", handleError, true)
    window.addEventListener("unhandledrejection", unhandledRejection)

    return () => {
      window.removeEventListener("error", handleError, true)
      window.removeEventListener("unhandledrejection", unhandledRejection)
    }
  }, [])
}

export const useScreenResize = () => {
  const dispatch = useDispatch()

  const onResize = () => {
    dispatch(
      setPageInfo({
        width: window.innerWidth,
        height: window.innerHeight,
      }),
    )
  }

  useEffect(() => {
    onResize()
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])
}

export const useMount = (callback?: () => {}) => {
  const isMountRef = useRef(false)

  useEffect(() => {
    callback?.()
    isMountRef.current = true
  }, [])

  return isMountRef.current
}

export const usePrevious = (value: any) => {
  const ref = useRef()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export const useMessage = () => {
  const dispatch = useDispatch()
  const messageList = useSelector((state: RootState) => state.global.messageList)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    if (messageList.length) {
      const first = messageList[0]
      if (first) {
        messageApi.open({
          content: first.content,
          type: first.type,
          duration: first.duration || 3,
        })
        if (first.key) {
          dispatch(removeMessage(first.key))
        }
      }
    }
  }, [messageList])

  return { contextHolder }
}

export const useResizeObserver = (ref: RefObject<React.ReactNode | HTMLElement>) => {
  const [dimensions, setDimensions] = useState<Omit<DOMRectReadOnly, "toJSON">>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })
  const resizeObserverRef = useRef<any>(null)

  useEffect(() => {
    resizeObserverRef.current = new ResizeObserver((entries) => {
      if (!Array.isArray(entries)) return
      const entry = entries[0]
      if (entry) {
        setDimensions(entry.contentRect)
      }
    })

    if (ref.current) {
      resizeObserverRef.current.observe(ref.current)
    }

    return () => {
      resizeObserverRef.current.disconnect()
    }
  }, [ref])

  return dimensions
}

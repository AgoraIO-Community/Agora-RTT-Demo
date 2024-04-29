import aiSvg from "@/assets/upload.svg?react"
import { IconProps } from "../types"

export const UploadIcon = (props: IconProps) => {
  const { ...rest } = props

  return aiSvg({
    ...rest,
  })
}

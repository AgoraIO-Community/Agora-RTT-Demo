import captionSvg from "@/assets/caption.svg?react"
import { IconProps } from "../types"

interface ICaptionIconProps extends IconProps {
  active?: boolean
  disabled?: boolean
}

export const CaptionIcon = (props: ICaptionIconProps) => {
  const { active, disabled, ...rest } = props
  let color = "#667085"
  if (active) {
    color = "#3D53F5"
  }
  if (disabled) {
    color = "#98A2B3"
  }

  return captionSvg({
    color,
    ...rest,
  })
}

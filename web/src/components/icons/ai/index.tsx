import aiSvg from "@/assets/ai.svg?react"
import { IconProps } from "../types"

interface IAiIconProps extends IconProps {
  active?: boolean
}

export const AiIcon = (props: IAiIconProps) => {
  const { active, ...rest } = props
  const color = active ? "#3D53F5" : "#667085"

  return aiSvg({
    color,
    ...rest,
  })
}

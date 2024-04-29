import settingSvg from "@/assets/setting.svg?react"
import { IconProps } from "../types"

interface ISettingIconProps extends IconProps {
  disabled?: boolean
}

export const SettingIcon = (props: ISettingIconProps) => {
  const { disabled, ...rest } = props

  const color = disabled ? "#98A2B3" : "#667085"

  return settingSvg({
    color,
    ...rest,
  })
}

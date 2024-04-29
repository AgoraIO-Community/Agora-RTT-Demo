import camMuteSvg from "@/assets/cam_mute.svg?react"
import camUnMuteSvg from "@/assets/cam_unmute.svg?react"
import { IconProps } from "../types"

interface ICamIconProps extends IconProps {
  active?: boolean
}

export const CamIcon = (props: ICamIconProps) => {
  const { active, ...rest } = props

  if (active) {
    return camUnMuteSvg(rest)
  } else {
    return camMuteSvg(rest)
  }
}

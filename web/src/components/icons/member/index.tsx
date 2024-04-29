import MemberSvg from "@/assets/member.svg?react"
import { IconProps } from "../types"

interface IMemberIconProps extends IconProps {
  active?: boolean
}

export const MemberIcon = (props: IMemberIconProps) => {
  const { active, ...rest } = props
  const color = active ? "#3D53F5" : "#667085"

  return MemberSvg({
    color,
    ...rest,
  })
}

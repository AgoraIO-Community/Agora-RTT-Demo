import { IconProps } from "../types"
import transcriptionSvg from "@/assets/transcription.svg?react"

interface ITranscriptionIconProps extends IconProps {
  active?: boolean
}

export const TranscriptionIcon = (props: ITranscriptionIconProps) => {
  const { active, ...rest } = props

  const color = active ? "#3D53F5" : "#667085"

  return transcriptionSvg({
    color,
    ...rest,
  })
}

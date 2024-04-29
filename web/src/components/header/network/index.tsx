import { NetworkQuality } from "agora-rtc-sdk-ng"
import { useEffect, useState } from "react"
import { NetworkIcon } from "@/components/icons"

const NetWork = () => {
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>()

  useEffect(() => {
    window.rtcManager.on("networkQuality", onNetworkQuality)

    return () => {
      window.rtcManager.off("networkQuality", onNetworkQuality)
    }
  }, [])

  const onNetworkQuality = (quality: NetworkQuality) => {
    setNetworkQuality(quality)
  }

  return (
    <span>
      <NetworkIcon level={networkQuality?.uplinkNetworkQuality}></NetworkIcon>
    </span>
  )
}

export default NetWork

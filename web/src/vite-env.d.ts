/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import { RtcManager, RtmManager, SttManager } from "@/manager"

declare global {
  interface Window {
    rtcManager: RtcManager
    rtmManager: RtmManager
    sttManager: SttManager
  }
}

import AgoraRTC, {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  UID,
} from "agora-rtc-sdk-ng"
import { AGEventEmitter } from "../events"
import { RtcEvents, IUserTracks } from "./types"
import { parser } from "../parser"
import { apiGetAgoraToken } from "@/common"

const appId = import.meta.env.VITE_AGORA_APP_ID

export class RtcManager extends AGEventEmitter<RtcEvents> {
  private _joined
  client: IAgoraRTCClient
  localTracks: IUserTracks
  currentSpeaker: UID | undefined

  constructor() {
    super()
    this._joined = false
    this.localTracks = {}
    this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
    parser.removeAllEventListeners()
    console.log("[test] RtcManager constructor")
    this._listenRtcEvents()

    this._listenParserStreamEvent()
  }

  async join({ channel, userId }: { channel: string; userId: number | string }) {
    if (!this._joined) {
      const token = await apiGetAgoraToken({ channel, uid: userId })
      await this.client?.join(appId, channel, token, userId)
      this._joined = true
      this.client.enableAudioVolumeIndicator()
    }
  }

  async createTracks() {
    const tracks = await AgoraRTC.createMicrophoneAndCameraTracks({
      AGC: false,
    })
    this.localTracks.audioTrack = tracks[0]
    this.localTracks.videoTrack = tracks[1]
    this.emit("localUserChanged", this.localTracks)
  }

  async publish() {
    if (this.localTracks.videoTrack && this.localTracks.audioTrack) {
      await this.client.publish([this.localTracks.videoTrack, this.localTracks.audioTrack])
    } else {
      const msg = "videoTrack or audioTrack is undefined"
      throw new Error(msg)
    }
  }

  async destroy() {
    this.localTracks?.audioTrack?.close()
    this.localTracks?.videoTrack?.close()
    if (this._joined) {
      await this.client?.leave()
    }
    this._resetData()
  }

  // ----------- public methods ------------

  // -------------- private methods --------------
  _listenRtcEvents() {
    this.client.on("network-quality", (quality) => {
      this.emit("networkQuality", quality)
    })
    this.client.on("user-published", async (user, mediaType) => {
      await this.client.subscribe(user, mediaType)
      if (mediaType === "audio") {
        this._playAudio(user.audioTrack)
      }
      this.emit("remoteUserChanged", {
        userId: user.uid,
        audioTrack: user.audioTrack,
        videoTrack: user.videoTrack,
      })
    })
    this.client.on("user-unpublished", async (user, mediaType) => {
      await this.client.unsubscribe(user, mediaType)
      this.emit("remoteUserChanged", {
        userId: user.uid,
        audioTrack: user.audioTrack,
        videoTrack: user.videoTrack,
      })
    })
    this.client.on("stream-message", (uid: UID, stream: any) => {
      console.log("stream-message", uid, stream)
      parser.praseData(stream)
    })

    this.client.on("volume-indicator", (volumes) => {
      if (volumes && volumes.length > 0) {
        // Find users with the highest volume level
        let maxVolumeUser = volumes[0]
        for (let i = 1; i < volumes.length; i++) {
          if (volumes[i].level > maxVolumeUser.level) {
            maxVolumeUser = volumes[i]
          }
        }
        if (this.currentSpeaker === maxVolumeUser.uid) {
          return
        }
        // Update the current speaker
        this.currentSpeaker = maxVolumeUser.uid
        // Send event notification
        this.emit("speakerChanged", maxVolumeUser.uid)
      }
    })
  }

  _playAudio(audioTrack: IMicrophoneAudioTrack | IRemoteAudioTrack | undefined) {
    if (audioTrack && !audioTrack.isPlaying) {
      audioTrack.play()
    }
  }

  _listenParserStreamEvent() {
    parser.on("streamtextstreamReceived", (textstream) => {
      console.log("[test] textstream event", textstream)
      this.emit("textstreamReceived", textstream)
    })
  }

  _resetData() {
    this.localTracks = {}
    this._joined = false
  }
}

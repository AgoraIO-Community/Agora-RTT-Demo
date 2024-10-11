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

  constructor() {
    super()
    this._joined = false
    this.localTracks = {}
    this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
    this._listenRtcEvents()
    this._listenParserStreamEvent()
  }

  async join({ channel, userId }: { channel: string; userId: number | string }) {
    if (!this._joined) {
      const token = await apiGetAgoraToken({ channel, uid: userId })
      await this.client?.join(appId, channel, token, userId)
      this._joined = true
    }
  }

  async createTracks() {
    const tracks = await AgoraRTC.createMicrophoneAndCameraTracks()
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
      parser.praseData(stream)
    })
  }

  _playAudio(audioTrack: IMicrophoneAudioTrack | IRemoteAudioTrack | undefined) {
    if (audioTrack && !audioTrack.isPlaying) {
      audioTrack.play()
    }
  }

  _listenParserStreamEvent() {
    parser.on("textstreamReceived", (textstream) => {
      this.emit("textstreamReceived", textstream)
    })
  }

  _resetData() {
    this.localTracks = {}
    this._joined = false
  }
}

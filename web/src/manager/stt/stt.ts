import {
  apiSTTStopTranscription,
  apiSTTStartTranscription,
  apiSTTAcquireToken,
  getSttOptionsFromLocal,
  setSttOptionsToLocal,
  removeSttOptionsFromLocal,
} from "@/common"
import { AGEventEmitter } from "../events"
import { STTEvents, STTManagerStartOptions, STTManagerOptions, STTManagerInitData } from "./types"
import { RtmManager } from "../rtm"

export class SttManager extends AGEventEmitter<STTEvents> {
  options?: STTManagerOptions
  userId: string | number = ""
  channel: string = ""
  rtmManager: RtmManager
  private _init: boolean = false

  get hasInit() {
    return this._init
  }

  constructor(data: STTManagerInitData) {
    super()
    const { rtmManager } = data
    this.rtmManager = rtmManager
  }

  async init({
    userId,
    channel,
    userName,
  }: {
    userId: string | number
    channel: string
    userName: string
  }) {
    this.userId = userId
    this.channel = channel
    await this.rtmManager.join({
      userId: userId + "",
      userName,
      channel,
    })
    this._init = true
  }

  async startTranscription(startOptions: STTManagerStartOptions) {
    if (!this.hasInit) {
      throw new Error("please init first")
    }
    // aquire lock
    await this.rtmManager.acquireLock()
    // aquire token
    const data = await apiSTTAcquireToken({
      channel: this.channel,
      uid: this.userId,
    })
    const token = data.tokenName
    if (!token) {
      throw new Error("token is not found")
    }
    const languages = startOptions.languages
    const res = await apiSTTStartTranscription({
      uid: this.userId,
      channel: this.channel,
      languages: startOptions.languages,
      token,
    })
    const taskId = res.taskId
    this.options = {
      token,
      taskId,
    }
    setSttOptionsToLocal(this.options)
    Promise.all([
      this.rtmManager.updateLanguages(languages),
      this.rtmManager.updateSttData({
        status: "start",
        taskId,
        token,
      }),
      this.rtmManager.releaseLock(),
    ])
  }

  async stopTranscription() {
    if (!this.hasInit) {
      throw new Error("please init first")
    }
    if (!this.options) {
      this.options = getSttOptionsFromLocal()
    }
    const { taskId, token } = this.options
    if (!taskId) {
      throw new Error("taskId is not found")
    }
    if (!token) {
      throw new Error("token is not found")
    }
    // aquire lock
    await this.rtmManager.acquireLock()
    await apiSTTStopTranscription({
      taskId,
      token,
      uid: this.userId,
      channel: this.channel,
    })
    Promise.all([
      this.rtmManager.updateSttData({
        status: "end",
      }),
      this.rtmManager.releaseLock(),
    ])
  }

  async destroy() {
    await this.rtmManager.destroy()
    this._init = false
  }

  // async reStartTranscription() {
  //   if (!this.options) {
  //     this.options = getSttOptionsFromLocal()
  //   }
  //   await this.startTranscription({})
  // }

  // ------------- private -------------
}

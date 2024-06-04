import {
  apiSTTStopTranscription,
  apiSTTStartTranscription,
  apiSTTAcquireToken,
  getSttOptionsFromLocal,
  setSttOptionsToLocal,
  removeSttOptionsFromLocal,
} from "@/common"
import { AGEventEmitter } from "../events"
import { STTEvents, STTManagerStartOptions, STTManagerOptions } from "./types"

export class SttManager extends AGEventEmitter<STTEvents> {
  options?: STTManagerOptions
  userId: string | number = ""
  channel: string = ""
  _init: boolean = false

  get hasInit() {
    return this._init
  }

  constructor() {
    super()
  }

  init({ userId, channel }: { userId: string | number; channel: string }) {
    this.userId = userId
    this.channel = channel
    this._init = true
  }

  async startTranscription(startOptions: STTManagerStartOptions) {
    if (!this.hasInit) {
      throw new Error("please init first")
    }
    const data = await apiSTTAcquireToken({
      channel: this.channel,
      uid: this.userId,
    })
    const token = data.tokenName
    if (!token) {
      throw new Error("token is not found")
    }
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

    return {
      taskId,
      token,
    }
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
    await apiSTTStopTranscription({
      taskId,
      token,
      uid: this.userId,
      channel: this.channel,
    })
  }

  // async reStartTranscription() {
  //   if (!this.options) {
  //     this.options = getSttOptionsFromLocal()
  //   }
  //   await this.startTranscription({})
  // }

  // ------------- private -------------
}

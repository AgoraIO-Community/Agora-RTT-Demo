import { apiSTTStopTranscription, apiSTTStartTranscription, apiSTTAcquireToken } from "@/common"
import { AGEventEmitter } from "../events"
import { STTEvents, STTManagerStartOptions, STTManagerOptions } from "./types"
import { getSTToptionsFromLocal, setSTToptionsToLocal, removeSTToptionsFromLocal } from "./storage"

export class SttManager extends AGEventEmitter<STTEvents> {
  options?: STTManagerOptions

  constructor() {
    super()
  }

  async startTranscription(startOptions: STTManagerStartOptions) {
    const data = await apiSTTAcquireToken({
      channel: startOptions.channel,
    })
    const token = data.tokenName
    if (!token) {
      throw new Error("token is not found")
    }
    const res = await apiSTTStartTranscription({
      ...startOptions,
      token,
    })
    const taskId = res.taskId
    this.options = {
      ...startOptions,
      token,
      taskId,
    }
    setSTToptionsToLocal(this.options)
  }

  async stopTranscription() {
    if (!this.options) {
      this.options = getSTToptionsFromLocal()
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
    })
  }

  async reStartTranscription() {
    if (!this.options) {
      this.options = getSTToptionsFromLocal()
    }
    const { channel, languages } = this.options
    await this.startTranscription({
      channel,
      languages,
    })
  }

  // ------------- private -------------
}

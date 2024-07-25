import {
  apiSTTStopTranscription,
  apiSTTStartTranscription,
  apiSTTQueryTranscription,
  apiSTTUpdateTranscription,
  apiSTTAcquireToken,
  EXPERIENCE_DURATION,
} from "@/common"
import { AGEventEmitter } from "../events"
import { STTEvents, STTManagerStartOptions, STTManagerOptions, STTManagerInitData } from "./types"
import { RtmManager } from "../rtm"
import { IRequestLanguages } from "@/types"

export class SttManager extends AGEventEmitter<STTEvents> {
  option?: STTManagerOptions
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

  setOption(option: STTManagerOptions) {
    this.option = option
  }

  removeOption() {
    this.option = undefined
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
    const { languages } = startOptions
    if (!languages.length) {
      return
    }
    // aquire lock
    await this.rtmManager.acquireLock()
    try {
      // aquire token
      const data = await apiSTTAcquireToken({
        channel: this.channel,
        uid: this.userId,
      })
      const token = data.tokenName
      // api start
      const res = await apiSTTStartTranscription({
        uid: this.userId,
        channel: this.channel,
        languages: startOptions.languages,
        token,
      })
      const { taskId } = res
      this.setOption({
        token,
        taskId,
      })
      // set rtm metadata
      await Promise.all([
        this.rtmManager.updateLanguages(languages),
        this.rtmManager.updateSttData({
          status: "start",
          taskId,
          token,
          startTime: Date.now(),
          duration: EXPERIENCE_DURATION,
        }),
      ])
    } catch (err) {
      await this.rtmManager.releaseLock()
      throw err
    }
    await this.rtmManager.releaseLock()
  }

  async stopTranscription() {
    if (!this.hasInit) {
      throw new Error("please init first")
    }
    const { taskId, token } = this.option || {}
    if (!taskId) {
      throw new Error("taskId is not found")
    }
    if (!token) {
      throw new Error("token is not found")
    }
    // aquire lock
    await this.rtmManager.acquireLock()
    try {
      // api stop
      await apiSTTStopTranscription({
        taskId,
        token,
        uid: this.userId,
        channel: this.channel,
      })
      // set rtm metadata
      await this.rtmManager.updateSttData({
        status: "end",
      })
    } catch (err) {
      await this.rtmManager.releaseLock()
      throw err
    }
    await this.rtmManager.releaseLock()
  }

  async queryTranscription() {
    const { taskId, token } = this.option || {}
    if (!taskId) {
      throw new Error("taskId is not found")
    }
    if (!token) {
      throw new Error("token is not found")
    }
    // api query
    return await apiSTTQueryTranscription({
      taskId,
      token,
      uid: this.userId,
      channel: this.channel,
    })
  }

  async updateTranscription(options: { data: any; updateMaskList: string[] }) {
    const { data, updateMaskList } = options
    const { taskId, token } = this.option || {}
    if (!taskId) {
      throw new Error("taskId is not found")
    }
    if (!token) {
      throw new Error("token is not found")
    }
    // api update
    return await apiSTTUpdateTranscription({
      taskId,
      token,
      uid: this.userId,
      channel: this.channel,
      data,
      updateMaskList,
    })
  }

  /**
   *
   * startTime ms
   * duration ms
   */
  async extendDuration({ startTime, duration }: { startTime?: number; duration?: number }) {
    const data: any = {}
    if (startTime) {
      data.startTime = startTime
    }
    if (duration) {
      data.duration = duration
    }
    // set rtm metadata
    await this.rtmManager.updateSttData(data)
  }

  async destroy() {
    await this.rtmManager.destroy()
    this.option = undefined
    this.userId = ""
    this.channel = ""
    this._init = false
  }

  // ------------- private -------------
}

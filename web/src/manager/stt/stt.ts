import {
  apiSTTStopTranscription,
  apiSTTStartTranscription,
  apiSTTQueryTranscription,
  apiSTTUpdateTranscription,
  EXPERIENCE_DURATION,
} from "@/common"
import { AGEventEmitter } from "../events"
import { STTEvents, STTManagerStartOptions, STTManagerOptions, STTManagerInitData } from "./types"
import { RtmManager } from "../rtm"

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
      // TODO: api start
      const res = await apiSTTStartTranscription({
        uid: this.userId,
        channel: this.channel,
        languages: startOptions.languages,
        extensionParams: startOptions.extensionParams,
      })
      const { agent_id: taskId } = res
      console.log("[test] startTranscription taskId", taskId)
      // const taskId = new Date().getTime().toString()
      this.setOption({
        taskId,
      })
      // set rtm metadata
      await Promise.all([
        this.rtmManager.updateLocalLanguage(languages),
        this.rtmManager.updateSttData({
          status: "start",
          taskId,
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
    const { taskId } = this.option || {}

    if (!taskId) {
      throw new Error("taskId is not found")
    }
    console.log("[test] stopTranscription taskId:", taskId)
    this.rtmManager.updateLocalLanguage([])
    // aquire lock
    await this.rtmManager.acquireLock()
    try {
      // api stop
      await apiSTTStopTranscription({
        taskId,
        uid: this.userId,
        channel: this.channel,
      })
      // set rtm metadata
      // this.rtmManager.updateLocalLanguage()
      console.log("[test] stopTranscription updateSttData:", taskId)
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
    const { taskId } = this.option || {}
    if (!taskId) {
      throw new Error("taskId is not found")
    }
    // api query
    return await apiSTTQueryTranscription({
      taskId,
      uid: this.userId,
      channel: this.channel,
    })
  }

  async updateTranscription(startOptions: STTManagerStartOptions) {
    const { taskId } = this.option || {}
    if (!taskId) {
      throw new Error("taskId is not found")
    }
    this.rtmManager.updateLocalLanguage(startOptions.languages)
    // api update
    return await apiSTTUpdateTranscription({
      taskId,
      uid: this.userId,
      channel: this.channel,
      languages: startOptions.languages,
      extensionParams: startOptions.extensionParams,
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

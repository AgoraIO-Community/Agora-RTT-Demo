import AgoraRTM, { RTMEvents, ChannelType, RTMClient, RTMConfig, MetadataItem } from "agora-rtm"
import { mapToArray, isString, apiGetAgoraToken, getDefaultLanguageSelect } from "@/common"
import { AGEventEmitter } from "../events"
import {
  RtmEvents,
  ISimpleUserInfo,
  RtmMessageType,
  RtmPresenceMessageData,
  ValueOf,
  ILanguageItem,
} from "./types"
import { ISttData, Role, ILanguageSelect } from "@/types"
import { DEFAULT_RTM_CONFIG } from "./constant"

const { RTM, constantsType, setParameter } = AgoraRTM

const appId = import.meta.env.VITE_AGORA_APP_ID
const CHANNEL_TYPE: ChannelType = "MESSAGE"
const LOCK_STT = "lock_stt"

export class RtmManager extends AGEventEmitter<RtmEvents> {
  client?: RTMClient
  private rtmConfig: RTMConfig = DEFAULT_RTM_CONFIG
  channel: string = ""
  userId: string = ""
  userName: string = ""
  private userMap: Map<string, ISimpleUserInfo> = new Map()
  private joined: boolean = false

  constructor() {
    super()
  }

  async join({ channel, userId, userName }: { channel: string; userId: string; userName: string }) {
    if (this.joined) {
      return
    }
    this.userId = userId
    this.userName = userName
    this.channel = channel
    if (!this.client) {
      const token = await apiGetAgoraToken({ channel: this.channel, uid: this.userId })
      if (token) {
        this.rtmConfig.token = token
      }
      this.client = new RTM(appId, userId, this.rtmConfig)
    }
    this._listenRtmEvents()
    await this.client.login()
    this.joined = true
    // subscribe message channel
    await this.client.subscribe(channel, {
      withPresence: true,
      withMetadata: true,
    })
    // check host
    await this._checkHost()
    // update user info
    await this._updateUserInfo()
    // set lock
    this._setLock()
  }

  async updateSttData(data: ISttData) {
    return await this._setChannelMetadata(data)
  }

  async updateLanguages(languages: ILanguageItem[]) {
    const message: {
      transcribe1: string
      translate1List: string[]
      transcribe2: string
      translate2List: string[]
    } = {
      transcribe1: "",
      translate1List: [],
      transcribe2: "",
      translate2List: [],
    }
    const language1 = languages[0]
    if (language1.source) {
      message.transcribe1 = language1.source
    }
    if (language1.target) {
      message.translate1List.push(...language1.target)
    }
    const language2 = languages[1]
    if (language2) {
      if (language2.source) {
        message.transcribe2 = language2.source
      }
      if (language2.target) {
        message.translate2List.push(...language2.target)
      }
    }
    return await this._setChannelMetadata(message)
  }

  async destroy() {
    await this.client?.logout()
    this._resetData()
  }

  async acquireLock() {
    // if not accquire lock, will throw error
    return await this.client?.lock.acquireLock(this.channel, CHANNEL_TYPE, LOCK_STT)
  }

  async releaseLock() {
    return await this.client?.lock.releaseLock(this.channel, CHANNEL_TYPE, LOCK_STT)
  }

  // --------------------- private methods ---------------------

  private async _updateUserInfo() {
    await this._setPresenceState({
      type: RtmMessageType.UserInfo,
      userId: this.userId,
      userName: this.userName,
    })
  }

  private async _removeChannelMetadata(metadata?: Record<string, any>) {
    const data: MetadataItem[] = []
    const options: any = {}
    for (const key in metadata) {
      data.push({
        key,
        value: JSON.stringify(metadata[key]),
      })
    }
    if (data.length) {
      options.data = data
    }
    await this?.client?.storage.removeChannelMetadata(this.channel, CHANNEL_TYPE, options)
  }

  private async _setChannelMetadata(metadata?: Record<string, any>) {
    const data: MetadataItem[] = []
    for (const key in metadata) {
      data.push({
        key,
        value: JSON.stringify(metadata[key]),
      })
    }
    await this?.client?.storage.setChannelMetadata(this.channel, CHANNEL_TYPE, data)
  }

  private async _setPresenceState(attr: ValueOf<RtmPresenceMessageData>) {
    if (!this.joined) {
      throw new Error("You must join the channel first")
    }
    const state: Record<string, string> = {}
    for (const key in attr) {
      const value = attr[key as keyof typeof attr]
      state[key] = isString(value) ? value : JSON.stringify(value)
    }
    return await this?.client?.presence.setState(this.channel, CHANNEL_TYPE, state)
  }

  private _listenRtmEvents() {
    this.client?.addEventListener("status", (res) => {
      this.emit("status", res)
    })
    this.client?.addEventListener("presence", (res) => {
      console.log("[test] presence", res)
      const { channelName, channelType, eventType, snapshot = [], stateChanged, publisher } = res
      if (channelName == this.channel) {
        switch (eventType) {
          case "SNAPSHOT":
            this._dealPresenceSnapshot(snapshot as any[])
            break
          case "REMOTE_STATE_CHANGED":
            this._dealPresenceRemoteState(stateChanged)
            break
          case "REMOTE_JOIN":
            break
          case "REMOTE_LEAVE":
            if (this.userMap.has(publisher)) {
              this.userMap.delete(publisher)
              this._emitUserListChanged()
            }
            break
          case "REMOTE_TIMEOUT":
            if (this.userMap.has(publisher)) {
              this.userMap.delete(publisher)
              this._emitUserListChanged()
            }
            break
        }
      }
    })
    this.client?.addEventListener("storage", (res) => {
      console.log("[test] storage", res)
      const { eventType, data, channelName } = res
      const { metadata } = data
      if (channelName == this.channel) {
        switch (eventType) {
          case "SNAPSHOT":
            this._dealStorageDataChanged(metadata)
            break
          case "UPDATE":
            this._dealStorageDataChanged(metadata)
            break
          case "REMOVE":
            break
        }
      }
    })
  }

  private _dealPresenceRemoteState(stateChanged: any) {
    switch (stateChanged.type) {
      case RtmMessageType.UserInfo:
        const userInfo = {
          userName: stateChanged.userName,
          userId: stateChanged.userId,
        }
        if (userInfo.userId) {
          this.userMap.set(userInfo.userId, userInfo)
          this._emitUserListChanged()
        }
        break
    }
  }

  private _dealPresenceSnapshot(snapshot?: any[]) {
    if (!snapshot?.length) {
      return
    }
    let changed = false
    for (const v of snapshot) {
      const { states } = v
      switch (states.type) {
        case RtmMessageType.UserInfo:
          const userInfo = {
            userName: states.userName,
            userId: states.userId,
          }
          if (userInfo.userId && userInfo.userId != this.userId) {
            this.userMap.set(userInfo.userId, userInfo)
            changed = true
          }
          break
      }
    }
    if (changed) {
      this._emitUserListChanged()
    }
  }

  private _dealStorageDataChanged(metadata: any) {
    const {
      transcribe1,
      translate1List,
      transcribe2,
      translate2List,
      status,
      taskId,
      token,
      startTime,
      duration,
    } = metadata
    if (transcribe1?.value) {
      const parseTranscribe1 = JSON.parse(transcribe1.value)
      const parseTranslate1 = JSON.parse(translate1List.value)
      const parseTranscribe2 = JSON.parse(transcribe2.value)
      const parseTranslate2 = JSON.parse(translate2List.value)
      this.emit("languagesChanged", {
        transcribe1: parseTranscribe1,
        translate1List: parseTranslate1,
        transcribe2: parseTranscribe2,
        translate2List: parseTranslate2,
      })
    } else {
      this.emit("languagesChanged", getDefaultLanguageSelect())
    }
    if (status?.value) {
      this.emit("sttDataChanged", {
        status: JSON.parse(status?.value),
        taskId: JSON.parse(taskId?.value),
        token: JSON.parse(token?.value),
        startTime: JSON.parse(startTime?.value),
        duration: JSON.parse(duration?.value),
      })
    } else {
      this.emit("sttDataChanged", {
        status: "end",
      })
    }
  }

  private _emitUserListChanged() {
    this.emit("userListChanged", mapToArray(this.userMap))
  }

  private _resetData() {
    this.client = undefined
    this.channel = ""
    this.rtmConfig = {}
    this.userId = ""
    this.userName = ""
    this.userMap.clear()
    this.joined = false
  }

  private async _checkHost() {
    const result = await this.client?.presence.whoNow(this.channel, CHANNEL_TYPE)
    console.log("[test] whoNow", result)
    if (result?.totalOccupancy == 1) {
      // this._removeChannelMetadata()
    }
  }

  private async _setLock() {
    const { lockDetails = [] } = (await this.client?.lock.getLock(this.channel, CHANNEL_TYPE)) || {}
    if (!lockDetails.find((v) => v.lockName === LOCK_STT)) {
      await this.client?.lock.setLock(this.channel, CHANNEL_TYPE, LOCK_STT)
    }
  }
}

import AgoraRTM, {
  RTMEvents,
  ChannelType,
  RTMClient,
  RTMConfig,
  RTMStreamChannel,
  StateDetail,
  MetadataItem,
} from "agora-rtm"
import { mapToArray, isString, apiGetAgoraToken } from "@/common"
import { AGEventEmitter } from "../events"
import {
  RtmEvents,
  ISimpleUserInfo,
  RtmMessageType,
  RtmPresenceMessageData,
  ValueOf,
  ILanguageItem,
} from "./types"
import { Message } from "./message"
import { STTStatus } from "@/types"

const { RTM, constantsType, setParameter } = AgoraRTM

const appId = import.meta.env.VITE_AGORA_APP_ID
const CHANNEL_TYPE: ChannelType = "MESSAGE"

export class RtmManager extends AGEventEmitter<RtmEvents> {
  client?: RTMClient
  private rtmLog: boolean = true
  private rtmConfig: RTMConfig = {
    logLevel: "debug",
    logUpload: true,
  }

  channel: string = ""
  userId: string = ""
  private userMap: Map<string, ISimpleUserInfo> = new Map()
  private joined: boolean = false
  private hostId: string = ""

  constructor() {
    super()
  }

  get isHost() {
    return this.hostId && this.hostId == this.userId
  }

  async join({ channel, userId }: { channel: string; userId: string }) {
    if (this.joined) {
      return
    }
    this.userId = userId
    this.channel = channel
    if (!this.client) {
      await this._initConfig()
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
    this._checkHost()
  }

  async updateUserInfo(userInfo: ISimpleUserInfo) {
    const message = Message.gen({
      type: RtmMessageType.UserInfo,
      userName: userInfo.userName,
      userId: userInfo.userId,
    })
    await this._setPresenceState(message)
  }

  async setHost(userId: string) {
    return await this._setChannelMetadata({
      hostId: userId,
    })
  }

  async setSttStatus(status: STTStatus) {
    return await this._setChannelMetadata({
      sttStatus: status,
    })
  }

  async updateLanguages(languages: ILanguageItem[]) {
    const message: {
      transcribe1: string
      translate1: string[]
      transcribe2: string
      translate2: string[]
    } = {
      transcribe1: "",
      translate1: [],
      transcribe2: "",
      translate2: [],
    }
    const language1 = languages[0]
    if (language1.source) {
      message.transcribe1 = language1.source
    }
    if (language1.target) {
      message.translate1.push(...language1.target)
    }
    const language2 = languages[1]
    if (language2) {
      if (language2.source) {
        message.transcribe2 = language2.source
      }
      if (language2.target) {
        message.translate2.push(...language2.target)
      }
    }
    return await this._setChannelMetadata(message)
  }

  async destroy() {
    if (this.isHost) {
      await this._removeChannelMetadata({
        hostId: this.userId,
      })
    }
    await this.client?.logout()
    this._resetData()
  }

  // --------------------- private methods ---------------------

  private async _initConfig() {
    if (this.rtmLog) {
      this.rtmConfig.logLevel = "debug"
      this.rtmConfig.logUpload = true
    }
    this.rtmConfig.token = await apiGetAgoraToken({ channel: this.channel, uid: this.userId })
  }

  private async _removeChannelMetadata(metadata: Record<string, any>) {
    const data: MetadataItem[] = []
    for (const key in metadata) {
      data.push({
        key,
        value: JSON.stringify(metadata[key]),
      })
    }
    const options = {
      data,
    }
    await this?.client?.storage.removeChannelMetadata(this.channel, CHANNEL_TYPE, options)
  }

  private async _setChannelMetadata(metadata: Record<string, any>) {
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
            break
          case "REMOTE_STATE_CHANGED":
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
            break
          case "REMOTE_JOIN":
            break
          case "REMOTE_LEAVE":
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
      if (Object.keys(metadata).length === 0) {
        return
      }
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

  private _dealStorageDataChanged(metadata: any) {
    const { hostId, transcribe1, translate1, transcribe2, translate2, sttStatus } = metadata
    if (hostId?.value) {
      const hostIdValue = JSON.parse(hostId.value)
      this.emit("hostChanged", hostIdValue)
      this.hostId = hostIdValue
    }
    if (transcribe1?.value) {
      const parseTranscribe1 = JSON.parse(transcribe1.value)
      const parseTranslate1 = JSON.parse(translate1.value)
      const parseTranscribe2 = JSON.parse(transcribe2.value)
      const parseTranslate2 = JSON.parse(translate2.value)
      this.emit("languagesChanged", {
        transcribe1: parseTranscribe1,
        translate1: parseTranslate1,
        transcribe2: parseTranscribe2,
        translate2: parseTranslate2,
      })
    }
    if (sttStatus?.value) {
      this.emit("sttStatusChanged", JSON.parse(sttStatus.value))
    }
  }

  private _emitUserListChanged() {
    this.emit("userListChanged", mapToArray(this.userMap))
  }

  private _resetData() {
    this.client = undefined
    this.channel = ""
    this.rtmLog = true
    this.rtmConfig = {}
    this.userId = ""
    this.userMap.clear()
    this.joined = false
  }

  private async _checkHost() {
    const result = await this.client?.presence.whoNow(this.channel, CHANNEL_TYPE)
    console.log("[test] whoNow", result)
    if (result?.totalOccupancy == 1) {
      this.setHost(this.userId)
      this.emit("hostChanged", this.userId)
      this.hostId = this.userId
    }
  }
}

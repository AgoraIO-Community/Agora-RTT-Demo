import AgoraRTM, { ChannelType, RTMClient, RTMConfig, MetadataItem } from "agora-rtm"
import {
  mapToArray,
  isString,
  apiGetAgoraToken,
  getDefaultLanguageSelect,
  areArraysEqual,
} from "@/common"
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

interface LanguageChangeEvent {
  transcribe1: string
  translate1List?: string[]
  transcribe2?: string
  translate2List?: string[]
}
export class RtmManager extends AGEventEmitter<RtmEvents> {
  client?: RTMClient
  private rtmConfig: RTMConfig = DEFAULT_RTM_CONFIG
  channel: string = ""
  userId: string = ""
  userName: string = ""
  private userMap: Map<string, ISimpleUserInfo> = new Map()
  private joined: boolean = false
  private localLanguage: ILanguageItem[] = []
  private localSttData: ISttData = {
    status: "end",
    duration: 0,
    startTime: 0,
    taskId: "",
  }

  private currentLanguageEvent: LanguageChangeEvent = {
    transcribe1: "",
    translate1List: [],
    transcribe2: "",
    translate2List: [],
  }

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
    // update user info
    await this._updateUserInfo()
    // subscribe message channel
    await this.client.subscribe(channel, {
      withPresence: true,
      withMetadata: true,
    })
    // check host
    await this._checkHost()
    // set lock
    this._setLock()
  }

  async updateSttData(data: ISttData) {
    this.localSttData = {
      ...this.localSttData,
      ...data,
    }
    this.emit("sttDataChanged", this.localSttData)
  }

  async updateLocalLanguage(languages: ILanguageItem[]) {
    this.localLanguage = languages
    const localLanguages = this.localLanguage.map((v) => v.source)
    this.currentLanguageEvent = {
      transcribe1: localLanguages[0],
      translate1List: languages[0]?.target || [],
    }
    await this._updateUserInfo()
  }

  async destroy() {
    await this.client?.logout()
    this._resetData()
  }

  async acquireLock() {
    // if not accquire lock, will throw error
    // return await this.client?.lock.acquireLock(this.channel, CHANNEL_TYPE, LOCK_STT)
  }

  async releaseLock() {
    // return await this.client?.lock.releaseLock(this.channel, CHANNEL_TYPE, LOCK_STT)
  }

  // --------------------- private methods ---------------------

  private async _updateUserInfo() {
    const userInfo = {
      userId: this.userId,
      userName: this.userName,
      languages: this.localLanguage,
    }
    this.userMap.set(userInfo.userId, userInfo)
    await this._setPresenceState({
      type: RtmMessageType.UserInfo,
      userId: this.userId,
      userName: this.userName,
      languages: this.localLanguage,
    })
    this._emitUserListChanged()
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
      console.log("[test] presence", JSON.stringify(res))
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
              this._dealLanguageChanged()
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
  }

  private _formatUserInfo(user: any) {
    if (!user.userId) {
      return
    }
    let remoteUserLanguages = user.languages ?? {}
    try {
      remoteUserLanguages = JSON.parse(remoteUserLanguages)
    } catch (e) {
      console.log(e)
    }
    const userInfo = {
      userName: user.userName,
      userId: user.userId,
      languages: remoteUserLanguages,
    }
    if (userInfo.userId && userInfo.userId != this.userId) {
      this.userMap.set(userInfo.userId, userInfo)
    }
  }

  private _dealPresenceRemoteState(stateChanged: any) {
    switch (stateChanged.type) {
      case RtmMessageType.UserInfo:
        this._formatUserInfo(stateChanged)
        if (stateChanged.userId) {
          this._emitUserListChanged()
          this._dealLanguageChanged()
        }
        break
    }
  }

  private _dealPresenceSnapshot(snapshot?: any[]) {
    console.log("[test] snapshot", snapshot)
    if (!snapshot?.length) {
      return
    }
    let changed = false
    for (const v of snapshot) {
      const { states } = v
      switch (states.type) {
        case RtmMessageType.UserInfo:
          this._formatUserInfo(states)
          if (states.userId) {
            changed = true
          }
          break
      }
    }
    if (changed) {
      this._emitUserListChanged()
      this._dealLanguageChanged()
    }
    this._emitJoinSuccess()
  }

  private _filterLanguages(localLanguages: string[], remoteLanguages: string[]): string[] {
    const uniqueRemoteLanguages = [...new Set(remoteLanguages)]
    return uniqueRemoteLanguages
    // const filteredLanguages = remoteLanguages.filter(
    //   (remoteLang) => !localLanguages.includes(remoteLang),
    // )
    // console.log("[test] filteredLanguages", filteredLanguages)
    // return [...new Set(filteredLanguages)]
    // const localPrefixes = new Set(localLanguages.map((lang) => lang.split("-")[0]))

    // return remoteLanguages.filter((remoteLang) => {
    //   if (localLanguages.includes(remoteLang)) return false
    //   const remotePrefix = remoteLang.split("-")[0]
    //   return !localPrefixes.has(remotePrefix)
    // })
  }

  private _createTranslateList(languages: string[], startIndex: number, count: number): string[] {
    return languages
      .slice(startIndex, startIndex + count)
      .filter((lang): lang is string => lang !== undefined)
  }

  private _dealLanguageChanged(): void {
    const localLanguages = this.localLanguage.map((v) => v.source)
    const remoteLanguages = Array.from(this.userMap.entries())
      .filter(([userId]) => userId !== this.userId)
      .flatMap(([_, userInfo]) => userInfo.languages.map((lang) => lang.source))

    const translateList = this._filterLanguages(localLanguages, remoteLanguages)

    const TRANSLATE_LIST_SIZE = 10

    const event: LanguageChangeEvent = {
      transcribe1: localLanguages[0],
      translate1List: translateList.length
        ? this._createTranslateList(translateList, 0, TRANSLATE_LIST_SIZE)
        : [],
      transcribe2: "",
      translate2List: [],
    }
    console.log(
      "[test] dealLanguageChanged",
      remoteLanguages,
      "event",
      event,
      "currentLanguageEvent",
      this.currentLanguageEvent,
    )
    if (
      this.currentLanguageEvent.transcribe1 !== event.transcribe1 ||
      !areArraysEqual(this.currentLanguageEvent.translate1List || [], event.translate1List || [])
    ) {
      this.currentLanguageEvent = event
      this.emit("languagesChanged", event)
    } else {
      console.log("No changes detected between remote and local languages, no action taken")
    }
  }

  private _emitJoinSuccess() {
    this.emit("joinRTMSuccess")
  }

  private _emitUserListChanged() {
    this.emit("userListChanged", mapToArray(this.userMap))
  }

  private _resetData() {
    this.client = undefined
    this.currentLanguageEvent = {
      transcribe1: "",
      translate1List: [],
      transcribe2: "",
      translate2List: [],
    }
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
      this._removeChannelMetadata()
    }
  }

  private async _setLock() {
    // const { lockDetails = [] } = (await this.client?.lock.getLock(this.channel, CHANNEL_TYPE)) || {}
    // if (!lockDetails.find((v) => v.lockName === LOCK_STT)) {
    //   await this.client?.lock.setLock(this.channel, CHANNEL_TYPE, LOCK_STT)
    // }
  }
}

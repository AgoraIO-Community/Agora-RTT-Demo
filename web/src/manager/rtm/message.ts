import { BaseRtmMessage, RtmPresenceMessageData, RtmMessageType } from "./types"

export class Message {
  public static gen(msg: BaseRtmMessage): RtmPresenceMessageData[keyof RtmPresenceMessageData] {
    const { type } = msg

    switch (type) {
      case RtmMessageType.UserInfo:
        return {
          userName: msg.userName,
          userId: msg.userId,
          type: RtmMessageType.UserInfo,
        }
      case RtmMessageType.BeHost:
        return {
          userId: msg.userId,
          type: RtmMessageType.BeHost,
        }
    }
  }
}

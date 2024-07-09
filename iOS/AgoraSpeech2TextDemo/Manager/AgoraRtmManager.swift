//
//  AgoraRtmManager.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2023/03/27.
//

import AgoraRtmKit
import PromiseKit
import DarkEggKit

enum RTMError: Error {
    case ok
    case getTokenFailed
    case loginFailed
    case joinFailed
    case conflict
    case unknown
}

class AgoraRtmManager: NSObject {
    static let shared: AgoraRtmManager = {return AgoraRtmManager()}()
    var rtmKit: AgoraRtmKit!
    var currentChannelId: String?
    var currentNickname: String?
    var rtmChannel: AgoraRtmChannel?
    
//    var currentUsers: [RtmUserModel] = []
    var nicknameDict: [UInt: String] = [:]
    var currentRtcUid: UInt = 0
    
    override init() {
        super.init()
        let appId = AppConfig.shared.agora.appId
        self.rtmKit = AgoraRtmKit(appId: appId, delegate: self)
    }
}

extension AgoraRtmManager {
    /// login to rtm
    /// - Parameters:
    ///   - nickname: nickname
    /// - Returns: Promise<String>
    func login(nickname: String) -> Promise<String> {
        let promise = Promise<String> { [weak self] seal in
            self?.rtmKit.login(byToken: nil, user: nickname) { errorCode in
                Logger.debug("RTM Login: \(errorCode)")
                guard errorCode == .ok else {
                    seal.reject(RTMError.loginFailed)
                    return
                }
                self?.currentNickname = nickname
                seal.fulfill(nickname)
            }
        }
        return promise
    }
    
    /// join rtm channel
    /// - Parameters:
    ///   - channel: channel name
    ///   - uid: uid(return from rtc join)
    ///   - nickname: nickname
    /// - Returns: Promise<RtmUserModel>
    func join(channel: String, uid: UInt, nickname: String) -> Promise<RtmUserModel> {
        let promise = Promise<RtmUserModel> { seal in
            self.rtmChannel = self.rtmKit.createChannel(withId: channel, delegate: self)
            self.rtmChannel?.join(completion: { [weak self] errorCode in
                guard errorCode == .channelErrorOk else {
                    Logger.error("Join channel erro: \(errorCode)")
                    seal.reject(RTMError.joinFailed)
                    return
                }
                self?.currentRtcUid = uid
                self?.currentChannelId = channel
                
                self?.subscribeRtmUsers()
                self?.updateMetaData(rtcUid: uid)
                
                let user = RtmUserModel(nickname: nickname, uid: uid)
                seal.fulfill(user)
            })
        }
        return promise
    }
    
    /// subscribe Rtm users' meta data
    private func subscribeRtmUsers() {
        self.rtmChannel?.getMembersWithCompletion({ members, errorCode in
            guard let memberList = members, memberList.count > 0 else {
                return
            }
            for member in memberList {
                self.rtmKit.subscribeUserMetadata(withCompletion: member.userId, completion: nil)
//                self.rtmKit.getUserMetadata(withCompletion: member.userId) { userId, metaData, errorCode in
//                    if let data = metaData {
//                        self.getNickname(from: data, of: userId)
//                    }
//                }
            }
        })
    }
    
    /// leave rtm channel
    /// - Parameters:
    ///   - channel: channel name(if not same as current channel name, do nothing)
    ///   - completion: completion handler
    func leave(channel: String, completion: ((Bool)->Void)?) {
        guard currentChannelId == channel else {
            return
        }
        
        self.rtmChannel?.leave(completion: { errorCode in
            if errorCode == AgoraRtmLeaveChannelErrorCode.ok {
                self.removeMetaData(rtcUid: self.currentRtcUid)
                self.clear()
                completion?(true)
            }
            else {
                completion?(false)
            }
        })
    }
    
    /// logout from rtm
    func logout() {
        self.rtmKit.logout { errorCode in
            Logger.debug("RTM Logout: \(errorCode)")
        }
    }
    
    func updateChannelMetaData(key: String, value: String) {
        
    }
}

extension AgoraRtmManager {
    //
    private func updateMetaData(rtcUid: UInt) {
        // update self rtcUid: nickname
        let localItem = AgoraRtmMetadataItem()
        localItem.key = "rtcUid"
        localItem.value = "\(rtcUid)"
        self.rtmKit.addLocalUserMetadata(withCompletion: [localItem], metadataOptions: nil, completion: nil)
    }
    
    private func removeMetaData(rtcUid: UInt) {
        let localItem = AgoraRtmMetadataItem()
        localItem.key = "rtcUid"
        localItem.value = "\(rtcUid)"
        self.rtmKit.deleteLocalUserMetadata(withCompletion: [localItem], metadataOptions: nil, completion: nil)
    }
    
    private func clear() {
        self.currentChannelId = nil
        self.currentNickname = nil
        self.currentRtcUid = 0
        self.nicknameDict.removeAll()
    }
}

// MARK: - AgoraRtmDelegate
extension AgoraRtmManager: AgoraRtmDelegate {
    func rtmKit(_ kit: AgoraRtmKit, messageReceived message: AgoraRtmMessage, fromPeer peerId: String) {
        Logger.debug()
    }
    
    func rtmKit(_ kit: AgoraRtmKit, userMetadataUpdated userId: String, metadata data: AgoraRtmMetadata) {
        // Nothing here now
        Logger.debug("\(userId) update metadata")
        getNickname(from: data, of: userId)
    }
    
    func rtmKit(_ kit: AgoraRtmKit, connectionStateChanged state: AgoraRtmConnectionState, reason: AgoraRtmConnectionChangeReason) {
        Logger.debug()
    }
    
    func rtmKit(_ kit: AgoraRtmKit, peersOnlineStatusChanged onlineStatus: [AgoraRtmPeerOnlineStatus]) {
        Logger.debug()
    }
    
    private func getNickname(from metaData: AgoraRtmMetadata, of userId: String) {
//        let nicknameData = metaData.items?.first( where: { item in
//            return item.key == "nickname"
//        })
        let rtcUidData = metaData.items?.first( where: { item in
            return item.key == "rtcUid"
        })
//        let nickname = nicknameData?.value ?? userId
        if let rtcUidStr = rtcUidData?.value, let rtcUid:UInt = UInt(rtcUidStr) {
            self.nicknameDict[rtcUid] = userId
        }
        Logger.debug(self.nicknameDict)
        return
    }
}

// MARK: - AgoraRtmChannelDelegate
extension AgoraRtmManager: AgoraRtmChannelDelegate {
//    func channel(_ channel: AgoraRtmChannel, messageReceived message: AgoraRtmMessage, from member: AgoraRtmMember) {
//        if let rawMsg = message as? AgoraRtmRawMessage {
//            Logger.debug("\(rawMsg.description) rawMsg")
//            let decoder = JSONDecoder()
//            if let giftMsg = try? decoder.decode(GiftMessageModel.self, from: rawMsg.rawData), let gift = giftMsg.gift {
//                //
//                Logger.debug(gift.name ?? "")
//                for _ in 0 ..< giftMsg.count {
//                    GiftQueueManager.shared.addGift(gift, type: .free)
//                    GiftQueueManager.shared.start()
//                }
//            }
//        }
//        else {
//            Logger.debug("\(member.userId) from channel \(member.channelId), \(message.text)")
//            let msgItem = ChatMessageQueueItem(userName: member.userId, text: message.text)
//            ChatMessageQueueManager.shared.addChatMessage(msgItem)
//            ChatMessageQueueManager.shared.start()
//        }
//    }
//    
//    func channel(_ channel: AgoraRtmChannel, metadataUpdate data: AgoraRtmMetadata) {
//        Logger.debug("get data \(data.majorRevision)")
//        Logger.debug("get data \(data.items?.count)")
//        Logger.debug("get data \(data.items?[0].key)\(data.items?[0].value)")
//        self.getRtmUsers(from: data)
//    }
//    
//    private func getRtmUsers(from metaData: AgoraRtmMetadata) {
//        let usersItem = metaData.items?.first(where: { item in
//            item.key == "RtmUsers"
//        })
//
//        let decoder = JSONDecoder()
//        if let jsonStr = usersItem?.value, let data = jsonStr.data(using: .utf8), var rtmUsers = try? decoder.decode([RtmUserModel].self, from: data) {
//            Logger.debug(rtmUsers)
//        }
//    }
    
    func channel(_ channel: AgoraRtmChannel, memberJoined member: AgoraRtmMember) {
        Logger.debug("\(member.userId) join to rtm channel.")
        self.rtmKit.subscribeUserMetadata(withCompletion: member.userId, completion: nil)
    }
    
    func channel(_ channel: AgoraRtmChannel, memberLeft member: AgoraRtmMember) {
        self.rtmKit.unsubscribeUserMetadata(withCompletion: member.userId, completion: nil)
        if let item = self.nicknameDict.first(where: { el in
            el.value == member.userId
        }){
            self.nicknameDict.removeValue(forKey: item.key)
        }
        Logger.debug(self.nicknameDict)
    }
}

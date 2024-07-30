//
//  AgoraManager.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2022/05/09.
//

import AgoraRtcKit
import DarkEggKit
import PromiseKit
import AVFAudio

enum DemoError: Error {
    case rtcError(Int)
    //case rtmLoginError(AgoraRtmLoginErrorCode)
    enum rtm: Error {
        case createChannelFailed
        case joinChannelFaied
    }
}

// MARK: - AgoraManagerDelegate
@objc protocol AgoraManagerDelegate: AnyObject {
    func agoraManager(_ mgr: AgoraManager, userJoined uid: UInt)
    func agoraManager(_ mgr: AgoraManager, userLeaved uid: UInt)
    // Media player
    //@objc optional func agoraManager(_ mgr: AgoraManager, mediaPlayer: AgoraRtcMediaPlayerProtocol, loadCompleted: Bool)
    // subtitle
    @objc optional func agoraManager(_ mgr: AgoraManager, receiveText text: String, textUid: Int64, uid: UInt)          // in progress, update last one
    @objc optional func agoraManager(_ mgr: AgoraManager, receiveFinalText text: String, textUid: Int64, uid: UInt)     // final text, update last one, then add new line
    @objc optional func agoraManager(_ mgr: AgoraManager, receiveSubtitle subtitle: SubTitle)
}

class AgoraManager: NSObject {
    var agoraKit: AgoraRtcEngineKit!
    
    var isHost: Bool = false
    var selfUid: UInt = 0
    var users: [UInt] = []
    //var mediaPlayers: [Int: AgoraRtcMediaPlayerProtocol] = [:]
    
    var isAudioMuted: Bool = false
    var isVideoMuted: Bool = true
    
    var videoView: UIView = UIView(frame: UIScreen.main.bounds)
    
    weak var delegate: AgoraManagerDelegate?
    
    private var currentAgoraAppId: String!
    
    var cryptionMode: CryptionModes = .AES128GCM2
    
    static let shared: AgoraManager = { AgoraManager() }()
    
    lazy var ttsPlayer = { return self.agoraKit.createMediaPlayer(with: self) }()
    
    static func sharedInstance(withApiServer: Bool) -> AgoraManager {
        let instance = AgoraManager.shared
        let appId = AppConfig.shared.agora.appId
        instance.initAgoraKit(withAppId: appId)
        return instance
    }
    
    override init() {
        super.init()
        NotificationCenter.default.addObserver(self, selector: #selector(onAppEnterBackground), name: UIScene.didEnterBackgroundNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(onAppEnterForeground), name: UIScene.didActivateNotification, object: nil)
    }
    
    private func initAgoraKit(withAppId appId: String) {
        if appId != self.currentAgoraAppId {
            AgoraRtcEngineKit.destroy()
            self.currentAgoraAppId = appId
            self.agoraKit = AgoraRtcEngineKit.sharedEngine(withAppId: appId, delegate: self)
            
            let r = self.agoraKit.setRecordingAudioFrameParametersWithSampleRate(16000, channel: 1, mode: .readOnly, samplesPerCall: 1024)
            Logger.debug("setMixedAudioFrameParametersWithSampleRate \(r)")
            let e = self.agoraKit.setAudioFrameDelegate(self)
            Logger.debug("setAudioFrameDelegate \(e)")
        }
        self.resetRtcConfig()
    }
    
    private func resetRtcConfig() {
        self.agoraKit.setChannelProfile(.liveBroadcasting)
        self.agoraKit.setAudioProfile(.musicHighQualityStereo)
        self.agoraKit.setAudioScenario(.gameStreaming)
        self.agoraKit.enableAudio()
        self.agoraKit.enableVideo()
        self.agoraKit.enableLocalVideo(false)
        self.agoraKit.enableLocalAudio(false)
        self.agoraKit.adjustRecordingSignalVolume(100)
        self.agoraKit.adjustAudioMixingPublishVolume(0)
        
        self.agoraKit.setAudioOptionParams("{\"adm_mix_with_others\":false}")
        self.agoraKit.setParameters("{\"che.audio.nonmixable.option\":true}")
    }
}

extension AgoraManager {
    func join(channel: String, asHost: Bool, completion: ((Bool, UInt) -> Void)?) {
        self.agoraKit.setClientRole(asHost ? .broadcaster : .audience)
        self.isHost = asHost
        let uid = UInt.random(in: 100000..<200000)
        Logger.debug("uid: \(uid), is \(asHost ? "Host" : "Audience")")
        // video
        self.agoraKit.enableLocalVideo(asHost && !self.isVideoMuted)
        // audio
        self.agoraKit.enableLocalAudio(asHost && !self.isAudioMuted)
        
        //self.agoraKit.enableAudioVolumeIndication(200, smooth: 3, reportVad: true)
        
        // join success block
        let joinChannelSuccessBlock: ((String, UInt, Int) -> Void) = { [weak self] channel, uid, elapsed in
            Logger.debug("Join \(channel) with uid \(uid) elapsed \(elapsed)ms")
            self?.selfUid = uid
            completion?(true, uid)
        }
        
        // join channel with no token auth
        let ret = self.agoraKit.joinChannel(byToken: nil, channelId: channel, info: nil, uid: UInt(uid), joinSuccess: joinChannelSuccessBlock)
        Logger.debug("join channel(no token) return: \(ret)")
    }
    
    // TODO:
    func joinPromise(channel: String, asHost: Bool = false) -> Promise<UInt> {
        self.agoraKit.setClientRole(asHost ? .broadcaster : .audience)

        return Promise { seal in
            let ret = self.agoraKit.joinChannel(byToken: nil, channelId: channel, info: nil, uid: 0) { [weak self] channel, uid, elapsed in
                print("Join \(channel) with uid \(uid) elapsed \(elapsed)ms")
                self?.selfUid = uid
                // set video preview view
                let videoCanvas = AgoraRtcVideoCanvas()
                videoCanvas.view = self?.videoView
                videoCanvas.renderMode = .hidden
                self?.agoraKit.setupLocalVideo(videoCanvas)
                Logger.debug("enter cloud spatial audio room")
                seal.fulfill(uid)
            }

            let connection = AgoraRtcConnection(channelId: "a", localUid: 1)
            self.agoraKit.joinChannelEx(byToken: nil, connection: connection, delegate: self, mediaOptions: AgoraRtcChannelMediaOptions())

            if ret != 0 {
                seal.reject(DemoError.rtcError(Int(ret)))
            }
            else {
                // maybe will not called
                //seal.fulfill(UInt(0))
            }
        }
    }
    
    /// Leave channel
    func leave() {
        Logger.debug("Leave channel.")
        // reset views
        self.videoView.removeFromSuperview()
        self.videoView = UIView(frame: UIScreen.main.bounds)
        // leave channel
        self.agoraKit.leaveChannel { state in
            Logger.debug("leaveChannel \(state)")
            // reset rtc config
            self.resetRtcConfig()
        }
    }
    
    func changeRole(to role: AgoraClientRole) {
        self.agoraKit.setClientRole(role)
    }
    
    /// Mute self audio
    /// - Parameter flag: Bool
    func muteSelfAudio(_ flag: Bool) {
        self.agoraKit.enableLocalAudio(!flag)
        self.isAudioMuted = flag
    }
    
    /// Mute self video
    /// - Parameter flag: Bool
    func muteSelfVideo(_ flag: Bool) {
        Logger.debug("mute local video: \(!flag)")
        guard self.isHost else {
            Logger.debug("Not host, skip.")
            return
        }
        self.agoraKit.enableLocalVideo(!flag)
        if flag {
            self.agoraKit.stopPreview()
        }
        else {
            self.agoraKit.startPreview()
        }
        self.isVideoMuted = flag
    }
    
    /// Destory rtc engine
    func destroyRtcEngine() {
        AgoraRtcEngineKit.destroy()
    }
    
    /// Set local video preview
    /// - Parameter view: parent view
    func setLocalVideoPreview(in view: UIView) {
        guard !view.subviews.contains(self.videoView) else {
            return
        }
        // set video preview view
        Logger.debug("Set local video preview.")
        let videoCanvas = AgoraRtcVideoCanvas()
        videoCanvas.uid = 0
        self.videoView.frame = view.frame
        videoCanvas.view = self.videoView
        videoCanvas.renderMode = .hidden
        view.addSubview(self.videoView)
        self.agoraKit.setupLocalVideo(videoCanvas)
        if !self.isVideoMuted {
            self.videoView.isHidden = false
            self.agoraKit.startPreview()
        }
    }
    
    /// Remove local video preview
    func removeLocalVideoPreview() {
        self.videoView.removeFromSuperview()
        self.agoraKit.stopPreview()
        self.videoView.isHidden = true
    }
    
    /// Set remote video view
    /// - Parameters:
    ///   - view: video view
    ///   - uid: remote uid
    func setRemoteVideoView(_ view: UIView, forUser uid: UInt, useSmall: Bool = false) {
        DispatchQueue.main.async {
            let videoCanvas = AgoraRtcVideoCanvas()
            videoCanvas.uid = uid
            //videoCanvas.view = view
            videoCanvas.view = self.videoView
            view.addSubview(self.videoView)
            videoCanvas.renderMode = .hidden
            if useSmall {
                self.agoraKit.setRemoteVideoStream(uid, type: .low)
            }
            else {
                self.agoraKit.setRemoteVideoStream(uid, type: .high)
            }
            let a = self.agoraKit.setupRemoteVideo(videoCanvas)
            Logger.debug("setupRemoteVideo : \(a)")
        }
    }
}

extension AgoraManager {
    @objc private func onAppEnterBackground(_ noti: Notification) {
        self.agoraKit.enableLocalAudio(false)
    }
    
    @objc private func onAppEnterForeground(_ noti: Notification) {
        self.agoraKit.enableLocalAudio(true)
    }
}

// MARK: - AgoraRtcEngineDelegate
extension AgoraManager: AgoraRtcEngineDelegate {
    func rtcEngine(_ engine: AgoraRtcEngineKit, didMicrophoneEnabled enabled: Bool) {
        Logger.debug("didMicrophoneEnabled: \(enabled)")
    }
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, didJoinedOfUid uid: UInt, elapsed: Int) {
        Logger.debug("Remote user \(uid) join")
        guard !(self.isHost) else {
            return
        }
        self.delegate?.agoraManager(self, userJoined: uid)
    }
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, didOfflineOfUid uid: UInt, reason: AgoraUserOfflineReason) {
        Logger.debug("user \(uid) leave")
        //self.delegate?.agoraManager(self, userLeaved: uid)
    }
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, didJoinChannel channel: String, withUid uid: UInt, elapsed: Int) {
        Logger.debug("Join \(channel) with uid \(uid) elapsed \(elapsed)ms")
    }
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, didOccurError errorCode: AgoraErrorCode) {
        Logger.debug("errorCode \(errorCode.rawValue)")
    }
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, didOccurWarning warningCode: AgoraWarningCode) {
        Logger.debug("warningCode \(warningCode.rawValue)")
    }
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, receiveStreamMessageFromUid uid: UInt, streamId: Int, data: Data) {
        Logger.debug("uid: \(uid), streamId: \(streamId), data: \(data)")
        STTManager.shared.parseDataToText(data: data) { [weak self] success, subtitle in
            //Logger.debug("[hyh] Time: \(subtitle?.time ?? -9)")
            guard success, let st = subtitle, let mgr = self else {
                return
            }
            mgr.delegate?.agoraManager?(mgr, receiveSubtitle: st)
        }
        return
    }
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, didClientRoleChanged oldRole: AgoraClientRole, newRole: AgoraClientRole, newRoleOptions: AgoraClientRoleOptions?) {
        Logger.debug("Role changed: \(oldRole) to \(newRole)")
    }
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, reportAudioVolumeIndicationOfSpeakers speakers: [AgoraRtcAudioVolumeInfo], totalVolume: Int) {
        Logger.debug("speakers \(speakers.count)")
        speakers.forEach { info in
            Logger.debug("uid : \(info.uid)")
        }
    }
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, remoteVideoStateChangedOfUid uid: UInt, state: AgoraVideoRemoteState, reason: AgoraVideoRemoteReason, elapsed: Int) {
        Logger.debug("Remote uid \(uid) video states changed to \(state), because of \(reason)")
        if state == .stopped {
            self.videoView.isHidden = true
        }
        else if state == .decoding {
            self.videoView.isHidden = false
        }
    }
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, remoteAudioStateChangedOfUid uid: UInt, state: AgoraAudioRemoteState, reason: AgoraAudioRemoteReason, elapsed: Int) {
        Logger.debug("Remote uid \(uid) audio states changed to \(state), because of \(reason)")
    }
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, didVideoEnabled enabled: Bool, byUid uid: UInt) {
        Logger.debug("Remote uid \(uid) video enabled \(enabled)")
    }
}

extension AgoraManager: AgoraRtcMediaPlayerDelegate {
    func playAudiaData(_ data: Data) {
        do {
            let folder = try FileManager.default
                .url(for: .cachesDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
                //.appendingPathComponent("tempAudio")
            let fileURL = folder.appendingPathComponent("temp.mp3")
            try data.write(to: fileURL)
            //        data.write(to: )
            self.ttsPlayer?.open(fileURL.absoluteString, startPos: 0)
        }
        catch (let err) {
            Logger.error(err.localizedDescription)
        }
    }
    
    func AgoraRtcMediaPlayer(_ playerKit: AgoraRtcMediaPlayerProtocol, didChangedTo state: AgoraMediaPlayerState, error: AgoraMediaPlayerError) {
        if state == .openCompleted {
            playerKit.play()
        }
    }
}

extension AgoraManager: AgoraAudioFrameDelegate {
    func onRecordAudioFrame(_ frame: AgoraAudioFrame, channelId: String) -> Bool {
        return true
    }
}

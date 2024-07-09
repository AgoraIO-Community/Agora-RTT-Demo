//
//  ChatRoomViewController.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2022/05/10.
//

import UIKit
import MediaPlayer
import DarkEggKit
import MBProgressHUD

class ChatRoomViewController: UIViewController {
    // UI Controllers
    @IBOutlet private weak var startSTTButton: UIButton!
    @IBOutlet private weak var selfUidLabel: UILabel!
    @IBOutlet private weak var languagesLabel: UILabel!
    @IBOutlet private weak var guestUidLabel: UILabel!
    @IBOutlet private weak var subtitleTable: UITableView!
    @IBOutlet private weak var muteButton: UIButton!
    @IBOutlet private weak var videoMuteButton: UIButton! // TODO: 
    @IBOutlet private weak var videoView: UIView!
    
    var aniImgView: AnimatedImageView!
    
    // Properties
    var languageList: [AgoraSTTLanguage] = []
    var translateLanguageList: [AgoraSTTLanguage] = []
    var channelName: String?
    var nickname: String?
    var isHost: Bool = false
    let agoraMgr = AgoraManager.shared
    let agoraRtmMgr = AgoraRtmManager.shared
    var guestUidList: [UInt] = []
    var uid: UInt = 0
    
    var subtitles: [SubTitle] = []
    
    var progress: MBProgressHUD!
    
    let kSubtitleCellId = "STTSubtitleCell"
    
    var currentKeyword: String = ""
    
    var autoStopTimer: Timer?
    //let timer = DispatchSource.makeTimerSource(queue: .main)
    private var prodVc: InLiveProductListVC!
    
    /// Audio mute flag
    private var isAudioMuted: Bool = false {
        didSet {
            self.agoraMgr.muteSelfAudio(isAudioMuted)
            if isAudioMuted {
                self.muteButton.backgroundColor = .systemRed
                self.muteButton.setImage(UIImage(systemName: "mic.slash.fill"), for: .normal)
            }
            else {
                self.muteButton.backgroundColor = .systemBlue
                self.muteButton.setImage(UIImage(systemName: "mic.fill"), for: .normal)
            }
        }
    }
    
    /// Video mute flag
    private var isVideoMuted: Bool = true {
        didSet {
            self.agoraMgr.muteSelfVideo(isVideoMuted)
            if isVideoMuted {
                self.videoMuteButton.backgroundColor = .systemRed
                self.videoMuteButton.setImage(UIImage(systemName: "video.slash.fill"), for: .normal)
            }
            else {
                self.videoMuteButton.backgroundColor = .systemBlue
                self.videoMuteButton.setImage(UIImage(systemName: "video.fill"), for: .normal)
            }
        }
    }
    
    // MARK: - Life cycle
    override func viewDidLoad() {
        Logger.debug()
        super.viewDidLoad()
        self.prodVc = (storyboard?.instantiateViewController(withIdentifier: "InLiveProductListVC") as! InLiveProductListVC);
        
        // set button style
        if #available(iOS 15, *) {
            self.startSTTButton.configurationUpdateHandler = buttonHandler
            //self.muteButton.configurationUpdateHandler = muteButtonHandler
        } else {
            // Fallback on earlier versions
            self.startSTTButton.titleLabel?.font = UIFont.boldSystemFont(ofSize: 15)
        }
        self.startSTTButton.setTitle("Start", for: .normal)
        self.startSTTButton.setTitle("...", for: .disabled)
        self.startSTTButton.setTitle("Stop", for: .selected)
        
        // start timer
        //timer.schedule(deadline: .now(), repeating: .seconds(1))
        //timer.setEventHandler(handler: {
        //    print("timer")
        //})
        //timer.activate()
//        self.muteButton.setImage(UIImage(systemName: "mic.fill"), for: .normal)
//        self.muteButton.setImage(UIImage(systemName: "mic.slash.fill"), for: .selected)
//        self.videoMuteButton.setImage(UIImage(systemName: "video.fill"), for: .normal)
//        self.videoMuteButton.setImage(UIImage(systemName: "video.slash.fill"), for: .selected)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        Logger.debug()
        super.viewWillAppear(animated)
        self.startSTTButton.isHidden = !self.isHost
        self.muteButton.isHidden = !self.isHost
        self.videoMuteButton.isHidden = !self.isHost
        
        self.becomeFirstResponder()
        UIApplication.shared.endReceivingRemoteControlEvents()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        Logger.debug()
        super.viewDidAppear(animated)
        self.progress = MBProgressHUD.showAdded(to: self.view.window!, animated: true)
        self.progress.label.text = "Join channel..."
        self.startSTTButton.isEnabled = false
        self.agoraMgr.delegate = self
        
        // login rtm
        if let nickname = self.nickname {
            agoraRtmMgr.login(nickname: nickname).done { nickname in
                self.nickname = nickname
            }.catch { error in
                Logger.debug(error.localizedDescription)
            }.finally {
                //
            }
        }
        
        // join rtc
        if let cName = self.channelName {
            self.navigationItem.title = cName
            self.agoraMgr.join(channel: cName, asHost: self.isHost) { [weak self] (success, uid) in
                Logger.debug("Join channel \(cName) finish. User Id is \(uid)")
                if success {
                    self?.uid = uid
                    self?.selfUidLabel.text = "User Id: \(uid), Nickname: \(self?.nickname ?? "N/A")"
                    // join rtm
                    let _ = self?.agoraRtmMgr.join(channel: cName, uid: uid, nickname: (self?.nickname)!)
                    if let view = self?.videoView, self?.isHost ?? false {
                        self?.agoraMgr.setLocalVideoPreview(in: view)
                    }
                }
                self?.progress.hide(animated: false)
                self?.startSTTButton.isEnabled = true
            }
        }
        
        var text: String = "STT: "
        for l in languageList {
            text.append("\(l.displayName), ")
        }
        if translateLanguageList.count > 0 {
            text.append("\nTranslate to: ")
            for tl in translateLanguageList {
                text.append("\(tl.displayName)")
            }
        }
        self.languagesLabel.text = text
        
        self.setLockScreenInfo()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        // leave channel
        self.agoraMgr.delegate = nil
        self.agoraMgr.leave()
        
        // leave rtc channel
        self.agoraRtmMgr.leave(channel: self.channelName!) { [weak self] success in
            Logger.debug("Leave rtc success: \(success)")
            self?.agoraRtmMgr.logout()
        }
        
        switch STTManager.shared.state {
        case .started:
            // quit stt service
            STTManager.shared.stop()
            break;
        default:
            break;
        }
        STTManager.shared.clearSubtitles()
        
        self.resignFirstResponder()
        UIApplication.shared.beginReceivingRemoteControlEvents()
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        Logger.debug()
        self.dismiss(animated: false)
    }
    
    deinit {
        Logger.debug()
    }
    
    private let buttonHandler: (UIButton) -> Void = { (button) in
        // do something
        if #available(iOS 15.0, *) {
            var config = button.configuration
            var attribute = AttributeContainer()
            attribute.font = UIFont.boldSystemFont(ofSize: 15.0)
            config?.attributedTitle?.setAttributes(attribute)
            switch button.state {
            case .normal:
                button.backgroundColor = .systemOrange//config?.baseBackgroundColor
                break
            case .highlighted:
                button.backgroundColor = config?.baseBackgroundColor?.withAlphaComponent(0.7)
                break
            case .selected:
                button.backgroundColor = .systemRed
            case .disabled:
                button.backgroundColor = .systemGray
                break
            default:
                break
            }
            button.configuration = config
        } else {
            // Fallback on earlier versions
        }
    }
    
    private let muteButtonHandler: (UIButton) -> Void = { (button) in
        //
        if #available(iOS 15.0, *) {
            switch button.state {
            case .normal:
                button.backgroundColor = .systemBlue
                break
            case .highlighted:
                button.backgroundColor = .systemRed
            default:
                break
            }
        }
        else {
            //
        }
    }
    
    private let muteVideoButtonHandler: (UIButton) -> Void = { button in
        //
        if #available(iOS 15.0, *) {
        }
        else {
            //
        }
    }
}

extension ChatRoomViewController {
    @IBAction private func onSTTButtonClicked(_ sender: UIButton) {
        //self.agoraMgr.changeRole(to: .audience)
        let sttMgr = STTManager.shared
        sender.isEnabled = false
        if let cName = self.channelName {
            switch sttMgr.state {
            case .stopped:
                STTManager.shared.start(channel: cName, language: self.languageList, translateLanguages: self.translateLanguageList, enableRecording: STTManager.shared.enableRecording) { [weak self] success, error in
                    if success {
                        sender.isSelected = true
                        sender.isEnabled = true
                        let time = SettingManager.shared.keywords.autoStopTime * 60.0
                        self?.autoStopTimer = Timer.scheduledTimer(withTimeInterval: TimeInterval(time), repeats: false, block: { timer in
                            Logger.debug("Auto stop")
                            self?.stopSTT()
                        })
                        //self?.autoStopTimer.fire()
                        return
                    }
                    Logger.debug("\(error?.localizedDescription ?? "")")
                }
                break
            case .started:
                self.stopSTT()
                break
            default:
                break
            }
        }
    }
    
    private func stopSTT() {
        let sttMgr = STTManager.shared
        sttMgr.stop() { [weak self] (success, error) in
            if success {
                self?.startSTTButton.isSelected = false
            }
            self?.startSTTButton.isEnabled = true
            self?.autoStopTimer?.invalidate()
        }
    }
    
    @IBAction private func onAllTranscriptionButtonClicked(_ sender: UIButton) {
        Logger.debug()
        self.showAllTranscription()
    }
    
    @IBAction private func onAllConversationButtonClicked(_ sender: UIButton) {
        Logger.debug()
        self.showAllConversation()
    }
    
    @IBAction private func onCharacterCountButtonClicked(_ sender: UIButton) {
        Logger.debug()
//        self.showCharacterCount()
    }
    
    private func showAllTranscription() {
        self.performSegue(withIdentifier: "ShowLog", sender: LogDisplayType.allTranscription)
    }
    
    private func showAllConversation() {
        self.performSegue(withIdentifier: "ShowLog", sender: LogDisplayType.conversation)
    }
    
    private func showAllTranslation() {
        self.performSegue(withIdentifier: "ShowLog", sender: LogDisplayType.translation)
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if let type = sender as? LogDisplayType {
            Logger.debug(type.rawValue)
            let vc = segue.destination as! LogViewController
            vc.logDisplayType = type
        }
    }
    
    @IBAction private func onMuteButtonClicked(_ sender: UIButton) {
        self.isAudioMuted.toggle()
    }
    
    @IBAction private func onMuteVideoBottonClicked(_ sender: UIButton) {
        self.isVideoMuted.toggle()
    }
}

extension ChatRoomViewController: AgoraManagerDelegate {
    func agoraManager(_ mgr: AgoraManager, userJoined uid: UInt) {
        // set to default seat
        // enable to hear other host
        Logger.debug("user \(uid) joined, add to remote user list")
        guard self.guestUidList.contains(uid) else {
            self.guestUidList.append(uid)
            self.agoraMgr.setRemoteVideoView(self.videoView, forUser: uid)
            return
        }
    }
    
    func agoraManager(_ mgr: AgoraManager, userLeaved uid: UInt) {
        print("User \(uid) leaved.")
        if let idx = self.guestUidList.firstIndex(of: uid) {
            self.guestUidList.remove(at: idx)
        }
    }
    
    func agoraManager(_ mgr: AgoraManager, receiveSubtitle subtitle: SubTitle) {
        self.subtitles = STTManager.shared.subtitles
        DispatchQueue.main.async {
            self.subtitleTable.reloadData()
            let indexPath = IndexPath(row: (self.subtitles.count - 1), section: 0)
            self.subtitleTable.scrollToRow(at: indexPath, at: .bottom, animated: true)
            // keyword
            if SettingManager.shared.keywords.waitFinal {
                if subtitle.isFinal {
                    self.identifyKeyword(subtitle.text)
                    self.currentKeyword = ""
                }
            }
            else {
                self.identifyKeyword(subtitle.text)
                if subtitle.isFinal {
                    self.currentKeyword = ""
                }
            }
        }
    }
    
    private func identifyKeyword(_ text: String) {
        guard (currentKeyword.isEmpty) else {
            Logger.debug("text key word \(currentKeyword.count)")
            return
        }
        // gif
        let gifWords = SettingManager.shared.keywords.gifKeyword
        for i in 0..<gifWords.count {
            let str = gifWords[i]
            if text.uppercased().contains(str.uppercased()) {
                // show gif
                Logger.debug("gif keyword detected !")
                self.showHappyBirthdayGif()
                self.currentKeyword = str
                break
            }
        }
        // product
        let productWords = ["Amd", "Corsair", "Intel", "Vizio", "Hisense", "2021", "National", "NFL", "NBA"]
        for i in 0..<productWords.count {
            let str = productWords[i]
            if text.uppercased().contains(str.uppercased()) {
                // show gif
                Logger.debug("product keyword detected !")
                self.showProductInfo(str)
                self.currentKeyword = str
                break
            }
        }
        // popup
        let popupWords = SettingManager.shared.keywords.popupKeyword
        for i in 0..<popupWords.count {
            let str = popupWords[i]
            if text.uppercased().contains(str.uppercased()) {
                // show gif
                Logger.debug("popup keyword detected !")
                self.showPopup()
                self.currentKeyword = str
                break
            }
        }
    }
}

extension ChatRoomViewController {
    private func saveSubtilesToFile(_ fileName: String = "SttResult", subtitle: SubTitle) {
        //
        let fileMgr = FileManager.default
        let filePath = ""
        if fileMgr.fileExists(atPath: filePath) {
            if fileMgr.isWritableFile(atPath: filePath) {
//                fileMgr
            }
        }
        else {
            fileMgr.createFile(atPath: filePath, contents: nil)
        }
        
        // popup
        let listWords = SettingManager.shared.keywords.listKeyWord
        for i in 0..<listWords.count {
            let str = listWords[i]
            if str.uppercased().contains(str.uppercased()) {
                // show gif
                Logger.debug("list keyword detected !")
                self.showList()
                self.currentKeyword = str
                break
            }
        }
    }
    
    private func showHappyBirthdayGif() {
        if let pathStr = Bundle.main.path(forResource: "HappyBirthday", ofType: "gif", inDirectory: "Resource") {
            self.aniImgView = AnimatedImageView(frame: self.view.bounds)
            let aniImg = AnimationImage(path: pathStr)
            self.aniImgView.contentMode = .scaleAspectFit
            self.aniImgView.aImage = aniImg
            self.aniImgView.repeatMode = .once
            self.aniImgView.willShowProgress = false
            self.aniImgView.placeHolder = nil
            self.aniImgView.delegate = self
            self.view.addSubview(self.aniImgView)
        }
    }
    
    private func showProductInfo(_ productId: String) {
        self.prodVc.dismiss(animated: true) { [weak self] in
            self?.prodVc.productId = productId
            if let view = self?.prodVc {
                self?.present(view, animated: true)
            }
        }
    }
    
    private func showPopup() {
        let okAction = UIAlertAction(title: "OK", style: .default) { action in
            Logger.debug("OK")
        }
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel) { action in
            Logger.debug("Cancel")
        }
        self.showAlert(title: "Popup", message: "Display popup because detected \"\(SettingManager.shared.keywords.popupKeyword)\"", actions: [okAction, cancelAction])
    }
    
    private func showList() {
        self.performSegue(withIdentifier: "ShowShop", sender: self)
    }
}

extension ChatRoomViewController: UITableViewDataSource {
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return self.subtitles.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: kSubtitleCellId, for: indexPath) as! STTSubtitleCell
        cell.subtitle = self.subtitles[indexPath.row]
        return cell
    }
}

extension ChatRoomViewController: UITableViewDelegate {
    
}

extension ChatRoomViewController {
    func setLockScreenInfo() {
        UIApplication.shared.beginReceivingRemoteControlEvents()
        Logger.debug("Set lock screen infomation.")
        var info: [String: Any] = [:]
        info[MPMediaItemPropertyTitle] = self.channelName
        info[MPMediaItemPropertyArtist] = "Artist"
        info[MPMediaItemPropertyMediaType] = MPNowPlayingInfoMediaType.audio.rawValue
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
        
        MPRemoteCommandCenter.shared().playCommand.addTarget {event in
          //self.play()
          return .success
        }
        MPRemoteCommandCenter.shared().pauseCommand.addTarget {event in
          //self.pause()
          return .success
        }
        MPRemoteCommandCenter.shared().nextTrackCommand.addTarget {event in
          //self.goForward()
          return .success
        }
        MPRemoteCommandCenter.shared().previousTrackCommand.addTarget {event in
          //self.goBackward()
          return .success
        }
        
        Logger.debug(MPNowPlayingInfoCenter.default().nowPlayingInfo)
    }
    
    override func remoteControlReceived(with event: UIEvent?) {
        if let type = event?.subtype {
            switch type {
            case .remoteControlPlay:
                break
            default:
                break
            }
        }
        
    }
}

extension ChatRoomViewController: AnimatedImageViewDelegate {
    func animatedImageView(_ imageView: AnimatedImageView, didFinishAnimating: Void) {
        Logger.debug()
        imageView.removeFromSuperview()
    }
}

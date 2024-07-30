//
//  STTManager.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2022/05/10.
//

import DarkEggKit
import PromiseKit

enum STTManagerError: Error, Equatable {
    case success(String) // taskId
    case invalidSTTKit
    case invalidUrl
    case invalidToken
    case acquireFailed
    case startFailed
    case conflict(String) // taskId
    case stopFailed
    
    static func == (lhs: STTManagerError, rhs: STTManagerError) -> Bool {
        switch (lhs, rhs) {
        case (.conflict(let ltaskId), .conflict(let rtaskId)):
            return ltaskId == rtaskId
        default:
            return lhs == rhs
        }
    }
}

enum SttTextDataType: String {
    case transcribe
    case translate
}

enum STTManagerState {
    case starting
    case started(taskId: String)
    case stopping
    case stopped
}

class STTManager: NSObject {
    static let shared: STTManager = { STTManager() }()
    
    var subtitles: [SubTitle] = []

    private var sttMode: SttMode = .client
    let clientSttKit = ClientSTTKit.shared
    
    static let baseSttUid: UInt = 940
    
    private var agoraAppId: String!
    
    var state: STTManagerState = .stopped
    var enableRecording: Bool = false
    
    var token: String?
    var taskId: String?
    private var channelName: String? = nil
    
    // for realtime translate test
    var realtimeSourceLang: AgoraSTTLanguage = .english
    var realtimeTargetLang: AgoraSTTLanguage? = nil
    
    func start(channel: String, 
                 language: [AgoraSTTLanguage], 
                 translateLanguages: [AgoraSTTLanguage] = [],
                 enableRecording: Bool = false,
                 completion: ((Bool, STTManagerError?)->Void)? = nil) {
        // TODO:
        state = .starting
        
        realtimeSourceLang = language[0]
        realtimeTargetLang = translateLanguages.count > 0 ? translateLanguages[0] : nil
        
        // 20230510 add translate
        var translanguages: [ClientSTTApiRequestModel.AgoraRTTStartRequestTranslateConfig_Language]? = nil
        if translateLanguages.count > 0 {
            translanguages = []
            for sttLang in language {
                let lang = ClientSTTApiRequestModel.AgoraRTTStartRequestTranslateConfig_Language(source: sttLang.rawValue, target: translateLanguages.map({ l in
                    return l.rawValue
                }))
                translanguages?.append(lang)
            }
        }
        var transConfig: ClientSTTApiRequestModel.AgoraRTTStartRequestTranslateConfig? = nil
        if let a = translanguages {
            transConfig = ClientSTTApiRequestModel.AgoraRTTStartRequestTranslateConfig(languages: a)
        }
        
        var captionConfig: ClientSTTApiRequestModel.AgoraRTTStartRequestCaptionConfig?
        
        self.sttMode.SttKit.start(channel: channel, language: language, captionConfig: captionConfig, tanslateConfig: transConfig) { [weak self] success, error in
            switch error {
            case .success(let taskId):
                Logger.debug("Stert RTT API success, taskId: \(taskId)")
                self?.state = .started(taskId: taskId)
                self?.taskId = taskId
                self?.channelName = channel
                completion?(true, error!)
                break
            case .conflict(let taskId):
                self?.state = .started(taskId: taskId)
                self?.taskId = taskId
                self?.channelName = channel
                completion?(true, error!)
                break
            case .startFailed:
                self?.state = .stopped
                completion?(false, .startFailed)
                break
            default:
                self?.state = .stopped
                completion?(false, .startFailed)
                break
            }
        }
        return
        
    }
    
    func query(channel: String, completion: ((Bool, Error?) -> Void)? = nil) {
        self.sttMode.SttKit.query(channel: channel) { success, error in
            //
        }
    }
    
    func stop(completion: ((Bool, Error?) -> Void)? = nil) {
        self.state = .stopping
        
        guard let channel = self.channelName else {
            self.state = .stopped
            completion?(false, nil)
            return
        }
        
        self.sttMode.SttKit.stop(channel: channel) { [weak self] success, error in
            if (success) {
                self?.state = .stopped
                self?.channelName = nil
                completion?(true, nil)
            }
            else {
                if let taskId = self?.taskId {
                    self?.state = .started(taskId: taskId )
                }
                else {
                    self?.state = .stopped
                }
                completion?(false, nil)
            }
        }
        return
    }
    
    func clearSubtitles() {
        self.subtitles.removeAll()
    }
}

extension STTManager {
    func allTranscription() -> String {
        var result: String = ""
        
        for subtitle in self.subtitles {
            result += subtitle.text + " "
        }
        
        return result
    }
    
    func allConversation() -> String {
        var result: String = ""
        for subtitle in self.subtitles {
            result += "[\(subtitle.uid)]:\n\(subtitle.text)\n"
        }
        return result
    }
    
    func translation() -> String {
        return "TODO"
    }
}

extension STTManager {
    // TextStreamDataParser
    func parseDataToText(data: Data, completion: ((Bool, SubTitle?)->Void)? = nil) {
        //
        guard let sttText = try? SttText.parse(from: data), sttText.uid != 0 else {
            Logger.error("Prase data failed.")
            completion?(false, nil)
            return
        }
        //
        guard let dataType = SttTextDataType(rawValue: sttText.dataType) else {
            Logger.error("Data type unknown.")
            completion?(false, nil)
            return
        }
        //
        switch dataType {
        case .transcribe :
            // transcribe
            var textStr = ""
            var isFinal = false
            var confidence = 0.0
            if let array = (sttText.wordsArray as? [SttWord]), array.count > 0 {
                for w: SttWord in array {
                    textStr += w.text
                    confidence = w.confidence
                    isFinal = isFinal ? true : w.isFinal
                }
            }
            // text is empty
            if textStr.isEmpty {
                Logger.error("No transcription.")
                completion?(false, nil)
                return
            }
            // find last subtitle object that needs update
            if let lastOne = self.subtitles.last(where: { el in
                let flag = ((el.uid == sttText.uid) && (!el.isFinal))
                return flag
            }) {
                lastOne.text = textStr
                lastOne.isFinal = isFinal
                lastOne.time = sttText.time + Int64(sttText.durationMs)
                //lastOne.refreshTag = 't_' + text.time + text.durationMs
                lastOne.textTs = sttText.textTs
            }
            else {
                let subtitle = SubTitle()
                subtitle.uid = UInt(sttText.uid)
                subtitle.text = textStr
                subtitle.isFinal = isFinal
                subtitle.time = sttText.time
                subtitle.durationMs = sttText.durationMs
                subtitle.textTs = sttText.textTs
                self.subtitles.append(subtitle)
                //self.appendSubtitle(subtitle: subtitle)
                completion?(true, subtitle)
            }
            break;
        case .translate :
            // translate
            //var transTextStr = ""
            var isFinalTrans = false
            // find last subtitle
            guard let lastOne = self.subtitles.last(where: { el in
                let flag = ((el.uid == sttText.uid) && (el.textTs == sttText.textTs))
                return flag
            }) else {
                Logger.error("No transcription.")
                completion?(false, nil)
                return
            }
            if let transArray = (sttText.transArray as? [SttTranslation]), transArray.count > 0 {
                for item: SttTranslation in transArray {
                    Logger.debug("Translation: \(item.lang ?? "--"), \(item.isFinal)")
                    
                    //guard let tran = lastOne.translation[item.lang] else {
                    lastOne.translation[item.lang] = (item.textsArray as NSArray as! [String]).joined()
                    //}
                    isFinalTrans = isFinalTrans ? true : item.isFinal
                    lastOne.isTranslateFinal = isFinalTrans
                    lastOne.isFinal = isFinalTrans
                    lastOne.time = sttText.time + Int64(sttText.durationMs)
                    lastOne.textTs = sttText.textTs
                    completion?(true, lastOne)
                }
            }
            break
        default:
            // unknown
            completion?(false, nil)
            return
        }
    }
}

extension STTManager {
    private func updateSubtitleList(_ rttData: SttText, completion: ((Bool, SubTitle?)->Void)? = nil) {
        Logger.debug()
        guard let type = SttTextDataType(rawValue: rttData.dataType) else {
            return
        }
        switch type {
        case .transcribe:
            // find last subtitle same uid and same time
            var textStr = ""
            rttData.wordsArray.forEach { el in
                textStr += (el as? SttWord)?.text ?? ""
            }
            if let subtitle = self.subtitles.last(where: { s in
                return s.uid == rttData.uid && s.time == 0 && !(s.isFinal) //rttData.time
            }) {
                subtitle.text = textStr
                subtitle.isFinal = (rttData.wordsArray.lastObject as? SttWord)?.isFinal ?? false
                completion?(true, subtitle)
            }
            else {
                let subtitle = SubTitle()
                subtitle.uid = UInt(rttData.uid)
                subtitle.text = textStr
                subtitle.isFinal = false
                subtitle.time = rttData.time
                subtitle.durationMs = rttData.durationMs
                self.subtitles.append(subtitle)
                completion?(true, subtitle)
            }
            // send update UI event
            break
        case .translate:
            break
        }
    }
    
    private func updateTranscription(text: SttText, subtitle: SubTitle) {
        // transcribe
        // stt
        var textStr = ""
        var isFinal = false
        if let array = (text.wordsArray as? [SttWord]), array.count > 0 {
            for item: SttWord in array {
                textStr += item.text
                isFinal = isFinal ? true : item.isFinal
            }
        }
        if !textStr.isEmpty {
            let subtitle = SubTitle()
            subtitle.uid = UInt(text.uid)
            subtitle.text = textStr
            subtitle.isFinal = isFinal
            subtitle.time = text.time
            subtitle.durationMs = text.durationMs
            //self.appendSubtitle(subtitle: subtitle)
            //completion?(true, subtitle)
        }
    }
    
    private func updateTranslation(subtitle: SubTitle) {
        
    }
}

extension STTManager {
    func getCharacterCount() -> (Int, Int) {
        var textCharCount: Int = 0
        var translationCharCount: Int = 0
        self.subtitles.forEach { el in
            textCharCount += el.text.utf8.count
            el.translation.forEach { (key: String, value: String) in
                translationCharCount += value.utf8.count
            }
        }
        
        return (textCharCount, translationCharCount)
    }
}

enum RTTError: Error {
    case alreadyStarted // RTT Task already started
}

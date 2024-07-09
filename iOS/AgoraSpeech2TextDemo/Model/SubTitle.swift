//
//  SubTitle.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2023/03/14.
//

import DarkEggKit

struct TranslationItem {
    var lang: String
    var text: String
}

@objc class SubTitle: NSObject {
    var uid: UInt = 0 {
        didSet {
            self.nickname = AgoraRtmManager.shared.nicknameDict[uid] ?? "N/A"
        }
    }
    var nickname: String = ""
    var text: String = ""
    var isFinal: Bool = false
    var isTranslateFinal = false
    
    var isTranslate: Bool = false
    var translation: [String: String] = [:]
    var time: Int64 = 0
    var durationMs: Int32 = 0
    var textTs: Int64 = 0
    
    private var realtimeTranslateTrigger: Timer?
    
    func update(text: String, isFinal: Bool, time: Int64 = 0, duration: Int32 = 0) {
        self.text = text
        self.isFinal = isFinal
        self.time = time
        self.durationMs = duration
        if isTranslateFinal {
            return
        }
        guard SettingManager.shared.keywords.realtimeTranslation else {
            //Logger.debug("Real time translation is OFF.")
            return
        }
        guard realtimeTranslateTrigger == nil else {
            //Logger.debug("[1018] not 2 sec")
            return
        }
    }
    
//    func update(translationText: [String]) {
//        self.translation.removeAll()
//        // self.translation += ["[AG]"]
//        self.translation += translationText
//        self.isTranslateFinal = true
//        //Logger.debug("[1018] translation final")
//    }
}

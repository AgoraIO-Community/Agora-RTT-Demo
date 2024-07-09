//
//  RTTConfig.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2024/01/02.
//

import Foundation

class RTTConfig {
    // Realtime transcription
    var lanaguages: [AgoraSTTLanguage] = []
    var translations: [[AgoraSTTLanguage: [AgoraSTTLanguage]]] = []
    var enableRec: Bool = false
    
    // Offline transcription (with cloud recording)
    var recLanguage: String = "auto"
    var recFormat: String = "txt"
}



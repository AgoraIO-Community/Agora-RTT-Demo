//
//  ServerSTTApiRequestModel.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2023/03/09.
//

import Foundation

/// Server STT Api Request Model
class ServerSTTApiRequestModel {
    /// Start
    struct Start: CommonRequestModel {
        var languages: [AgoraSTTLanguage]
        var channelName: String
        var enableRecoder: Bool = false
    }
    
    /// Query
    struct Query: CommonRequestModel {
        
    }
    
    /// Stop
    struct Stop: CommonRequestModel {
        var channelName: String
        var taskId: String
    }
    
    /// Generate Rtc Token
    struct RtcToken: CommonRequestModel {
        var channelName: String
        var uid: UInt
        var role: Int = 2
    }
}

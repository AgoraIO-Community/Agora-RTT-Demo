//
//  STTProtocol.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2023/03/10.
//

import Foundation

protocol STTProtocol {
    func start(channel: String,
               language: [AgoraSTTLanguage],
               captionConfig : ClientSTTApiRequestModel.AgoraRTTStartRequestCaptionConfig?,
               tanslateConfig: ClientSTTApiRequestModel.AgoraRTTStartRequestTranslateConfig?,
               completion: ((Bool, STTManagerError?)->Void)?)
    func query(channel: String, completion: ((Bool, STTManagerError?)->Void)?)
    func stop(channel: String, completion: ((Bool, STTManagerError?)->Void)?)
}

extension STTProtocol {
    func start(channel: String, language: [AgoraSTTLanguage] = [.english],
                 captionConfig : ClientSTTApiRequestModel.AgoraRTTStartRequestCaptionConfig? = nil,
                 tanslateConfig: ClientSTTApiRequestModel.AgoraRTTStartRequestTranslateConfig? = nil,
                 completion: ((Bool, STTManagerError?)->Void)? = nil) {
        completion?(false, .invalidSTTKit)
    }
        
    func query(channel: String, completion: ((Bool, STTManagerError?)->Void)? = nil) {
        completion?(false, .invalidSTTKit)
    }
    
    func stop(channel: String, completion: ((Bool, STTManagerError?)->Void)? = nil) {
        completion?(false, .invalidSTTKit)
    }
}

/// STT mode,
///     Run in client app
///     or
///     Run on server
enum SttMode: String, CaseIterable {
    case client
    
    var SttKit: STTProtocol {
        switch self {
        case .client:
            return ClientSTTKit.shared
        }
    }
}

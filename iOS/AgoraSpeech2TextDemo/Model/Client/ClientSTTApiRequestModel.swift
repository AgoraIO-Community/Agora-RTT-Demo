//
//  ClientSTTApiRequestModelV2.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2024/01/02.
//

import Foundation

/// Max language count, now is 2
let maxLanguageCount: Int = 2

/// config.recognizeConfig.language
enum AgoraSTTLanguage: String, Codable, CaseIterable {
    case english    = "en-US"   // English - US
    case englishIn  = "en-IN"   // English - India
    case japanese   = "ja-JP"   // Japanese - Japan
    case chinese    = "zh-CN"   // Chiness - China Mainland
    case chineseTw  = "zh-TW"   // Chinese - Taiwanese Putonghua
    case Cantonese  = "zh-HK"   // Chinese - Cantonese, Traditional
    case hindi      = "hi-IN"   // Hindi = India
    case korean     = "ko-KR"   // Korean - South Korea
    case German     = "de-DE"   // German - Germany
    case Spanish    = "es-ES"   // Spanish - Spain
    case French     = "fr-FR"   // French = France
    case Italian    = "it-IT"   // Italian - Italy
    case Portuguese = "pt-PT"   // Portuguese - Portugal
    case Indonesian = "id-ID"   // Indonesian - Indonesia
    case Arabic_JO  = "ar-JO"   // Arabic - Jordan
    case Arabic_EG  = "ar-EG"   // Arabic - Egyptian
    case Arabic_SA  = "ar-SA"   // Arabic - Saudi Arabia
    case Arabic_AE  = "ar-AE"   // Arabic - United Arab Emirates
    
    var displayName: String {
        return NSLocalizedString(self.rawValue, comment: "")
    }
}

// 20230209
// create language param string, for 2 languages
extension [AgoraSTTLanguage] {
    func paramString() -> String {
        var result = ""
        for (index, item) in self.enumerated() {
            result.append("\(item.rawValue)")
            if index < self.count - 1 {
                result.append(",")
            }
        }
        return result
    }
    
    func stringArray() -> [String] {
        var result: [String] = []
        for (index, item) in self.enumerated() {
            result.append("\(item.rawValue)")
        }
        return result
    }
}

// 20231229
/// Client STT API Request Model
class ClientSTTApiRequestModel {
    class func setCaptionConfig(accessKey: String, secretKey: String, bucket: String, vendor: Int, region: Int, fileNamePrefix: [String]) -> AgoraRTTStartRequestCaptionConfig {
        var captionConfig = AgoraRTTStartRequestCaptionConfig()
        captionConfig.storage = AgoraRTTStartRequestCaptionConfig_Storage()
        captionConfig.storage?.accessKey = accessKey
        captionConfig.storage?.secretKey = secretKey
        captionConfig.storage?.bucket = bucket
        captionConfig.storage?.vendor = vendor
        captionConfig.storage?.region = region
        captionConfig.storage?.fileNamePrefix = fileNamePrefix
        return captionConfig
    }
    
    /// Start request body
    struct Strat: CommonRequestModel {
        var languages: [String]
        var maxIdleTime: Int = 60
        var rtcConfig: AgoraRTTStartRequestRtcConfig!
        var translateConfig: AgoraRTTStartRequestTranslateConfig?
        var captionConfig: AgoraRTTStartRequestCaptionConfig?
        
        init(channelName: String,
             language: [String],
             audioUid: String,
             audioToken: String? = nil,
             dataStreamUid: String,
             dataStreamToken: String? = nil) {
            
            self.languages = language
            // rtcConfig
            self.rtcConfig = AgoraRTTStartRequestRtcConfig()
            self.rtcConfig.channelName = channelName
            self.rtcConfig.subBotUid = audioUid
            self.rtcConfig.subBotToken = audioToken
            self.rtcConfig.pubBotUid = dataStreamUid
            self.rtcConfig.pubBotToken = dataStreamToken
        }
    }
    
    struct AgoraRTTStartRequestRtcConfig: Codable {
        var channelName: String!
        var subBotUid: String!
        var subBotToken: String?
        var pubBotUid: String!
        var pubBotToken: String?
        //
        var decryptionMode: String?
        var cryptionMode: Int?
        var secret: String?
        var salt: String?
    }
    
    // Translation
    struct AgoraRTTStartRequestTranslateConfig: Codable {
        var languages: [AgoraRTTStartRequestTranslateConfig_Language]
    }
    
    struct AgoraRTTStartRequestTranslateConfig_Language: Codable {
        var source: String
        var target: [String]
    }
    
    // Caption
    struct AgoraRTTStartRequestCaptionConfig: Codable {
        var storage: AgoraRTTStartRequestCaptionConfig_Storage?
    }
    
    struct AgoraRTTStartRequestCaptionConfig_Storage: Codable {
        var accessKey: String?
        var secretKey: String?
        var bucket: String?
        var vendor: Int?
        var region: Int?
        var fileNamePrefix: [String?]?
    }
}

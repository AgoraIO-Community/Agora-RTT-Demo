//
//  AppConfig.swift
//  Radio3DAudioSample
//
//  Created by Yuhua Hu on 2022/02/25.
//

import Foundation
import DarkEggKit

// Agora config keys
private let kAgoraConfig: String            = "AgoraConfig"
private let kAgoraAppNameKey: String        = "AppId"
private let kAgoraAppCertificate: String    = "AppCertificate"

// default agora setting strings
private let DefaultAgoraAppId: String           = <#Agora App Id#> // Agora App Id
private let DefaultAgoraBasicAuthKey: String    = <#Agora Basic Auth Key#> // Agora Basic Auth Key (for RESFful API, if need)
private let DefaultAgoraBasicAuthSecret: String = <#Agora Basic Auth Secret#> // Agora Basic Auth Secret (for RESFful API, if need)

// default STT config
private let ProductSTTBaseUrl: String   = <#Product API Base URL#>
private let DefaultSTTAppId: String     = <#Same as Agora App Id#>

// default AgoraChat config

/// struct for agora config
struct AgoraConfig: Codable {
    //var appName: String
    var appId: String
    //var token: String
    var basicAuthKey: String? = nil
    var basicAuthSecret: String? = nil
    var basicAuthToken: String? {
        guard let key = basicAuthKey, let secert = basicAuthSecret else {
            return nil
        }
        let token = "\(key):\(secert)".data(using: .utf8)?.base64EncodedString(options: [])
        return token
    }
}

///struct for agora chat config
struct AgoraChatConfig: Codable {
    var appKey: String
}

struct STTConfig: Codable {
    var baseUrl: String
    var appId: String
}

class AppConfig {
    private let decoder = JSONDecoder() 
    private let encoder = JSONEncoder()
    
    private let defaultAgoraConfig = AgoraConfig(appId: DefaultAgoraAppId,
                                                 basicAuthKey: DefaultAgoraBasicAuthKey,
                                                 basicAuthSecret: DefaultAgoraBasicAuthSecret)
    private let defaultSTTConfig = STTConfig(baseUrl: ProductSTTBaseUrl, appId: DefaultSTTAppId)
    
    static let shared: AppConfig = {AppConfig()}()
    
    /// agora config
    lazy var agora: AgoraConfig = {
        guard let dict = Bundle.main.object(forInfoDictionaryKey: kAgoraConfig) as? [String: String],
              let data = try? encoder.encode(dict),
              let config = try? decoder.decode(AgoraConfig.self, from: data) else {
            return self.defaultAgoraConfig
        }
        return config
    }()
    
    lazy var sttConfig: STTConfig = {
        return defaultSTTConfig
    }()
}

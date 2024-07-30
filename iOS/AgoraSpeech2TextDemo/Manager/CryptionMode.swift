//
//  CryptionMode.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2024/01/24.
//

import AgoraRtcKit

// 'AES_128_XTS': 1, 'AES_256_XTS': 3, 'AES_128_ECB': 2, 'SM4_128_ECB': 4,
// 'AES_128_GCM': 5, 'AES_256_GCM': 6, 'AES_128_GCM2': 7, 'AES_256_GCM2': 8

enum CryptionModes: Int {
    case NONE = 0
    case AES128XTS = 1
    case AES256XTS = 2
    case AES128ECB = 3
    case SM4128ECB = 4
    case AES128GCM = 5
    case AES256GCM = 6
    case AES128GCM2 = 7
    case AES256GCM2 = 8
    
    func agoraEncryptionMode() -> AgoraEncryptionMode {
        let ret = AgoraEncryptionMode(rawValue: self.rawValue)!
        return ret
    }
    
    func secret() -> String {
        switch self {
        case .NONE:
            return ""
        default:
            return "<secret>"
        }
    }
    
    func salt() -> String?  {
        switch self {
        case .AES128GCM2, .AES256GCM2:
            return "<salt>"
        default:
            return nil
        }
    }
}

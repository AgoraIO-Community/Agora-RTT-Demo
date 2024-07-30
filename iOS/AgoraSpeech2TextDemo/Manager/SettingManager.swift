//
//  SettingManager.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2023/06/07.
//

import Foundation
import DarkEggKit

// MARK: Types
enum KeychainError: Error {
    case noData
    case unexpectedData
    case unhandledError(status: OSStatus)
}

class SettingManager {
    static let shared: SettingManager = { SettingManager()}()
    let decoder = JSONDecoder()
    let encoder = JSONEncoder()
    let userDefault = UserDefaults.standard
    var keywords: KeywordsModel = KeywordsModel()
}

extension SettingManager {
    func loadKeywords() {
        guard let data = userDefault.value(forKey: "keywords") as? Data, let result = try? decoder.decode(KeywordsModel.self, from: data) else {
            self.keywords = KeywordsModel()
            return
        }
        self.keywords = result
    }
    
    func saveKeywords() {
        let data = try! encoder.encode(self.keywords)
        userDefault.setValue(data, forKey: "keywords")
//        userDefault.synchronize()
    }
}

class KeywordsModel: Codable {
    var gifKeyword: [String] = ["Happy Birthday"]
    var popupKeyword: [String] = []
    var listKeyWord: [String] = []
    var waitFinal: Bool = false
    var autoStopTime: Float = 3.0
    var realtimeTranslation: Bool = true
    var realtimeInterval: Float = 1.0
    var serverType: Int = 0
}

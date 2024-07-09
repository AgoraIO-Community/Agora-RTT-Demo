//
//  SubtitleLogManager.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2023/05/08.
//

import Foundation

class SubtitleLogManger: NSObject {
    static let shared: SubtitleLogManger = {return SubtitleLogManger()}()
    
    func start(taskId: String) {
        // create file
        // yyyyMMddHHmmSS+TaskId
        let filename = "" + taskId
        
    }
    
    func add(subtitle: SubTitle) {
        
    }
    
    func stop() {
        
    }
}

extension SubtitleLogManger {
    private func isFileExisted(_ filepath: String) -> Bool {
        return false
    }
}

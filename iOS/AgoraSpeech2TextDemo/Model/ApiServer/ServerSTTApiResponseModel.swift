//
//  ServerSTTApiResponseModel.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2023/03/09.
//

import Foundation

class ServerSTTApiResponseModel {
    /// Start
    struct Start: CommonResponseModel {
        var subtitleUid: UInt?
        var taskId: String?
        var createTs: Int?
        var status: String?
        var message: String?
    }
    
    /// Query Response Model
    struct Query: CommonResponseModel {
        
    }
    
    /// Delete
    struct Stop: CommonResponseModel {
        
    }
    
    /// RtcToken
    struct RtcToken: CommonResponseModel {
        var token: String?
    }
}

//
//  ClientSTTApiResponseModel.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2022/12/05.
//

/// Client STT API Response Model
class ClientSTTApiResponseModel {
    /// Acquire
    struct Acquire: CommonResponseModel {
        var tokenName: String?
        var createTs: Int?
    }
    
    /// Start
    struct Start: CommonResponseModel {
        var taskId: String?
        var status: String?
    }
    
    /// Query
    struct Query: CommonResponseModel {
        var taskId: String?
        var createTs: Int?
        var status: String?
    }
    
    /// Stop
    struct Stop: CommonResponseModel {
        
    }
}

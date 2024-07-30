//
//  ClientSTTApi.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2022/05/10.
//

import Alamofire

class ClientSTTApi {
    /// Acquire
    struct Acquire: CommonApiProtocol {
        typealias ResponseObject = ClientSTTApiResponseModel.Acquire
        
        let method: HTTPMethod = .post
        var parameter: [String : Any]?
        var header: [String : String]?
        var cancelToken: String?
        
        init() {
            fatalError("must set AppId.")
        }
        
        let appId: String
        init(appId: String) {
            self.appId = appId
        }
        var endpoint: String {
            "v1/projects/\(appId)/rtsc/speech-to-text/builderTokens"
        }
    }
    
    /// Start
    struct Start: CommonApiProtocol {
        typealias ResponseObject = ClientSTTApiResponseModel.Start
        
        let method: HTTPMethod = .post
        var parameter: [String : Any]?
        var header: [String : String]?
        var cancelToken: String?
        
        init() {
            fatalError("must set AppId.")
        }
        
        let appId: String
        let token: String
        init(appId: String, token: String) {
            self.appId = appId
            self.token = token
        }
        var endpoint: String {
            "v1/projects/\(appId)/rtsc/speech-to-text/tasks?builderToken=\(token)"
        }
        
    }
    
    /// Query
    struct Query: CommonApiProtocol {
        typealias ResponseObject = ClientSTTApiResponseModel.Query
        
        let method: HTTPMethod = .get
        var parameter: [String : Any]?
        var header: [String : String]?
        var cancelToken: String?
        
        init() {
            fatalError("must set appId, token, taskId")
        }
        
        let appId: String
        let token: String
        let taskId: String
        init(appId: String, token: String, taskId: String) {
            self.appId = appId
            self.token = token
            self.taskId = taskId
        }
        var endpoint: String {
            "v1/projects/\(appId)/rtsc/speech-to-text/tasks/\(taskId)?builderToken=\(token)"
        }
    }
    
    /// Stop
    struct Stop: CommonApiProtocol {
        typealias ResponseObject = ClientSTTApiResponseModel.Stop
        
        let method: HTTPMethod = .delete
        var parameter: [String : Any]?
        var header: [String : String]?
        var cancelToken: String?
        
        init() {
            fatalError("must set appId, token, taskId")
        }
        
        let appId: String
        let token: String
        let taskId: String
        init(appId: String, token: String, taskId: String) {
            self.appId = appId
            self.token = token
            self.taskId = taskId
        }
        var endpoint: String {
            "v1/projects/\(appId)/rtsc/speech-to-text/tasks/\(taskId)?builderToken=\(token)"
        }
    }
}

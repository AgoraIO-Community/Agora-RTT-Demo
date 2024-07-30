//
//  ServerSTTApi.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2023/03/09.
//

import Alamofire

class ServerSTTApi {
    struct Start: CommonApiProtocol {
        typealias ResponseObject = ServerSTTApiResponseModel.Start
        var endpoint: String = "STT/start"
        var method: Alamofire.HTTPMethod = .post
        var cancelToken: String?
        var parameter: [String : Any]?
        var header: [String : String]?
    }
    
    struct Query: CommonApiProtocol {
        typealias ResponseObject = ServerSTTApiResponseModel.Query
        var endpoint: String = "STT/query"
        var method: Alamofire.HTTPMethod = .get
        var cancelToken: String?
        var parameter: [String : Any]?
        var header: [String : String]?
    }
    
    struct Stop: CommonApiProtocol {
        typealias ResponseObject = ServerSTTApiResponseModel.Stop
        var endpoint: String = "STT/stop"
        var method: Alamofire.HTTPMethod = .post
        var cancelToken: String?
        var parameter: [String : Any]?
        var header: [String : String]?
    }
    
    struct RtcToken: CommonApiProtocol {
        typealias ResponseObject = ServerSTTApiResponseModel.RtcToken
        var endpoint: String = "STT/rtctoken"
        var method: Alamofire.HTTPMethod = .post
        var cancelToken: String?
        var parameter: [String : Any]?
        var header: [String : String]?
    }
}

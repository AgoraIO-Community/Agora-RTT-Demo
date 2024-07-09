//
//  APICaller.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2022/05/10.
//

import Foundation
import UIKit
import DarkEggKit
import PromiseKit
import Alamofire

// MARK: - keys and default values
private let kContentTypeKey     = "Content-Type"
private let kContentType        = "application/json"
private let kUserAgentKey       = "User-Agent"
private let kAcceptLanguageKey  = "Accept-Language"
private let kAuthorizationKey   = "Authorization"
private let kAuthorization      = "Bearer"
private let kBasicAuthWord      = "Basic"
private let kDevicePlatformKey  = "devicePlatform"
private let kDevicePlatform     = "iOS"
private let kDeviceIdKey        = "deviceId"

struct HttpResponseStatusCode {
    static let success: Int     = 200
    static let notFound: Int    = 404
    static let needsUpate: Int  = 426
}

class ApiCaller: NSObject {
    // MARK: - Singleton
    static let shared: ApiCaller = {ApiCaller()}();
    
    internal var authToken: String?
    
    private var kUserAgent: String = {
        let osVersion = UIDevice.current.systemVersion
        let deviceName = UIDevice.modelName
        let appVersionBuild = Bundle.main.infoDictionary?[kCFBundleVersionKey as String] ?? ""
        let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] ?? ""
        let userAgentStr = "Device:\(deviceName),OS:iOS,OSVersion:\(osVersion),App:\(appVersion)"
        return userAgentStr
    }()
    
    var requestQueue: [String: DataRequest] = [:]
    
    lazy var SystemLanguage: String = {
        let preferredLang = Bundle.main.preferredLocalizations.first ?? "en"
        Logger.debug("current system language: \(preferredLang)")
        switch preferredLang {
        case "en-US", "en":
            return preferredLang
        case "ja-JP", "ja":
            return preferredLang
        default:
            return "en"
        }
    }()
}

extension ApiCaller {
    internal func callApi<API: CommonApiProtocol, T: Codable>(api: API, apiUrl: String = AppConfig.shared.sttConfig.baseUrl) -> Promise<T> {
        var header = [kContentTypeKey: kContentType, kUserAgentKey: kUserAgent, kAcceptLanguageKey: SystemLanguage]
        
        // token auth
        if let token = self.authToken, api.header?[kAuthorizationKey] == nil {
            header[kAuthorizationKey] = "\(kAuthorization) \(token)"
        }
        
        if let h = api.header {
            for key in h.keys {
                header[key] = h[key]
            }
        }
        
        // basic auth
        if let basicAuthStr = AppConfig.shared.agora.basicAuthToken, !basicAuthStr.isEmpty, api.header?[kAuthorizationKey] == nil {
            header[kAuthorizationKey] = "\(kBasicAuthWord) \(basicAuthStr)"
        }

//        if let deviceId = DeviceManager.shared.deviceId {
//            header[kDeviceIdKey] = deviceId
//        }
        let q = DispatchQueue.global()
        var param = api.parameter
//        if param != nil {
//            param![kDevicePlatformKey] = kDevicePlatform
//        }
//        else {
//            param = [kAuthorizationKey: kDevicePlatform]
//        }
        
        var encoding: ParameterEncoding = JSONEncoding.default
        if api.method == .get {
            //encoding = URLEncoding.default
            encoding = URLEncoding(boolEncoding: .literal)
        }
        if api.method == .delete {
            param = nil
        }
        if param?[arrayParamKey] != nil {
            encoding = ArrayEncoding()
        }
        let url = "\(apiUrl)/\(api.endpoint)"
        let request = Alamofire.request(url, method: api.method, parameters: param, encoding: encoding, headers: header)
        
        if let cancelToken = api.cancelToken {
            self.requestQueue[cancelToken] = request
        }
        Logger.debug("request \(api.method) url: \(url)")
        let s = String(data: request.request?.httpBody ?? Data(), encoding: .utf8)
        Logger.debug("request body: \(s ?? "")")
        //return request.responseDecodable(T.self, queue: q)
        return Promise { seal in
            request.validate().response(queue: q) { (response) in
                // request end, remove from cancel queue
                if let cancelToken = api.cancelToken {
                    self.requestQueue[cancelToken] = nil
                    self.requestQueue.removeValue(forKey: cancelToken)
                }
                
                guard let statusCode = response.response?.statusCode else {
                    seal.reject(APIError.unknown)
                    return
                }
                
                Logger.error("response.response?.statusCode: \(statusCode)")
                // Logger.error("response.response?.: \(response.response)")
                
                // 404
                if statusCode == HttpStatusCodes.notFound.rawValue {
                    seal.reject(APIError.noData)
                    return
                }
                
                let decoder = JSONDecoder()
                
                guard statusCode == HttpStatusCodes.success.rawValue || statusCode == HttpStatusCodes.created.rawValue else {
                    if let a = response.data {
                        if let err = try? decoder.decode(ApiErrorModel.self, from: a) {
                            seal.reject(APIError.serverError(statusCode, err))
                            return
                        }
                        if let t = try? decoder.decode(T.self, from: a) {
//                            if let err = t as? ApiErrorModel {
                                seal.reject(APIError.serverError(statusCode, t))
//                            }
                            return
                        }
                    }
                    seal.reject(APIError.unknown)
                    return
                }
                
                // Special for VoidObject
                if T.self == VoidModel.self {
                    let tempData = "{}".data(using: .utf8)!
                    if let voidObj = try? decoder.decode(T.self, from: tempData) {
                        seal.fulfill(voidObj)
                    }
                    else {
                        seal.reject(APIError.noData)
                    }
                    return
                }
                
                // Normal response
                if let data = response.data {
                    //let tempStr = String(data: data, encoding: .utf8)
                    //Logger.debug(tempStr ?? "None")
                    if let t = try? decoder.decode(T.self, from: data) {
                        seal.fulfill(t)
                    }
                    else {
                        seal.reject(APIError.noData)
                    }
                }
            }
        }
    }
    
    internal func cancelApi(token cancelToken: String?) {
        guard let key = cancelToken else {
            return
        }
        if let request = self.requestQueue[key] {
            request.cancel()
            self.requestQueue[key] = nil
            self.requestQueue.removeValue(forKey: key)
        }
    }
}

// extension
let arrayParamKey = "arrayParametersKey"
extension Array {
    func asParameters() -> Parameters {
        return [arrayParamKey: self]
    }
}

public struct ArrayEncoding: ParameterEncoding {
    
    /// The options for writing the parameters as JSON data.
    public let options: JSONSerialization.WritingOptions
    
    
    /// Creates a new instance of the encoding using the given options
    ///
    /// - parameter options: The options used to encode the json. Default is `[]`
    ///
    /// - returns: The new instance
    public init(options: JSONSerialization.WritingOptions = []) {
        self.options = options
    }
    
    public func encode(_ urlRequest: Alamofire.URLRequestConvertible, with parameters: Parameters?) throws -> URLRequest {
        var urlRequest = try urlRequest.asURLRequest()
        
        guard let parameters = parameters,
              let array = parameters[arrayParamKey] else {
            return urlRequest
        }
        
        do {
            let data = try JSONSerialization.data(withJSONObject: array, options: options)
            
            if urlRequest.value(forHTTPHeaderField: "Content-Type") == nil {
                urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
            }
            
            urlRequest.httpBody = data
            
        } catch {
            throw AFError.parameterEncodingFailed(reason: .jsonEncodingFailed(error: error))
        }
        
        return urlRequest
    }
}


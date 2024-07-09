//
//  ApiCommon.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2022/05/10.
//

//import UIKit
import PromiseKit

enum HttpCode: Int {
    case success = 200
    case notFound = 404
    case needUpdate = 426
}

// MARK: -
protocol CommonApiProtocol {
    // MARK: - required
    associatedtype ResponseObject: Codable
    var endpoint: String { get }
    var method: HTTPMethod { get }
    // MARK: - option
    var parameter: [String: Any]? { get set }
    var cancelToken: String? { get set }
    
    // for dummy data
    var dummyFile: String? { get }
    // for header
    var header: [String: String]?  { get set }
    
    init()
    func request(serverUrl: String) -> Promise<ResponseObject>
}

extension CommonApiProtocol {
    init(_ parameter: [String: Any]? = nil, header: [String:String]? = nil) {
        self.init()
        self.parameter = parameter
        self.header = header
    }
    
    var parameter: [String: Any]? {
        get { return [:] }
        set {}
    }
    
    mutating func setCancelToken(_ cancelToken: String) {
        self.cancelToken = cancelToken
    }
    
    var dummyFile: String? {
        get { return nil }
    }
    
    var header: [String: String]? {
        get { return nil }
    }
    
    func request(serverUrl: String = AppConfig.shared.sttConfig.baseUrl) -> Promise<ResponseObject> {
        return ApiCaller.shared.callApi(api: self, apiUrl: serverUrl)
    }
    
    func dummyData() -> Promise<ResponseObject> {
        return Promise { seal in
            do {
                // check dummy file name
                guard let file = self.dummyFile else {
                    throw APIError.noData
                }
                // check file path
                guard let jsonPath = Bundle.main.path(forResource: file, ofType: nil) else {
                    throw APIError.noData
                }
                // load dummy data
                let decoder = JSONDecoder()
                let data = try Data(contentsOf: URL(fileURLWithPath: jsonPath))
                let res = try decoder.decode(ResponseObject.self, from: data)
                seal.fulfill(res)
            }
            catch {
                seal.reject(error)
            }
        }
    }
}

// MARK: -
public typealias HttpStatusCode = Int

// MARK: -
enum APIError: Error {
    case noData
    case serverError(HttpStatusCode, Codable)
    case unknown
}

enum HttpStatusCodes: HttpStatusCode {
    case success = 200
    case created = 201
    case notFound = 404
}

// EOF
